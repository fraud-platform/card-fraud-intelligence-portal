# ConditionBuilder Validation Quick Reference

## TL;DR

The ConditionBuilder now validates all user inputs to prevent XSS, SQL injection, and invalid data.

## For Users

### What Changed?

- String inputs limited to 1,000 characters (with counter)
- Multi-value inputs limited to 100 values (with counter)
- Invalid inputs show red borders and error messages
- XSS and injection attempts are blocked automatically

### Visual Indicators

| Indicator             | Meaning                             |
| --------------------- | ----------------------------------- |
| Red border on card    | Condition has validation errors     |
| ⚠️ icon in card title | Validation errors present           |
| Red alert box         | Lists all errors for that condition |
| Red input border      | That specific field is invalid      |
| `150/1000` counter    | Character count for strings         |
| `5/100` counter       | Value count for multi-values        |
| Yellow top banner     | Some conditions have errors         |

### Common Errors

| Error Message                                            | Fix                          |
| -------------------------------------------------------- | ---------------------------- |
| "Please select a field"                                  | Choose a field from dropdown |
| "Operator 'LIKE' is not allowed for field type 'NUMBER'" | Choose compatible operator   |
| "Value must be a valid number"                           | Enter numbers only           |
| "String must not exceed 1000 characters"                 | Shorten your text            |
| "Input contains potentially dangerous SQL patterns"      | Remove SQL keywords          |
| "At least one value is required"                         | Add at least one value       |
| "Cannot have more than 100 values"                       | Reduce number of values      |

## For Developers

### Quick Import

```tsx
import ConditionBuilder from "@/resources/rules/components/ConditionBuilder";
import { validateConditionTree } from "@/resources/rules/components/ConditionBuilder/api";
```

### Basic Usage

```tsx
function MyForm() {
  const [conditions, setConditions] = useState<ConditionNode>();

  return <ConditionBuilder value={conditions} onChange={setConditions} />;
}
```

### Validate Before Submit

```tsx
import { validateConditionTree } from "@/resources/rules/components/ConditionBuilder";
import { useList } from "@refinedev/core";

function MyForm() {
  const [conditions, setConditions] = useState<ConditionNode>();
  const { data } = useList<RuleField>({ resource: "rule-fields" });
  const fields = data?.data ?? [];

  const handleSubmit = () => {
    const { valid, errors } = validateConditionTree(conditions, fields);

    if (!valid) {
      message.error("Fix validation errors first");
      return;
    }

    // Safe to submit
    api.saveRule(conditions);
  };

  return (
    <>
      <ConditionBuilder value={conditions} onChange={setConditions} />
      <Button onClick={handleSubmit}>Save</Button>
    </>
  );
}
```

### Direct Validation Functions

```tsx
import {
  sanitizeString,
  validateNumberValue,
  validateDateValue,
  validatePredicate,
} from "@/resources/rules/components/ConditionBuilder/validation";

// Sanitize user input
const clean = sanitizeString(userInput);

// Validate a number
const { valid, errors, sanitizedValue } = validateNumberValue(42);

// Validate complete predicate
const result = validatePredicate("amount", Operator.GT, 100, fields);
```

### Constants

```tsx
import {
  MAX_STRING_LENGTH,
  MAX_MULTI_VALUES,
} from "@/resources/rules/components/ConditionBuilder/validation";

console.log(MAX_STRING_LENGTH); // 1000
console.log(MAX_MULTI_VALUES); // 100
```

## Validation Rules Reference

### Field Validation

- ✅ Must exist in allowed fields list
- ✅ Must be active (`is_active = true`)
- ✅ Field key max 100 characters

### Operator Validation

- ✅ Must be valid enum value
- ✅ Must match field's data type
- ✅ Must be in field's allowed operators

### String Values

- ✅ Max 1,000 characters
- ✅ XSS patterns removed/encoded
- ✅ SQL injection patterns detected
- ✅ NoSQL injection patterns detected
- ✅ HTML special chars encoded

### Number Values

- ✅ Must be finite number
- ✅ Within safe integer range
- ✅ Not NaN or Infinity

### Date Values

- ✅ Must be valid ISO 8601 date
- ✅ Must parse to valid Date object

### Range Values (BETWEEN)

- ✅ Must be array with 2 elements
- ✅ Min must be ≤ Max
- ✅ Both values validated by type

### Multi-Values (IN, NOT_IN)

- ✅ Must be array
- ✅ At least 1 value required
- ✅ Max 100 values
- ✅ Each value validated by type

## Security Features

### XSS Prevention

```tsx
// Input:  <script>alert('xss')</script>
// Output: &lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;
```

### SQL Injection Detection

```tsx
// Input:  ' OR 1=1 --
// Result: ERROR - SQL_INJECTION_DETECTED
```

### NoSQL Injection Detection

```tsx
// Input:  {"$where": "attack"}
// Result: ERROR - NOSQL_INJECTION_DETECTED
```

## Error Codes

| Code                       | Description                      |
| -------------------------- | -------------------------------- |
| `FIELD_REQUIRED`           | No field selected                |
| `INVALID_FIELD`            | Field doesn't exist              |
| `FIELD_INACTIVE`           | Field is not active              |
| `OPERATOR_REQUIRED`        | No operator selected             |
| `INVALID_OPERATOR`         | Invalid operator enum            |
| `OPERATOR_NOT_ALLOWED`     | Operator incompatible with field |
| `VALUE_REQUIRED`           | Missing required value           |
| `STRING_TOO_LONG`          | Exceeds max length               |
| `SQL_INJECTION_DETECTED`   | SQL patterns found               |
| `NOSQL_INJECTION_DETECTED` | NoSQL patterns found             |
| `INVALID_NUMBER`           | Not a valid number               |
| `NUMBER_OUT_OF_RANGE`      | Number too large/small           |
| `INVALID_DATE`             | Invalid date format              |
| `INVALID_BOOLEAN`          | Not true/false                   |
| `INVALID_RANGE`            | Range values invalid             |
| `TOO_MANY_VALUES`          | Exceeds max array size           |

## Testing Validation

### Test XSS Prevention

```tsx
// Try entering this in a string field:
<script>alert('xss')</script>
// Should be sanitized and displayed safely
```

### Test SQL Injection Detection

```tsx
// Try entering this:
' OR 1=1 --
// Should show SQL_INJECTION_DETECTED error
```

### Test Length Limits

```tsx
// Paste 1500 characters in a string field
// Should be truncated at 1000 characters
```

### Test Type Validation

```tsx
// Try entering "abc" in a number field
// Should show INVALID_NUMBER error
```

## Performance

- **Validation Speed**: < 1ms for typical trees
- **Re-validation**: Only on input change (memoized)
- **Large Trees**: ~2-3ms for 100+ nodes

## Common Patterns

### Prevent Submit with Errors

```tsx
const [hasErrors, setHasErrors] = useState(false);

useEffect(() => {
  const { valid } = validateConditionTree(conditions, fields);
  setHasErrors(!valid);
}, [conditions, fields]);

return (
  <Button onClick={handleSubmit} disabled={hasErrors}>
    Save
  </Button>
);
```

### Show Error Count

```tsx
const { errors } = validateConditionTree(conditions, fields);

return (
  <Badge count={errors.length}>
    <Button>Save Rule</Button>
  </Badge>
);
```

### Custom Error Display

```tsx
const { valid, errors } = validateConditionTree(conditions, fields);

return (
  <>
    {errors.map((err, i) => (
      <Alert
        key={i}
        type="error"
        message={err.message}
        description={`Field: ${err.field}, Code: ${err.code}`}
      />
    ))}
  </>
);
```

## Troubleshooting

### "Field is not active"

- Field exists but `is_active = false`
- **Fix**: Activate the field in field management

### "Operator not allowed"

- Operator incompatible with field type
- **Fix**: Check field's `allowed_operators` list

### Validation not updating

- Check that fields are loaded
- **Fix**: Ensure `useList<RuleField>` query succeeded

### Too many re-renders

- Validation might be causing infinite loop
- **Fix**: Wrap validation in `useMemo` with proper deps

## Best Practices

1. ✅ Always validate before submit
2. ✅ Show validation errors to users
3. ✅ Use exported `validateConditionTree` function
4. ✅ Load active fields only for dropdown
5. ✅ Don't bypass validation for "admin" users
6. ✅ Add backend validation as second layer
7. ✅ Log suspected injection attempts
8. ✅ Keep validation patterns updated

## Links

- [Full Validation Guide](./VALIDATION.md)
- [Implementation Details](./IMPLEMENTATION_SUMMARY.md)
- [Test Cases](./validation.test.ts)
- [Source Code](./validation.ts)

## Support

For issues or questions:

1. Check the full [VALIDATION.md](./VALIDATION.md) guide
2. Review test cases in `validation.test.ts`
3. Contact the security team for injection concerns
