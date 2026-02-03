# API Contracts

Implementation-oriented contract notes for frontend contributors.

## Contract Sources

- OpenAPI snapshots under `docs/03-api/openapi/`
- Endpoint constants in `src/api/endpoints.ts`
- Runtime response usage in resource screens and hooks

## Conventions

- Keep endpoint strings centralized in `src/api/endpoints.ts`
- Keep request/response typing in `src/api/types.ts`
- Normalize backend IDs in `src/app/dataProvider.ts`
- Handle auth and error transformation in `src/api/httpClient.ts`

## Change Workflow

1. Update endpoint constants
2. Update related request/response types
3. Update consumers (hooks/resources)
4. Update docs if route or payload behavior changed
