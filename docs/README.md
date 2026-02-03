# Card Fraud Intelligence Portal Documentation

React/Refine frontend used by analysts for review, triage, and governance workflows.

## Audience

- New developers setting up this repository locally.
- Coding agents that need deterministic, executable setup/test instructions.

## Quick Start

```powershell
pnpm install
pnpm dev
pnpm test:unit
```

## Documentation Standards

- Keep published docs inside `docs/01-setup` through `docs/07-reference`.
- Use lowercase kebab-case file names (for example `local-setup.md`).
- Exceptions: `README.md`, `codemap.md`, and machine-generated contract files (for example `openapi.json`).
- Do not publish TODO, session notes, or archive artifacts.

## Section Index

### `01-setup` - Setup

Prerequisites, first-run onboarding, and environment bootstrap.

- _No published topic file yet; see section README._

### `02-development` - Development

Day-to-day workflows, coding conventions, and contributor practices.

- _No published topic file yet; see section README._

### `03-api` - API

Contracts, schemas, endpoint examples, and integration notes.

- `03-api/contracts.md`
- `03-api/openapi/openapi-rule-management.json`
- `03-api/openapi/openapi-transaction-management.json`
- `03-api/overview.md`
- `03-api/ui-backend-integration.md`

### `04-testing` - Testing

Test strategy, local commands, and validation checklists.

- `04-testing/e2e.md`
- `04-testing/overview.md`
- `04-testing/unit.md`

### `05-deployment` - Deployment

Local runtime/deployment patterns and release readiness notes.

- `05-deployment/ci-cd.md`
- `05-deployment/docker.md`
- `05-deployment/overview.md`
- `05-deployment/platforms.md`

### `06-operations` - Operations

Runbooks, troubleshooting, security operations, and observability.

- `06-operations/csp-nonce.md`
- `06-operations/monitoring.md`
- `06-operations/security.md`

### `07-reference` - Reference

Architecture decisions, glossary, and cross-repo references.

- `07-reference/adr/000-template.md`
- `07-reference/adr/001-auth-model.md`
- `07-reference/adr/002-rule-versioning.md`
- `07-reference/adr/003-analyst-workflow-architecture.md`
- `07-reference/agents.md`

## Core Index Files

- `docs/README.md` (this index)
- `docs/codemap.md` (developer/agent orientation map)
