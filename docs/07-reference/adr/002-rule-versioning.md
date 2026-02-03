# ADR-002: Rule Versioning and Immutable Approvals

Date: 2026-01-28
Status: Accepted

## Context
Rules must be auditable and immutable once approved. Analysts need to reference a specific rule version from transactions, and makers must create new versions for changes.

## Decision
- Store immutable rule versions with explicit version identifiers.
- Approved versions are immutable; edits require a new version.
- UI deep links to rule show accept `versionId` or `version` query params.

## Alternatives Considered
- Single mutable rule record: rejected due to audit/compliance risk.
- Time-based snapshots only: insufficient for approvals.

## Consequences
- Clear audit trail for approvals and matches.
- Slightly more complex UI with version-aware navigation.

## Links
- ../02-resources/rule-management.md
- ../03-api/contracts.md
