# Operations

Canonical operations runbook for runtime incidents and integration failures.

Last verified: February 13, 2026.

## Critical Health Checks

1. UI reachable: `http://localhost:5173`
2. Rule-management health: `http://localhost:8000/api/v1/health`
3. Transaction-management health: `http://localhost:8002/api/v1/health`

## Incident Triage Workflow

1. Capture route URL and user role in use.
2. Capture failing API call + status code from network tab.
3. Confirm service health and CORS origins.
4. Reproduce via targeted E2E spec.
5. Attach screenshot and console/network errors.

## Symptom Runbook

### Rule pages fail, analyst pages work

- Check rule-management service (`8000`).
- Check CORS config includes `http://localhost:5173`.

### Analyst pages fail (`/transactions`, `/worklist`, `/cases`)

- Check transaction-management service (`8002`).
- Validate routing rules in `src/api/httpClient.ts`.
- Check CORS and auth mode alignment.

### Infinite spinner/loading pages

- Check for unresolved API requests.
- Validate response shape against UI expectation.
- Run focused Chromium E2E for that page.

## Security Guardrails

- Never log PAN/sensitive values.
- Preserve masked display behavior.
- Maintain maker/checker boundary across all workflow actions.

## CSP Verification Commands

- `pnpm csp:serve`
- `pnpm csp:test`
- `pnpm csp:enforce`

## Evidence to Include in Incident Reports

- Timestamp
- Route
- Role
- Endpoint + status
- Screenshot
- Console/network excerpts

## Deep-Dive Guides

- Monitoring guidance: `docs/06-operations/monitoring.md`
- Security guidance: `docs/06-operations/security.md`
- CSP nonce runbook: `docs/06-operations/csp-nonce.md`
