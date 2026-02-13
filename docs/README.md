# Card Fraud Intelligence Portal Documentation

This is the canonical documentation set for the UI repository.

Last verified: February 13, 2026.

## Documentation Model

The docs are intentionally structured:

- One authoritative `README.md` per section (`01` to `07`)
- Linked deep-dive guides only where they add unique implementation detail
- One repository-wide code map: `docs/codemap.md`
- Generated API contracts under `docs/03-api/` (`openapi-*.json`)

This model avoids unlinked setup/how-to fragments while preserving high-value deep references.

## Sections

| Section          | Purpose                                                     | Canonical file                  |
| ---------------- | ----------------------------------------------------------- | ------------------------------- |
| `01-setup`       | Local bootstrap, prerequisites, verification, CORS          | `docs/01-setup/README.md`       |
| `02-development` | Architecture, folder ownership, feature delivery patterns   | `docs/02-development/README.md` |
| `03-api`         | UI to backend API integration, contracts, endpoint workflow | `docs/03-api/README.md`         |
| `04-testing`     | Unit/E2E strategy, quality gates, skip policy               | `docs/04-testing/README.md`     |
| `05-deployment`  | Build, container/runtime expectations, release checklist    | `docs/05-deployment/README.md`  |
| `06-operations`  | Incident triage, runbooks, symptom-based troubleshooting    | `docs/06-operations/README.md`  |
| `07-reference`   | Stable invariants, roles, routes, ports, glossary           | `docs/07-reference/README.md`   |

## Deep-Dive Guides

- Development architecture: `docs/02-development/architecture.md`
- Development patterns: `docs/02-development/patterns.md`
- Development workflow: `docs/02-development/workflow.md`
- Deployment CI setup: `docs/05-deployment/ci-overview.md`
- Deployment Docker notes: `docs/05-deployment/docker.md`
- Operations monitoring: `docs/06-operations/monitoring.md`
- Operations security: `docs/06-operations/security.md`
- Operations CSP nonce runbook: `docs/06-operations/csp-nonce.md`
- Reference auth model: `docs/07-reference/auth-model.md`
- Reference rule validation spec: `docs/07-reference/rule-validation-loop.md`
- Reference rule versioning decision: `docs/07-reference/rule-versioning.md`

## Core Index Files

- Docs index: `docs/README.md`
- Repository code map: `docs/codemap.md`
- Root project overview: `README.md`
- Agent contract: `AGENTS.md`

## Publishing Rules

- Keep docs in `docs/01-setup` through `docs/07-reference`.
- Use lowercase kebab-case for non-special docs.
- Allowed special names: `README.md`, `codemap.md`, generated contract files.
- Do not commit docs/planning artifacts named `todo`, `status`, `archive`, or session notes.

## Standard Local Validation

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:e2e -- --project=chromium
```
