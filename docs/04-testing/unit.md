# Unit and Integration Testing

## Stack

- Vitest
- React Testing Library
- MSW for HTTP mocking in tests

## Useful Commands

```powershell
pnpm test:unit
pnpm test:unit:fast
pnpm test:watch
pnpm test:coverage
```

## Test Infrastructure

- Setup: `src/test/setup.ts`
- Shared helpers: `src/test/utils.tsx`
- Global mocks: `src/mocks/`

## Guidance

- Prefer behavior-focused assertions
- Keep tests deterministic and independent
- Reuse shared mocks/helpers over ad hoc setup
