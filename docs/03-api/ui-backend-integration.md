# UI to Backend Integration

This page maps key frontend workflows to endpoint groups.

## Rule Governance

- Rule fields: `RULE_FIELDS`
- Rules and versions: `RULES`, `RULE_VERSIONS`
- Rule sets and versions: `RULESETS`, `RULESET_VERSIONS`
- Approvals: `APPROVALS`
- Audits: `AUDIT_LOGS`

## Fraud Operations

- Transactions: `TRANSACTIONS`
- Reviews: `REVIEW`
- Notes: `NOTES`
- Worklist: `WORKLIST`
- Cases: `CASES`
- Bulk actions: `BULK`
- Metrics: `WORKFLOW_METRICS`

## Integration Rules

- Use endpoint constants, not inline strings
- Keep list filters and query params aligned with backend contracts
- Keep optimistic UI updates bounded and recoverable
- Surface API failures through shared error handling
