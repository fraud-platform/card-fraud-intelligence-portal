# API

Canonical API integration guide for this UI.

Last verified: February 13, 2026.

## Service Domains

- Rule management API: `http://localhost:8000`
- Transaction management API: `http://localhost:8002`

## Primary Integration Files

- Endpoint constants: `src/api/endpoints.ts`
- HTTP client and interceptors: `src/api/httpClient.ts`
- Shared API contract types: `src/api/types.ts`
- Refine bridge: `src/app/dataProvider.ts`

## Endpoint Groups in UI

### Rule-governance surface (rule-management backend)

- `RULE_FIELDS`
- `RULES`
- `RULE_VERSIONS`
- `RULESETS`
- `RULESET_VERSIONS`
- `APPROVALS`
- `AUDIT_LOGS`
- `FIELD_REGISTRY`

### Analyst surface (transaction-management backend)

- `TRANSACTIONS`
- `REVIEW` (transaction review flows)
- `NOTES` (analyst notes)
- `WORKLIST`
- `CASES`
- `WORKFLOW_METRICS`

## Runtime Routing Rules

`src/api/httpClient.ts` routes these relative paths to transaction-management:

- `/api/v1/transactions*`
- `/api/v1/worklist*`
- `/api/v1/cases*`
- `/api/v1/metrics*`

## Contract Artifacts

Generated contracts are stored in this section:

- `docs/03-api/openapi-rule-management.json`
- `docs/03-api/openapi-transaction-management.json`

## API Change Procedure

1. Update `src/api/endpoints.ts` first.
2. Update API typing (`src/api/types.ts` / `src/types/*`).
3. Update consuming resources/hooks.
4. Validate with:
   - `pnpm lint`
   - `pnpm type-check`
   - `pnpm test:unit`
   - `pnpm test:e2e -- --project=chromium`
5. Update docs indexes (`README.md`, `docs/README.md`, `docs/codemap.md`, section README as needed).

## Error Handling Contract

- `401`: treated as auth/session invalidation.
- `403`: treated as permission-denied path.
- Network failures: must render actionable fallback UI states.

## Health Convention

Use `/api/v1/health` in docs and runbooks.
