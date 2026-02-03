# Card Fraud Intelligence Portal

Enterprise UI for fraud rule governance and fraud operations workflows.

This app is a control plane: it authors metadata and sends API requests. It does not execute fraud logic.

## Quick Start

```powershell
pnpm install
pnpm dev
```

App URL: `http://localhost:5173`

## Common Commands

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e -- --project=chromium
pnpm build
```

## Documentation

- Docs hub: `docs/README.md`
- Setup: `docs/00-getting-started/setup.md`
- Architecture: `docs/01-development/architecture.md`
- API: `docs/03-api/overview.md`
- Testing: `docs/04-testing/overview.md`
- Deployment: `docs/05-deployment/overview.md`
- Operations: `docs/06-operations/monitoring.md`
- Status: `docs/STATUS.md`
- TODO: `docs/TODO.md`
- Agent guidance: `AGENTS.md`
