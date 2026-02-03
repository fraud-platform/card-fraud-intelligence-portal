# Testing Overview

Testing stack:

- Unit/integration: Vitest + Testing Library
- E2E: Playwright

## Commands

```powershell
pnpm test:unit
pnpm test:unit:fast
pnpm test:coverage
pnpm test:e2e -- --project=chromium
```

## References

- Unit testing guide: `docs/04-testing/unit.md`
- E2E testing guide: `docs/04-testing/e2e.md`
- Test utilities: `src/test/README.md`
- Playwright config: `playwright.config.ts`
