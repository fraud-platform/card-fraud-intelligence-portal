# Analyst UI IA/UX Spec

Last Updated: 2026-01-28

## Information Architecture
### Primary Navigation (Fraud Operations)
- Analyst Home
- Worklist
- Transactions
- Cases
- Metrics

### Secondary Navigation
- Within Transaction Show: Details | Rule Matches | Notes
- Within Case Show: Overview | Transactions | Activity

## Screen Layouts
### Analyst Home
- Queue overview cards
- Priority backlog summary
- Risk distribution summary
- Saved views (quick filters)

### Worklist
- Quick views row (Assigned, Critical, High Risk, Escalated)
- Filters row (Status, Priority, Risk, Assigned)
- Stats cards
- Table with quick actions

### Transaction Show
- Left: tabbed content (Details, Rules, Notes)
- Right: review actions panel
- Notes are editable inline

### Case Show
- Header summary (status, type, risk)
- Transactions table
- Activity timeline
- Actions: assign, resolve, add/remove transaction

## Core User Stories
- Find highest priority reviews quickly
- Minimize navigation to complete a review
- Keep notes and actions visible in context

## Accessibility
- All actions reachable by keyboard
- Clear focus states on primary actions
- Avoid overreliance on color for status

## UI Tone & Copy
- Use action-oriented labels ("Assigned to me", "Rule Matches")
- Avoid technical jargon in analyst-facing areas
- Use consistent capitalization and sentence case

## Acceptance Criteria
- Navigation supports end-to-end analyst flow without dead ends
- Key actions are visible without scrolling on standard screens
- Consistent labels across worklist, transaction, and case views
