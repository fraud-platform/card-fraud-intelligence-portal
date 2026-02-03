# Security Overview

## Authentication and Authorization

- Auth model and roles: `docs/AUTH_MODEL.md`
- Frontend providers:
  - `src/app/authProvider.ts`
  - `src/app/accessControlProvider.ts`
  - `src/hooks/usePermissions.ts`

## Security Headers

Configured in `nginx.conf`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS)
- CSP with current migration constraints

## CSP Migration

- Guidance and helper scripts are documented in `docs/06-operations/csp-nonce.md`
- Current baseline still allows `style-src 'unsafe-inline'` in `nginx.conf`
- Keep enforcement rollout aligned with CI CSP checks

## Data Handling

- Do not log or expose raw PAN
- Keep sensitive field masking intact in UI
- Preserve maker-checker separation of duties in approval flows
