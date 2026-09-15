# Fork Actions policy

This repository is an application-source fork, not a production deployment
repository.

## Allowed workflow

- `pr-check.yml` may run on pull requests to validate linting, formatting,
  type-checking, builds, and database dialect tests.
- `openapi.yml` is retained only as a manually dispatched, read-only artifact
  generator.

## Deliberately absent from this fork

The following workflows are not present here and must not be restored merely
by synchronizing from upstream:

- Docker image publishing
- Helm chart publishing or deployment
- Release and beta-release automation
- Electron release uploads
- Crowdin synchronization
- Dependabot retargeting or automatic merging
- Issue redirection automation

Production deployment and image selection belong exclusively in the
`ShipitSmarter/ProxmoxCluster` repository through its reviewed deployment
workflow. This fork must not receive production credentials or deployment
secrets.
