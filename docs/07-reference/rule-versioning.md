# Rule Versioning Decision

Immutable rule versioning and approval model used by this UI and backend contracts.

Last verified: February 13, 2026.

## Context

Rules must be auditable and immutable once approved. Analysts need to reference a specific rule version from transactions, and makers must create new versions for changes.

## Decision

- Store immutable rule versions with explicit version identifiers.
- Approved versions are immutable; edits require creating a new version.
- UI deep links to rule show support version context via route/query parameters.

## Consequences

- Clear audit trail for approvals and investigation traceability.
- Version-aware navigation and UI state management complexity increases.

## Related References

- API guide: `docs/03-api/README.md`
- Auth and roles model: `docs/07-reference/auth-model.md`
- Rule validation loop: `docs/07-reference/rule-validation-loop.md`
