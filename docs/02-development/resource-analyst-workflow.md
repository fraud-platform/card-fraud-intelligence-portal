# Analyst Workflow Spec

Last Updated: 2026-01-28

## Overview
Analysts review suspicious transactions through a structured flow:
Worklist → Transaction Review → Notes → Case → Resolution.

## Core User Stories
1. As an analyst, I can claim the next high-priority review.
2. As an analyst, I can change review status (Pending → In Review → Resolved).
3. As an analyst, I can add or edit notes tied to a transaction.
4. As an analyst, I can create or attach a case to a transaction.
5. As a supervisor, I can resolve cases and track outcomes.

## Workflow Stages
### 1) Worklist
- Purpose: prioritized queue for review.
- Actions: claim next, assign to me, set status to In Review.
- Filters: status, risk level, priority, assigned only.

### 2) Transaction Review
- Single detail view with tabs:
  - Details
  - Rule Matches
  - Notes
- Sidebar actions:
  - Assign
  - Escalate
  - Resolve
  - Status transitions

### 3) Notes
- Note types: General, Initial Review, Fraud Confirmed, Resolution, etc.
- Requirements:
  - Edit existing notes
  - Mark privacy
  - Link to case when present

### 4) Case Management
- Case is the investigation container.
- Actions:
  - Assign to analyst
  - Add/remove transactions
  - Resolve case
- Case status and type must align with backend schema.

### 5) Resolution
- Resolution codes: Fraud Confirmed, False Positive, Legitimate, etc.
- Capture resolution summary and decision override if applicable.

## Acceptance Criteria
- Analysts can complete end-to-end review without leaving the app.
- Every status transition is validated by backend rules.
- Notes and case actions reflect immediately in the UI.

## Metrics
- Avg time in queue
- Resolution time
- Resolution breakdown by code
