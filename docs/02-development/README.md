# Development

Canonical development guide for architecture, code ownership, and delivery workflow.

Last verified: February 13, 2026.

## Stack

- Vite + React + TypeScript
- Refine for routing/resources/data provider integration
- Ant Design for UI system

## Architecture Boundaries

- UI is a control plane: it authors metadata and orchestrates API calls.
- Fraud decision logic remains backend-owned.
- Maker/checker separation is mandatory in UX and permission handling.

## Folder Ownership

```text
src/
|- app/        # Providers, auth, access control, routes
|- api/        # Endpoint constants, HTTP client, API contract typing
|- resources/  # Domain screens (list/create/edit/show)
|- hooks/      # Shared async/data hooks
|- shared/     # Layout, utility, compatibility layers
|- components/ # Shared presentational and workflow components
|- test/       # Test utilities and wrappers
`- types/      # Domain-level TypeScript models
```

## Resource Delivery Workflow

1. Update endpoint constants in `src/api/endpoints.ts`.
2. Add/update request-response typing in `src/api/types.ts` or `src/types/`.
3. Implement UI behavior in `src/resources/` plus supporting hooks.
4. Reuse existing shared components/hooks before adding new abstractions.
5. Validate with lint, type-check, unit tests, and Chromium E2E.

## RBAC Implementation Rules

- Use `authProvider`, `accessControlProvider`, and `usePermissions`.
- Do not hardcode role logic in leaf components when provider-level checks exist.
- Keep maker/checker approval boundaries explicit and test-covered.

## Security Rules for UI Code

- Never expose PAN/sensitive card values in plaintext logs/UI.
- Preserve masking behavior in all resource screens.
- Keep CSP/security header compatibility with `nginx.conf` and `scripts/csp-*`.

## Required Local Quality Gate

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e -- --project=chromium
```

## Deep-Dive Guides

- Architecture details: `docs/02-development/architecture.md`
- Reusable code patterns: `docs/02-development/patterns.md`
- Day-to-day delivery workflow: `docs/02-development/workflow.md`

## Documentation Update Rule

When behavior, routes, scripts, ports, or setup flow changes, update in the same PR:

- `README.md`
- `AGENTS.md`
- `docs/README.md`
- `docs/codemap.md`
- impacted section README(s)
