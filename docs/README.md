# Card Fraud Intelligence Portal Documentation

React/Refine frontend for fraud analysts and governance workflows.

## Quick Start

```powershell
pnpm install
pnpm dev
pnpm test:unit
```

## Documentation Standards

- Keep published docs inside `docs/01-setup` through `docs/07-reference`.
- Use lowercase kebab-case file names for topic docs.
- Exceptions: `README.md`, `codemap.md`, and generated contract artifacts (for example `openapi.json`).
- Do not keep TODO/archive/status/session planning docs in tracked documentation.

## Section Index

### `01-setup` - Setup

Prerequisites, first-run onboarding, and environment bootstrap.

- `01-setup/new-user-setup.md`
- `01-setup/overview.md`
- `01-setup/setup.md`
- `01-setup/verification.md`

### `02-development` - Development

Day-to-day workflows, architecture notes, and contributor practices.

- `02-development/architecture.md`
- `02-development/patterns.md`
- `02-development/resource-analyst-ia-ux.md`
- `02-development/resource-analyst-workflow.md`
- `02-development/resource-field-registry.md`
- `02-development/resource-overview.md`
- `02-development/resource-rule-management.md`
- `02-development/resource-transaction-management.md`
- `02-development/workflow.md`

### `03-api` - API

Contracts, schemas, endpoint references, and integration notes.

- `03-api/contracts.md`
- `03-api/openapi-rule-management.json`
- `03-api/openapi-transaction-management.json`
- `03-api/overview.md`
- `03-api/ui-backend-integration.md`

### `04-testing` - Testing

Test strategy, local commands, and validation playbooks.

- `04-testing/e2e.md`
- `04-testing/overview.md`
- `04-testing/unit.md`

### `05-deployment` - Deployment

Local runtime/deployment patterns and release-readiness guidance.

- `05-deployment/ci-cd.md`
- `05-deployment/ci-overview.md`
- `05-deployment/docker.md`
- `05-deployment/overview.md`
- `05-deployment/platforms.md`

### `06-operations` - Operations

Runbooks, observability, troubleshooting, and security operations.

- `06-operations/csp-nonce.md`
- `06-operations/monitoring.md`
- `06-operations/security.md`

### `07-reference` - Reference

ADRs, glossary, and cross-repo reference material.

- `07-reference/000-template.md`
- `07-reference/001-auth-model.md`
- `07-reference/002-rule-versioning.md`
- `07-reference/003-analyst-workflow-architecture.md`
- `07-reference/agents-guide.md`
- `07-reference/auth-model.md`
- `07-reference/rule-validation-loop.md`

## Core Index Files

- `docs/README.md`
- `docs/codemap.md`
