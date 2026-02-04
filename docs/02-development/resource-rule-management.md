# Rule Management

Scope: rule authoring and governance flows.

## Main Screens

- `src/resources/ruleFields/`
- `src/resources/rules/`
- `src/resources/ruleSets/`
- `src/resources/approvals/`
- `src/resources/auditLogs/`

## Key Behaviors

- Rules and rule sets use versioned workflows
- Maker-checker review is enforced by backend and surfaced in UI
- Approved artifacts are treated as immutable in UI flows

## Related Endpoints

See `src/api/endpoints.ts`:

- `RULE_FIELDS`
- `RULES`
- `RULE_VERSIONS`
- `RULESETS`
- `RULESET_VERSIONS`
- `APPROVALS`
- `AUDIT_LOGS`
