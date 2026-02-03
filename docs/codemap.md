# Code Map

## Core Layout

- `src/app/`: app shell providers (auth, data provider, access control).
- `src/resources/`: Refine resource pages (`rules`, `ruleFields`, `ruleSets`, `transactions`, etc.).
- `src/components/`: reusable UI components.
- `src/hooks/`: domain-specific hooks.
- `src/shared/`: shared utilities, styles, compatibility helpers.
- `src/mocks/`: MSW handlers and fixture data for local tests.
- `e2e/`: Playwright tests.

## Key Commands

- `pnpm install`
- `pnpm dev`
- `pnpm test`
- `pnpm e2e`
- `pnpm build`

## Integration Role

Frontend portal for fraud analysts; integrates with rule-management and transaction-management APIs.
