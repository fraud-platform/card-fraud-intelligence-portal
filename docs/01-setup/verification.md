# Verification Checklist

Run this after setup changes and before significant work.

## Environment

```powershell
node --version
pnpm --version
doppler --version
```

## Quality Gates

```powershell
pnpm lint
pnpm type-check
pnpm test:unit
```

## E2E Smoke

```powershell
pnpm test:e2e -- --project=chromium
```

## Manual Smoke

- Login page loads
- Default route resolves correctly by role/capability
- Rule management pages load
- Fraud operations pages load

## Troubleshooting Pointers

- Setup guide: `docs/01-setup/setup.md`
- API docs: `docs/03-api/overview.md`
- Status: `docs/README.md`
