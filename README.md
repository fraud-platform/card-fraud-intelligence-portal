# Card Fraud Intelligence Portal

Enterprise UI for fraud rule governance and fraud operations workflows.

This app is a control plane: it authors metadata and sends API requests. It does not execute fraud logic.

## First-Time Setup

```powershell
pnpm install
git config core.hooksPath .githooks
doppler login
doppler setup --project card-fraud-intelligence-portal --config local --no-interactive
```

## Quick Start (Standalone UI)

```powershell
pnpm dev
```

App URL: `http://localhost:5173`

Use `VITE_FORCE_DEV_AUTH=true` for local non-interactive auth mode.

## Production-Like Local Mode (Platform Compose)

From `card-fraud-platform`:

```powershell
doppler run -- docker compose -f docker-compose.yml -f docker-compose.apps.yml --profile apps up -d
```

Shared local ports:

- UI: `5173`
- Rule Management API: `8000`
- Transaction Management API: `8002`

## Common Commands

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:unit:shard -- --shard=1/4
pnpm test:e2e -- --project=chromium
pnpm build
```

## Unit Test Runtime Tuning

- `VITEST_POOL=threads|forks` (default: `threads`)
- `VITEST_MAX_WORKERS=<n>` (default: CPU - 1, capped at 6)
- `VITEST_FILE_PARALLELISM=true|false` (default: `true`)
- `VITEST_ISOLATE=true|false` (default: `true`)
- `VITEST_SILENT=true|false` (default: `true`)
- `VITEST_REPORTER=dot|default|verbose|json` (default: `dot` locally, `default` in CI)
- `VITEST_SUPPRESS_NOISE=true|false` (default: `true`)
- `VITEST_MSW=true|false` (default: `true`)
- `VITEST_STRICT_MSW=true|false` (default: `false`, uses `bypass` for unhandled requests)
- `MSW_DELAY_MS=<n>` (default: `0` in tests, `300` outside tests)
- `MSW_LOG_INIT=true|false` (default: `false`)

## Runtime Modes

- Standalone UI mode: run this repository directly (`pnpm dev`) with Doppler-managed secrets.
- Platform mode: run via `card-fraud-platform` compose stack and point UI/API to shared local ports.

Preferred health endpoint shape: `/api/v1/health`.

## Documentation

- Docs hub: `docs/README.md`
- Setup and onboarding: `docs/01-setup/README.md`
- Development architecture and conventions: `docs/02-development/README.md`
- API contracts and integration notes: `docs/03-api/README.md`
- Testing strategy and commands: `docs/04-testing/README.md`
- Deployment and release guidance: `docs/05-deployment/README.md`
- Operations and troubleshooting: `docs/06-operations/README.md`
- References and glossary: `docs/07-reference/README.md`
- Code navigation map: `docs/codemap.md`
- Agent instructions: `AGENTS.md`
