# Reference

Canonical stable reference for role labels, invariants, ports, and route surfaces.

Last verified: February 13, 2026.

## System Invariants

- This repository is a control-plane UI.
- Fraud decision execution remains backend-owned.
- Maker/checker separation must be preserved.
- Sensitive card data must remain masked.

## Role Labels Used in UI

- `RULE_MAKER`
- `RULE_CHECKER`
- `RULE_VIEWER`
- `FRAUD_ANALYST`
- `FRAUD_SUPERVISOR`
- `PLATFORM_ADMIN`

## Core Route Surface

| Domain           | Primary routes                                                     |
| ---------------- | ------------------------------------------------------------------ |
| Rule governance  | `/rule-fields`, `/rules`, `/rulesets`, `/approvals`, `/audit-logs` |
| Fraud operations | `/worklist`, `/transactions`, `/cases`, `/transaction-metrics`     |

## Local Port Conventions

- UI: `5173`
- Rule management API: `8000`
- Transaction management API: `8002`

## Source of Truth Files

- Agent operating contract: `AGENTS.md`
- Documentation index: `docs/README.md`
- Repository map: `docs/codemap.md`
- Endpoint constants: `src/api/endpoints.ts`
- Route/resource registration: `src/app/routes.tsx`
- HTTP routing logic: `src/api/httpClient.ts`

## Glossary

- Maker: user role that drafts/submits governance entities.
- Checker: user role that approves/rejects submitted entities.
- Worklist: analyst queue for review operations.
- Case: investigation container grouping related transactions.

## Deep-Dive Guides

- Full authentication and authorization model: `docs/07-reference/auth-model.md`
- Rule validation loop spec: `docs/07-reference/rule-validation-loop.md`
- Rule versioning and immutability decision: `docs/07-reference/rule-versioning.md`
