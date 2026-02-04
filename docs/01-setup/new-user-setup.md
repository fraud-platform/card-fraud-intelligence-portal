# New User Setup

End-to-end onboarding checklist for new contributors.

## Access Needed

- GitHub access to this repository
- Doppler access to `card-fraud-intelligence-portal`
- (Optional) Auth0 access for production-like auth testing

## Onboarding Steps

1. Clone repository
2. Install dependencies with `pnpm install`
3. Login to Doppler and run project setup
4. Start app with `pnpm dev`
5. Run verification checklist

## Verify

Use `docs/01-setup/verification.md` for full checks.

## Auth Notes

Role and permission model is documented in:

- `docs/07-reference/auth-model.md`

## Cross-Repo Local Integration (Optional)

For full local integration, also run backend services and ensure both expose `/api/v1` endpoints.

## Next

- Development workflow: `docs/02-development/workflow.md`
