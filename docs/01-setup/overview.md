# Project Overview

This project is the frontend for fraud rule governance and fraud operations workflows.

## What This UI Does

- Manages rule fields, rules, rule sets, approvals, and audit logs
- Supports analyst workflows (home, worklist, transactions, cases, metrics)
- Integrates with backend APIs using typed endpoint definitions

## What This UI Does Not Do

- Execute fraud rules
- Perform transaction decisioning
- Store raw PAN/card numbers

## Resource Map

The app registers 10 resources in `src/app/routes.tsx`:

1. `rule-fields`
2. `rules`
3. `rulesets`
4. `approvals`
5. `audit-logs`
6. `analyst-home`
7. `worklist`
8. `transactions`
9. `cases`
10. `transaction-metrics`

## Next Reads

- Setup: `docs/01-setup/setup.md`
- Architecture: `docs/02-development/architecture.md`
- Resources: `docs/02-development/resource-overview.md`
- API: `docs/03-api/overview.md`
- Security: `docs/06-operations/security.md`
