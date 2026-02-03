# Code Map

## Repository Purpose

React/Refine frontend used by analysts for review, triage, and governance workflows.

## Key Paths

- `src/`: Application UI, resources, routes, and data provider integration.
- `e2e/`: Playwright tests and fixtures for end-to-end user flows.
- `scripts/`: Frontend helpers (CSP checks and local utilities).
- `public/`: Static assets served by Vite.
- `docs/`: Curated onboarding and operational documentation.

## Local Commands

- `pnpm install`
- `pnpm dev`
- `pnpm test:unit`

## Local Test Commands

- `pnpm test:unit`
- `pnpm test:e2e`

## API Note

Frontend integrates with rule-management and transaction-management APIs.

## Platform Integration

- Standalone mode: run this repository using its own local commands and Doppler project config.
- Consolidated mode: run this repository through `card-fraud-platform` compose stack for cross-service validation.
