# Code Map

Repository code map for `card-fraud-intelligence-portal`.

Last verified: February 13, 2026.

## Repository Tree

```text
card-fraud-intelligence-portal/
|- AGENTS.md
|- README.md
|- docs/
|  |- README.md
|  |- codemap.md
|  |- 01-setup/README.md
|  |- 02-development/
|  |  |- README.md
|  |  |- architecture.md
|  |  |- patterns.md
|  |  `- workflow.md
|  |- 03-api/
|  |  |- README.md
|  |  |- openapi-rule-management.json
|  |  `- openapi-transaction-management.json
|  |- 04-testing/README.md
|  |- 05-deployment/
|  |  |- README.md
|  |  |- ci-overview.md
|  |  `- docker.md
|  |- 06-operations/
|  |  |- README.md
|  |  |- monitoring.md
|  |  |- security.md
|  |  `- csp-nonce.md
|  `- 07-reference/
|     |- README.md
|     |- auth-model.md
|     |- rule-validation-loop.md
|     `- rule-versioning.md
|- e2e/
|- src/
|  |- api/
|  |- app/
|  |- components/
|  |- hooks/
|  |- resources/
|  |- shared/
|  |- test/
|  `- types/
|- Dockerfile
|- playwright.config.ts
|- package.json
`- vite.config.ts
```

## Source Tree Ownership

```text
src/
|- app/                  # Providers, auth, access control, route registration
|- api/                  # Endpoint constants, HTTP client, API contracts/types
|- resources/            # Feature screens (rule governance + analyst workflows)
|- hooks/                # Reusable data/access hooks
|- shared/               # Layout, shared utilities, compat shims
|- components/           # Reusable UI components
|- test/                 # Unit/integration test utilities
`- types/                # Domain models and enums
```

## Resource to Path Map

| Domain       | Primary path                  |
| ------------ | ----------------------------- |
| Rule Fields  | `src/resources/ruleFields/`   |
| Rules        | `src/resources/rules/`        |
| Rule Sets    | `src/resources/ruleSets/`     |
| Approvals    | `src/resources/approvals/`    |
| Audit Logs   | `src/resources/auditLogs/`    |
| Worklist     | `src/resources/worklist/`     |
| Transactions | `src/resources/transactions/` |
| Cases        | `src/resources/cases/`        |

## API Routing Map

| URL pattern                                                                                                                          | Target service (local)                           |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `/api/v1/rule-fields*`, `/api/v1/rules*`, `/api/v1/rulesets*`, `/api/v1/approvals*`, `/api/v1/audit-log*`, `/api/v1/field-registry*` | Rule management (`http://localhost:8000`)        |
| `/api/v1/transactions*`, `/api/v1/worklist*`, `/api/v1/cases*`, `/api/v1/metrics*`                                                   | Transaction management (`http://localhost:8002`) |

Routing behavior is implemented in `src/api/httpClient.ts`.

## Runtime Ports

- UI: `http://localhost:5173`
- Rule management API: `http://localhost:8000`
- Transaction management API: `http://localhost:8002`
- Preferred health endpoint path: `/api/v1/health`

## Common Commands

```powershell
pnpm dev
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:unit:shard -- --shard=1/4
pnpm test:e2e -- --project=chromium
pnpm build
```

Unit-test runtime tuning and sharding flags are documented in `docs/04-testing/README.md` (`VITEST_*`, `MSW_*`).

## Detailed Docs Index

- Development:
  - `docs/02-development/architecture.md`
  - `docs/02-development/patterns.md`
  - `docs/02-development/workflow.md`
- Deployment:
  - `docs/05-deployment/ci-overview.md`
  - `docs/05-deployment/docker.md`
- Operations:
  - `docs/06-operations/monitoring.md`
  - `docs/06-operations/security.md`
  - `docs/06-operations/csp-nonce.md`
- Reference:
  - `docs/07-reference/auth-model.md`
  - `docs/07-reference/rule-validation-loop.md`
  - `docs/07-reference/rule-versioning.md`
