# Setup

Canonical local setup and verification guide for this UI.

Last verified: February 13, 2026.

## Purpose

Get a developer from clone to a verified local runtime with both backend services reachable.

## Prerequisites

- Node.js 20+
- `pnpm`
- Docker Desktop (for platform compose mode)
- Doppler CLI authenticated to local configs

## First-Time Bootstrap

```powershell
pnpm install
git config core.hooksPath .githooks
doppler login
doppler setup --project card-fraud-intelligence-portal --config local --no-interactive
```

## Run Modes

### Standalone UI mode

```powershell
pnpm dev
```

Use for fast frontend iteration. UI runs at `http://localhost:5173`.

For local non-interactive auth, run with `VITE_FORCE_DEV_AUTH=true`.

### Platform compose mode (recommended for live integration)

Run UI and companion services from `card-fraud-platform`:

```powershell
cd ../card-fraud-platform
doppler run -- docker compose -f docker-compose.yml -f docker-compose.apps.yml --profile apps up -d
```

Expected shared local ports:

- UI: `5173`
- Rule management API: `8000`
- Transaction management API: `8002`

## Key Runtime Variables (Doppler-managed)

- `VITE_API_URL`
- `VITE_API_URL_TRANSACTION_MGMT` or `VITE_TRANSACTION_API_URL`
- `VITE_AUTH0_ENABLED`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_AUTH0_ROLE_CLAIM`
- `VITE_FORCE_DEV_AUTH`
- `VITE_E2E_MODE`

## CORS Setup (Required for Live E2E)

From `card-fraud-platform`:

```powershell
cd ../card-fraud-platform
doppler secrets set CORS_ORIGINS --value "http://localhost:5173,http://localhost:3000" --config local
doppler secrets set SECURITY_CORS_ALLOWED_ORIGINS --value "http://localhost:5173,http://localhost:3000" --config local
```

Restart backend containers after secret changes:

```powershell
docker stop card-fraud-rule-management card-fraud-transaction-management
doppler run -- docker compose -f docker-compose.yml -f docker-compose.apps.yml --profile apps up -d
```

## Verification Checklist

1. Open `http://localhost:5173` and confirm shell renders.
2. Confirm rule-governance pages load: `/rule-fields`, `/rules`, `/rulesets`, `/approvals`.
3. Confirm analyst pages load: `/transactions`, `/worklist`, `/cases`.
4. Confirm backend health endpoints:
   - `http://localhost:8000/api/v1/health`
   - `http://localhost:8002/api/v1/health`
5. Run local quality gate:
   - `pnpm lint`
   - `pnpm type-check`
   - `pnpm test:unit`
   - `pnpm test:e2e -- --project=chromium`

## Fast Recovery Checks

- `Network Error` on rule pages: verify `8000` health and CORS.
- `Network Error` on transaction/worklist/cases: verify `8002` health and CORS.
- Auth loop/login screen after local run: verify `VITE_FORCE_DEV_AUTH` usage and session state.
