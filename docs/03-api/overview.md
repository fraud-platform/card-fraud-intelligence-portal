# API Overview

API integration reference for this frontend.

## Base Path

All frontend endpoint constants are defined in `src/api/endpoints.ts` and use:

- `/api/v1`

## Client

- Axios client: `src/api/httpClient.ts`
- Resolved base URL comes from `VITE_API_URL` (or empty in E2E mode)
- Timeout: 30 seconds

## Endpoint Groups

- Rule governance: `RULE_FIELDS`, `RULES`, `RULE_VERSIONS`, `RULESETS`, `RULESET_VERSIONS`, `APPROVALS`, `AUDIT_LOGS`
- Fraud operations: `TRANSACTIONS`, `REVIEW`, `NOTES`, `WORKLIST`, `CASES`, `BULK`, `WORKFLOW_METRICS`
- Field registry: `FIELD_REGISTRY`

## OpenAPI Files

- `docs/03-api/openapi/openapi-rule-management.json`
- `docs/03-api/openapi/openapi-transaction-management.json`

## Additional References

- UI mapping notes: `docs/03-api/ui-backend-integration.md`
- API contracts and payload conventions: `docs/03-api/contracts.md`
