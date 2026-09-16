# Authentik and Entra ID Integration Proposal

## Purpose

This proposal defines a repeatable identity architecture for applications connected to Authentik. It addresses:

- Entra ID user and group provisioning;
- consistent SSO and MFA across applications;
- onboarding additional applications without rebuilding the identity model; and
- two MFA alternatives: Duo MFA or Entra MFA.

This is a design proposal only. It does not change Authentik, Entra ID, Duo, application configuration, or deployment state.

## Design principles

1. **Use Entra ID as the organizational identity source.** Users already have Entra accounts, so Authentik should not require a separate password for normal users.
2. **Use SCIM for lifecycle and group provisioning.** SCIM keeps users and groups synchronized before login and avoids depending on large group claims or per-login Graph synchronization.
3. **Use one common Authentik authentication experience.** Applications should reuse the same authentication flow and branding wherever their protocol permits.
4. **Keep application authorization in Authentik.** Authentik groups and application bindings remain the stable contract for applications, even when Entra is the source of group membership.
5. **Preserve a break-glass path.** A local Authentik administrator account must remain available until the replacement path is tested and accepted.
6. **Add applications from a repeatable template.** A new application should require a provider, redirect URI, application binding, and only the claims that application actually needs—not a new identity design.

## Common architecture

Both MFA options use the same provisioning and application-facing structure:

```text
Entra ID
  ├─ SCIM ───────────────► Authentik users and groups
  └─ OIDC primary login ─► Authentik authentication flow
                                  │
                                  ▼
                         MFA option selected below
                                  │
                                  ▼
                    Existing Authentik application/provider
                                  │
                                  ▼
                              Application
```

### SCIM provisioning

Create one Authentik SCIM source and one Entra enterprise application for provisioning. Begin with an explicitly assigned pilot group rather than synchronizing the entire tenant immediately.

SCIM should provision:

- users;
- the small set of shared authorization groups; and
- any deliberately selected application-specific groups.

The Entra OIDC source should not perform interactive group synchronization through Microsoft Graph when SCIM is the authoritative provisioning path. This avoids login-time group discovery delays and reduces exposure to Entra group-claim overage behavior.

### Group model

Prefer a small stable baseline, for example:

```text
org-users
org-operators
org-administrators
```

Add application-specific groups only when required:

```text
termix-users
termix-administrators
```

Do not emit every Entra group to every application by default. Bind each Authentik application to the groups that grant access and expose only the claims the relying party needs.

## Option A: Entra primary authentication with Duo MFA

### User flow

```text
Application
  → Authentik
  → Continue with Entra ID
  → Entra authenticates the user
  → Authentik validates the enrolled Duo authenticator
  → Authentik issues the application session
```

### Authentik design

- Entra OIDC source provides primary authentication.
- A common Authentik authentication flow contains the Duo authenticator validation stage.
- Existing applications continue using their current Authentik providers and bindings.
- Local credentials remain available for break-glass administration.
- Users do not need an Authentik password for normal access.

### Advantages

- Duo remains the organization’s MFA control.
- MFA is centralized in Authentik and can be consistent across applications.
- Entra remains responsible for primary identity and lifecycle.
- Existing application integrations can remain unchanged at the provider level.

### Trade-offs

- Duo enrollment and device lifecycle still need to be managed.
- Authentik’s Duo authenticator integration and the available Duo license/API capabilities must be confirmed.
- This introduces two identity-control systems in the interactive path: Entra for primary authentication and Duo for MFA.
- Step-up and authentication-strength policies require careful testing across both systems.

## Option B: Entra primary authentication with Entra MFA

### User flow

```text
Application
  → Authentik
  → Continue with Entra ID
  → Entra authenticates the user
  → Entra Conditional Access requires MFA
  → Authentik receives the successful OIDC result
  → Authentik issues the application session
```

### Authentik design

- Entra OIDC source provides both primary authentication and MFA enforcement through Entra Conditional Access.
- The common Authentik authentication flow uses the Entra source and does not add a Duo validation stage.
- Existing applications continue using their current Authentik providers and bindings.
- Local credentials remain available for break-glass administration.
- Users do not need an Authentik password or a separate Duo enrollment for normal access.

### Advantages

- Fewer moving parts in the login path.
- One consistent MFA experience across every Authentik-connected application.
- MFA policy, device registration, risk evaluation, and recovery remain in Entra.
- New Authentik applications inherit the same Entra authentication and Conditional Access behavior.
- No separate Duo MFA enrollment workflow is required for these applications.

### Trade-offs

- Entra Conditional Access and MFA licensing/policy must be available and correctly scoped.
- Authentik receives a successful upstream authentication result; application-specific authentication strength requirements must be designed and tested deliberately.
- A broad Entra Conditional Access change could affect other Entra applications, so the initial policy should be scoped to the Authentik enterprise application or pilot group.
- If Duo is required for other unrelated systems, Duo may still need to remain in the organization even if it is removed from this Authentik path.

## Comparison

| Concern                       | Option A: Duo MFA                                | Option B: Entra MFA                                           |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| Primary identity              | Entra ID                                         | Entra ID                                                      |
| User/group provisioning       | Entra SCIM                                       | Entra SCIM                                                    |
| MFA authority                 | Authentik + Duo                                  | Entra Conditional Access                                      |
| Authentik password for users  | Not required                                     | Not required                                                  |
| Login components              | Entra + Authentik + Duo                          | Entra + Authentik                                             |
| Cross-application consistency | High                                             | Highest, if all apps use the same Entra policy                |
| New-user enrollment           | Entra account plus Duo device                    | Entra account plus Entra MFA registration                     |
| Operational complexity        | Medium                                           | Lower                                                         |
| Existing Duo dependency       | Retained                                         | Removed from this login path                                  |
| Main validation concern       | Duo stage, device enrollment, policy interaction | Conditional Access scope and authentication-strength behavior |

## Application onboarding model

For each new application:

1. Create the application in Authentik.
2. Create the provider using the application’s documented protocol.
3. Register the exact redirect URI and logout values.
4. Reuse the common Authentik authentication flow.
5. Bind the application to the relevant baseline or application-specific groups.
6. Configure only the claims required by that application.
7. Test one user from each relevant group.
8. Verify fresh login, logout, authorization, and recovery behavior.

The application provider remains application-specific, but the identity, provisioning, MFA, and group conventions remain shared.

## Recommended rollout

### Phase 1: Read-only inventory

Record the current Authentik sources, authentication flow, Duo integration type, application providers, bindings, groups, and claims. Preserve a known-good administrator session and local break-glass account.

### Phase 2: Provisioning pilot

- Create the SCIM source.
- Assign only a small Entra pilot group.
- Confirm users and groups are provisioned correctly.
- Confirm that users who later authenticate through Entra are linked to the provisioned identities rather than duplicated.

### Phase 3: Authentication pilot

Choose one MFA option and test it with one disposable or low-risk application/user group:

- Option A: Entra authentication followed by Duo validation.
- Option B: Entra authentication with scoped Entra Conditional Access MFA.

Do not remove the existing login path until fresh-session acceptance succeeds.

### Phase 4: Application expansion

After the pilot succeeds, onboard the remaining applications using the common provider, group, claim, logout, and testing conventions. Expand Entra provisioning scope gradually.

## Decision guidance

For the smoothest identical experience across applications and the lowest operational complexity, **Option B—Entra MFA—is the preferred target**, provided the organization’s Entra licensing and Conditional Access requirements are available.

**Option A—Duo MFA—remains a valid alternative** when Duo must remain the central MFA authority or when Entra MFA cannot satisfy the organization’s policy requirements.

The decision should be made after confirming:

- current Duo integration type in Authentik;
- Entra Conditional Access and MFA licensing;
- required authentication-strength or step-up policies;
- user enrollment and recovery expectations; and
- whether any applications require a special MFA claim or assurance level.

## References

- [Authentik: Log in with Entra ID](https://docs.goauthentik.io/users-sources/sources/social-logins/entra-id/)
- [Authentik: Entra ID OAuth](https://docs.goauthentik.io/users-sources/sources/social-logins/entra-id/oauth)
- [Authentik: Entra ID SCIM](https://docs.goauthentik.io/users-sources/sources/social-logins/entra-id/scim/)
- [Authentik: Flows](https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/)
- [Microsoft: Configure group claims and app roles](https://learn.microsoft.com/en-us/security/zero-trust/develop/configure-tokens-group-claims-app-roles)
