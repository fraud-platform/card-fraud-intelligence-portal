# Testing

Canonical testing strategy for local quality gates and production-like validation.

Last verified: February 13, 2026.

## Test Layers

- Unit tests (Vitest): component, hook, and utility behavior.
- E2E tests (Playwright): route/auth/API workflow validation.

## Required Gate Before Handoff

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e -- --project=chromium
```

## Unit Test Commands

- `pnpm test:unit`
- `pnpm test:unit:fast`
- `pnpm test:watch`
- `pnpm test:coverage`

## E2E Commands

- `pnpm test:e2e -- --project=chromium`
- `pnpm test:e2e:smoke:msw`
- `pnpm test:e2e:smoke:live`
- `pnpm test:e2e:live:crud`
- `pnpm test:e2e:ui`
- `pnpm test:e2e:debug`
- `pnpm test:e2e:report`

## Local E2E Runtime Expectations

- UI: `5173`
- Rule management API: `8000`
- Transaction management API: `8002`
- Recommended local flag for non-interactive auth: `VITE_FORCE_DEV_AUTH=true`

## Skip Policy

Some tests are intentionally skipped in default local Chromium runs:

- Auth0 credential and real-token checks, unless `E2E_USE_REAL_AUTH0=true`.
- Approval decision paths that require deterministic pending state in live backend data.
- Duplicate field-key backend validation path when local mock setup always returns create success.

Default local merge gate is still valid with these intentional skips.

## Current Chromium Baseline

As of February 12, 2026:

- `pnpm test:e2e -- --project=chromium` => `297 passed`, `6 skipped`, `0 failed`

## Failure Triage Order

1. Verify service health and CORS on `5173/8000/8002`.
2. Re-run failing spec in Chromium only.
3. Inspect `test-results/` screenshots and traces.
4. Distinguish UI regressions from backend data/state drift.
