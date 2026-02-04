# Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- Doppler CLI

## Install

```powershell
pnpm install
```

## Configure Doppler

```powershell
doppler login
doppler setup --project card-fraud-intelligence-portal --config local --no-interactive
```

Scripts already include Doppler where needed (`pnpm dev`, `pnpm build`, `pnpm test:e2e`).

## Run Locally

```powershell
pnpm dev
```

App URL: `http://localhost:5173`

## Core Checks

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e -- --project=chromium
```

## Environment Variables (from Doppler)

Key variables used by the frontend:

- `VITE_API_URL`
- `VITE_AUTH0_ENABLED`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_AUTH0_ROLE_CLAIM`
- `VITE_E2E_MODE`

## Related Docs

- Verification checklist: `docs/01-setup/verification.md`
- Auth model: `docs/07-reference/auth-model.md`
- API overview: `docs/03-api/overview.md`
