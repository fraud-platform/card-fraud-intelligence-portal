# Rule Validation Loop (Spec)

Last Updated: 2026-01-28
Owner: Fraud Intelligence UI
Status: Draft

## Overview
The Rule Validation Loop lets rule authors validate a draft rule against recent transaction data before submitting for approval. The UI provides a simulation entry point from Rule Show, runs a server-side evaluation, and summarizes the impact (match counts, sampled transactions, and potential decision impact).

## Goals
- Enable authors to test a draft rule against a queryable transaction set.
- Provide fast feedback (match count + sample matches).
- Keep the workflow within Rule Show without leaving context.
- Record simulation metadata for future audit/analysis.

## Non-Goals
- Not a real-time rule execution engine.
- Not a replacement for production outcomes or approvals.
- Not a performance benchmark.

## Workflow
1. Author opens Rule Show.
2. Select "Validate Rule" (simulation modal).
3. Choose a sample window (e.g., last 7/30/90 days), optional filters.
4. Submit request to simulation endpoint.
5. Show results:
   - total matched transactions
   - match rate vs sample size
   - top reasons (if provided)
   - sample of matched transactions
6. Optional follow-up: save simulation snapshot or export results.

## UI Entry Point
- Location: Rule Show page (modal).
- Inputs:
  - time window (required)
  - evaluation scope (optional): decision status, risk level, amount band
  - sample limit (optional)
- Output:
  - match count
  - match percentage
  - sample table (transaction id, timestamp, amount, decision)
  - notes for author

## API Contract
### POST /rules/simulate
**Request**
```json
{
  "rule_id": "rule_123",
  "rule_version_id": "rv_456",
  "time_window_days": 30,
  "filters": {
    "decision": "DECLINE",
    "risk_level": "HIGH",
    "min_amount": 1000,
    "max_amount": 10000
  },
  "sample_limit": 50
}
```

**Response**
```json
{
  "simulation_id": "sim_789",
  "rule_id": "rule_123",
  "rule_version_id": "rv_456",
  "time_window_days": 30,
  "sample_size": 1200,
  "matched_count": 84,
  "match_rate": 0.07,
  "top_reasons": [
    { "reason": "velocity_match", "count": 32 },
    { "reason": "mcc_match", "count": 24 }
  ],
  "matched_samples": [
    {
      "transaction_id": "txn_1",
      "transaction_timestamp": "2026-01-20T12:45:00Z",
      "amount": 1420.55,
      "currency": "USD",
      "decision": "DECLINE",
      "risk_level": "HIGH"
    }
  ],
  "created_at": "2026-01-28T10:00:00Z"
}
```

**Errors**
- 400: validation error (invalid filters or sample limit)
- 404: rule/version not found
- 422: malformed rule definition
- 429: rate limited
- 500: simulation failed

## UX Copy
- Primary button: "Validate Rule"
- Modal title: "Rule Validation"
- Empty state: "No matches in the selected window."
- Error state: "Simulation failed. Update filters or try again."

## Telemetry
- simulation_started
- simulation_completed
- simulation_failed
- fields: rule_id, rule_version_id, time_window_days, sample_limit, matched_count

## Backlog Tasks
- [ ] Add sample window presets (7/30/90 days)
- [ ] Add "Save snapshot" for audit history
- [ ] Support CSV export for sample results
- [ ] Add notes field to persist rationale

## Acceptance Criteria
- Author can run validation from Rule Show and see results.
- Results include match count, rate, and a sample list.
- Errors are visible and actionable.
- API contract aligns with backend simulate endpoint.
