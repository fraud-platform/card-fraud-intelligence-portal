# End-to-End Testing

## Stack

- Playwright (`@playwright/test`)
- Specs in `e2e/`
- Config in `playwright.config.ts`

## Useful Commands

```powershell
pnpm test:e2e -- --project=chromium
pnpm test:e2e:ui
pnpm test:e2e:debug
pnpm test:e2e:report
```

## Notes

- Local default favors Chromium for fast feedback
- Firefox/WebKit run in CI or when all-browser flags are enabled
- Keep selectors stable and role-oriented where possible
