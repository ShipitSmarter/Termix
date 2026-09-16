# Future Enhancements

This document records intentionally parked ideas that are not currently scheduled for implementation.

## Shared-host import

### Add “Import Shared Host” to Dashboard Quick Actions

Add a dashboard Quick Actions entry that opens the existing Shared Hosts catalog and lets the user import a shared host into My Hosts.

Implementation notes:

- Reuse the existing Shared Hosts catalog and import flow.
- Do not create a second import dialog or duplicate catalog.
- Route the action through the existing Host Manager navigation/event pattern.
- Add the corresponding translations and UI regression coverage.

Estimated complexity: low to medium; primarily a frontend entry-point change.

### Make shared-host importing role-configurable

Make importing a shared host an explicit role permission, proposed permission name:

```text
hosts.import
```

Desired behavior:

- Importing is disabled by default when a user does not have `hosts.import`.
- Users may still view/select shared hosts according to their existing shared-host access.
- The import controls and the Quick Actions entry are hidden or disabled without the permission.
- The backend import endpoint enforces the permission and returns `403` when it is absent.
- Administrators manage the permission through the existing role editor.
- Existing wildcard permissions such as `hosts.*` continue to include the new permission.
- The default-off behavior preserves the stock Termix behavior for users without the permission.

Implementation notes:

- Add `hosts.import` to the canonical permission catalog.
- Enforce it server-side on `POST /rbac/shared-host-imports`.
- Expose or reuse the current-user permission state for frontend gating.
- Add allowed/denied backend, API, role-editor, and UI regression coverage.
- Keep shared-host selection separate from importing a personal copy.

Estimated complexity: medium to high; a cross-cutting RBAC, API, and UI change.

## Status

Both enhancements are parked for future consideration. No implementation is included in this change.
