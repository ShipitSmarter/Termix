# Upstream maintenance

This repository is the ShipitSmarter downstream fork of [Termix](https://github.com/Termix-SSH/Termix). The production deployment and infrastructure configuration remain in the [ProxmoxCluster](https://github.com/ShipitSmarter/ProxmoxCluster) repository.

## Repository roles

- **This repository:** Termix application source, custom shared-host functionality, migrations, tests, and container/image build.
- **ProxmoxCluster:** deployment configuration, selected image tag/digest, environment configuration, deployment workflow, and production verification.

Do not copy the Termix application source into ProxmoxCluster. Do not deploy a fork commit merely because it builds: production updates require review, pilot validation, an immutable image reference, and a rollback reference.

## Current baseline

- Upstream: `https://github.com/Termix-SSH/Termix`
- Downstream: `https://github.com/ShipitSmarter/Termix`
- Current stable line: Termix `2.7.1`
- Current stable commit lineage: `release-2.7.1-tag`
- Upstream development line observed during baseline setup: `dev-2.8.0`
- License: Apache-2.0
- Node requirement: `>=22.12.0`
- npm requirement: `>=11`

The fork keeps the upstream repository as the `upstream` Git remote and the ShipitSmarter fork as `origin`.

## Monthly review

At least once per month:

1. fetch upstream branches and tags;
2. inspect release and security changes;
3. identify changes affecting hosts, folders, ownership, authorization, credentials, database schemas, migrations, and the UI;
4. decide whether to synchronize immediately, schedule an update, or record that no update is needed;
5. record the decision in the relevant issue or pull request.

Security releases receive an expedited review and do not wait for the normal monthly review.

## Synchronization procedure

Use a dedicated maintenance branch. Do not merge upstream directly into production deployment configuration.

```bash
git fetch upstream --tags
git switch -c chore/upstream-<version> upstream/main
# reconcile the downstream feature commits deliberately
npm ci
npm run lint
npm run type-check
npm run format:check
npm test
```

When upstream changes host, folder, authorization, credential, or migration code, review behavior even if Git reports no conflict. A clean merge is not proof of compatibility.

## Required validation before release

1. Run the upstream and downstream test suites.
2. Run database migration checks against a disposable instance.
3. Test the Shared Hosts selection and catalog copy flows.
4. Verify that imported hosts receive the authenticated user as owner.
5. Verify that no source credential IDs or credential material are copied.
6. Verify folder and subfolder placement.
7. Build the candidate container.
8. Deploy only to the pilot instance first.
9. Verify the pilot behavior and retain the previous image digest for rollback.
10. Update ProxmoxCluster to the reviewed immutable image digest through its normal pull-request and deployment gates.

## Baseline validation notes

The repository baseline was installed with `npm ci` using Node 26.8.1 and npm 11.19.0.

Passing baseline gates:

- `npm run lint` — passed with pre-existing warnings and no errors;
- `npm run type-check` — passed;
- `npm run format:check` — passed.

The full `npm test` command currently reaches 2,487 passing tests but has 114 failures across 13 frontend test files. The dominant failure is `localStorage` being undefined in the current Vitest/jsdom execution environment; several adaptive-preference assertions also fail. These are baseline findings, not changes introduced by the ShipitSmarter fork. Feature work must not treat the suite as green until this baseline is either fixed or an agreed test-environment explanation and gate is documented.

`npm run verify:dialect` requires an explicit disposable PostgreSQL or MySQL `DATABASE_URL`; it was not run without a scratch database. Never point it at production.

## Custom feature patch discipline

Keep the Shared Hosts work in focused commits, in this approximate order:

1. schema and migration for user-specific shared-host selections;
2. authorized shared-host catalog and selection API;
3. fixed folder and subfolder behavior;
4. UI catalog and host-menu integration;
5. authorization, secret-exclusion, idempotency, and lifecycle tests.

Avoid broad refactors while implementing the feature. Preserve upstream conventions and make source ownership, personal ownership, and credential boundaries explicit in both code and tests.
