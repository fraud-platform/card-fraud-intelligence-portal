# Deployment Overview

This frontend ships as a static Vite build served by Nginx in Docker.

## Primary Artifacts

- Build output: `dist/`
- Container image: built via `Dockerfile`
- Runtime config: `nginx.conf`

## References

- Docker details: `docs/05-deployment/docker.md`
- Platform options: `docs/05-deployment/platforms.md`
- CI/CD pipelines: `docs/05-deployment/ci-cd.md`

## Pre-Deploy Checks

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e -- --project=chromium
pnpm build
```
