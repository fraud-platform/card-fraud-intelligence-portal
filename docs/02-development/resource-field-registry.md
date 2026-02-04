# Field Registry

Rule fields are metadata-driven and determine what can be used in rule condition builders.

## Data Source

- Primary endpoints: `RULE_FIELDS` in `src/api/endpoints.ts`
- Registry endpoints: `FIELD_REGISTRY` in `src/api/endpoints.ts`

## Important Attributes

- `field_key`
- `display_name`
- `data_type`
- `allowed_operators`
- `multi_value_allowed`
- `is_sensitive`
- `is_active`

## UI References

- List/create/edit: `src/resources/ruleFields/`
- Condition builder usage: `src/resources/rules/components/ConditionBuilder/`
