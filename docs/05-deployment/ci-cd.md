# CI/CD Pipeline

## Workflow Files

- CI: `.github/workflows/ci.yml`
- Deploy: `.github/workflows/deploy.yml`

## CI Highlights

- Lint and type-check
- Unit tests and coverage
- Build verification
- E2E execution
- Docker build verification (main branch)

## Required Secrets

- `DOPPLER_TOKEN_TEST`
- `DOPPLER_TOKEN_PROD`

## Manual Steps Still Needed

- Configure GitHub environments (`test`, `production`)
- Configure environment approvals and branch protections
- Wire actual platform deployment actions where placeholders remain
