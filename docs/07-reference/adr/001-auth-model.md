# ADR-001: Auth Model for UI

Date: 2026-01-28
Status: Accepted

## Context
The UI supports Auth0 in production and a lightweight local session token fallback for development. It must align with RBAC (maker/checker, analyst/supervisor) while keeping local onboarding friction low.

## Decision
- Use Auth0 SPA SDK in production with scope-based authorization.
- Use a local session token + role payload for development.
- Derive UI capabilities via `usePermissions` from token scopes with role fallback.

## Alternatives Considered
- Single auth mode (Auth0-only): rejected due to developer onboarding friction.
- Custom auth server: unnecessary complexity for UI.

## Consequences
- Dev onboarding is faster without Auth0 setup.
- Requires robust guardrails to prevent local auth paths in production.

## Links
- ../AUTH_MODEL.md
- ../00-getting-started/setup.md
