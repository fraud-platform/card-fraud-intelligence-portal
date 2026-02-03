# ADR-003: Analyst Workflow Architecture

Date: 2026-01-28
Status: Accepted

## Context
Analysts need a fast review loop across Worklist → Transaction → Notes → Case → Resolution. The UI must minimize navigation friction and ensure status transitions are predictable.

## Decision
- Use Worklist as the primary queue entry point.
- Transaction Show hosts review actions and notes in a right-side panel.
- Cases act as investigation containers with explicit case actions.
- Combined transaction overview API reduces redundant fetches.

## Alternatives Considered
- Separate Review page: rejected due to extra navigation steps.
- Notes-only in cases: rejected; analysts need transaction-level notes.

## Consequences
- Faster analyst workflow with fewer context switches.
- Requires UI coordination between worklist, transaction detail, and case actions.

## Links
- ../02-resources/transaction-management.md
- ../07-rule-validation-loop.md
