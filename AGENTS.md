# AGENTS.md

Canonical agent instructions for this repository.

This file is written for any coding agent (Codex, Claude Code, Cursor, Copilot, etc.).
If a tool-specific file exists, it must point here instead of duplicating guidance.

## Project Snapshot

- Name: `card-fraud-intelligence-portal`
- Stack: Vite + React + TypeScript + Refine + Ant Design
- Type: Control-plane UI for fraud operations and rule governance
- Important: This UI authors metadata and sends API calls. It does **not** execute fraud logic.

## Core Paths

- App shell and providers: `src/app/`
- Routes and resource registration: `src/app/routes.tsx`, `src/App.tsx`
- API contracts/endpoints: `src/api/endpoints.ts`, `src/api/types.ts`, `src/api/httpClient.ts`
- Domain types: `src/types/`
- Resource screens: `src/resources/`
- Shared UI and utilities: `src/shared/`, `src/components/`, `src/hooks/`
- Unit test setup: `src/test/`
- E2E tests: `e2e/`
- Project docs index: `docs/README.md`

## Runtime and Secrets

- Secrets are managed with Doppler.
- Scripts in `package.json` already include `doppler run --` where needed.
- Do not create or commit `.env` files.

## Quality Gates

Run these before handing off code changes:

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e -- --project=chromium
```

Use full multi-browser E2E in CI or when validating browser-specific behavior:

```powershell
pnpm test:e2e
```

## Engineering Rules

- Keep strict TypeScript and zero lint errors.
- Prefer minimal, focused changes over broad refactors.
- Reuse existing patterns before introducing new abstractions.
- Do not hardcode role names or permissions in UI components when hooks/providers already expose capability checks.
- For RBAC, rely on `authProvider`, `accessControlProvider`, and `usePermissions`.
- For API routes, update `src/api/endpoints.ts` first, then consume from resource code.

## Documentation Rules

When behavior, routes, scripts, or architecture changes:

1. Update impacted docs in `docs/` in the same change.
2. Keep `README.md`, `docs/README.md`, and `docs/STATUS.md` aligned.
3. Keep links valid (no references to missing files).
4. Avoid stale hardcoded counts when possible; prefer "last verified" entries.

## Security and Compliance Notes

- Maintain maker-checker separation and avoid self-approval paths.
- Do not expose PAN or sensitive data in logs/UI.
- Preserve masking behavior for sensitive fields.
- Keep CSP and security header guidance aligned with `nginx.conf` and `scripts/csp-*`.

## Handoff Format

When finishing work, include:

- What changed (paths and intent)
- Validation run (lint, type-check, tests)
- Any known gaps or follow-up tasks
