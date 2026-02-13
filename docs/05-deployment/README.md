# Deployment

Canonical deployment and release-readiness guide for this UI.

Last verified: February 13, 2026.

## Build and Artifacts

Local build command:

```powershell
pnpm build
```

Container build uses direct toolchain commands:

- `pnpm exec tsc`
- `pnpm exec vite build`

This avoids Doppler dependency during image build.

## Runtime Modes

- Local dev mode: `pnpm dev`
- Platform compose mode: run from `card-fraud-platform` with shared local ports

## Runtime Expectations

- UI served on `5173`
- Rule-management reachable on `8000`
- Transaction-management reachable on `8002`
- CSP and header behavior aligned with `nginx.conf` and `scripts/csp-*`

## Secrets and Environment

- Use Doppler-managed secrets only.
- Do not create or commit `.env` files.

## CI/CD State in This Repo

- Active workflows are intentionally disabled during current dev phase.
- See `.github/workflows/README.md`.
- Re-enable candidates are under `.github/workflows-disabled/`:
  - `ci.yml`
  - `deploy.yml`
  - `test.yml.example`

## Release Checklist

1. `pnpm lint` passes.
2. `pnpm type-check` passes.
3. `pnpm test:unit` passes.
4. `pnpm test:e2e -- --project=chromium` passes.
5. Docs updated with behavior/route/script/setup changes.

## CI Guidance

- Keep Chromium as mandatory local quality gate.
- Use multi-browser matrix in CI for browser-specific validation.

## Deep-Dive Guides

- CI/CD setup details: `docs/05-deployment/ci-overview.md`
- Docker deployment details: `docs/05-deployment/docker.md`
