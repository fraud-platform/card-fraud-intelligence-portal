# ConditionBuilder Input Validation

This document describes the comprehensive input validation and security measures implemented in the ConditionBuilder component.

## Overview

The ConditionBuilder component includes multiple layers of validation to ensure data integrity and prevent security vulnerabilities including XSS attacks, SQL injection, and NoSQL injection.

## Security Features

### 1. XSS Prevention

All string inputs are sanitized to prevent Cross-Site Scripting (XSS) attacks:

- **HTML Encoding**: Special characters (`<`, `>`, `&`, `"`, `'`, `/`) are encoded
- **Script Tag Removal**: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>` tags are removed
- **Event Handler Blocking**: Inline event handlers (`onclick`, `onload`, etc.) are blocked
- **JavaScript Protocol Blocking**: `javascript:` URLs are blocked
- **Dangerous JS Functions**: `eval()`, `document.cookie`, `document.write` are blocked

### 2. SQL Injection Prevention

String values are checked for SQL injection patterns:

- SQL keywords (SELECT, INSERT, UPDATE, DELETE, DROP, etc.)
- SQL operators and comment syntax (`--`, `/*`, `*/`)
- Boolean-based injection patterns (`OR 1=1`, `AND 1=1`)

### 3. NoSQL Injection Prevention

String values are checked for NoSQL injection patterns:

- MongoDB operators (`$where`, `$regex`, `$ne`, etc.)
- JSON injection patterns

### 4. Input Length Limits

- **String Values**: Maximum 1,000 characters
- **Field Keys**: Maximum 100 characters
- **Multi-Value Arrays**: Maximum 100 values per array

### 5. Type Validation

Values are validated against their expected data types:

- **Number**: Must be finite, within safe integer range
- **Date**: Must be valid ISO date string
- **Boolean**: Must be true/false
- **String**: Must pass sanitization and injection checks

### 6. Operator Validation

- Operators must be from the allowed enum
- Operators must match the field's data type
- Operators must be in the field's allowed operators list

### 7. Field Validation

- Field must exist in the allowed fields list
- Field must be active (`is_active = true`)
- Field key must be valid and not tampered with

## Usage

### In the Component

The ConditionBuilder automatically validates all inputs and displays errors inline:

```tsx
import { ConditionBuilder } from "./components/ConditionBuilder";

function MyComponent() {
  const [conditions, setConditions] = useState<ConditionNode>();

  return <ConditionBuilder value={conditions} onChange={setConditions} />;
}
```

### Validation Before Submission

Use the exported `validateConditionTree` function to check validity before submitting:

```tsx
import ConditionBuilder from "./components/ConditionBuilder";
import { validateConditionTree } from "./components/ConditionBuilder/api";

function MyComponent() {
  const [conditions, setConditions] = useState<ConditionNode>();
  const { data: fieldsData } = useList<RuleField>({ resource: "rule-fields" });
  const fields = fieldsData?.data ?? [];

  const handleSubmit = () => {
    const validation = validateConditionTree(conditions, fields);

    if (!validation.valid) {
      console.error("Validation errors:", validation.errors);
      message.error("Please fix validation errors before submitting");
      return;
    }

    // Proceed with submission
    submitRule(conditions);
  };

  return (
    <>
      <ConditionBuilder value={conditions} onChange={setConditions} />
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  );
}
```

## Validation Error Types

### Field Errors

- `FIELD_REQUIRED`: No field selected
- `FIELD_KEY_TOO_LONG`: Field key exceeds maximum length
- `INVALID_FIELD`: Selected field doesn't exist
- `FIELD_INACTIVE`: Selected field is not active

### Operator Errors

- `OPERATOR_REQUIRED`: No operator selected
- `INVALID_OPERATOR`: Operator not in allowed enum
- `OPERATOR_NOT_ALLOWED`: Operator not allowed for this field type

### Value Errors

- `VALUE_REQUIRED`: Value is required but missing
- `INVALID_TYPE`: Value type doesn't match expected type
- `STRING_TOO_LONG`: String exceeds maximum length
- `SQL_INJECTION_DETECTED`: String contains SQL injection patterns
- `NOSQL_INJECTION_DETECTED`: String contains NoSQL injection patterns
- `INVALID_NUMBER`: Value is not a valid number
- `NUMBER_OUT_OF_RANGE`: Number exceeds safe range
- `INVALID_DATE`: Value is not a valid date
- `INVALID_BOOLEAN`: Value is not a boolean
- `INVALID_RANGE`: Range values are invalid or min > max
- `INVALID_MULTI_VALUE`: Multi-value input is not an array
- `TOO_MANY_VALUES`: Multi-value array exceeds maximum count

### Logical Operator Errors

- `LOGICAL_OPERATOR_REQUIRED`: Missing AND/OR operator
- `INVALID_LOGICAL_OPERATOR`: Invalid logical operator

## Visual Indicators

### Error Display

When validation errors occur:

1. **Card Border**: Condition cards with errors show a red border
2. **Error Icon**: An exclamation icon appears in the card title
3. **Alert Box**: A red alert displays all validation errors for that condition
4. **Input Status**: Invalid inputs show red borders
5. **Top-Level Warning**: A warning banner appears when any errors exist

### Character Limits

- String inputs show character count: `150/1000`
- Multi-value inputs show value count: `5/100`

## Direct Import of Validation Functions

Advanced users can import individual validation functions:

```tsx
import {
  sanitizeString,
  validateNumberValue,
  validateDateValue,
  validatePredicate,
  MAX_STRING_LENGTH,
  MAX_MULTI_VALUES,
} from "./components/ConditionBuilder/validation";

// Sanitize user input
const clean = sanitizeString(userInput);

// Validate a number
const result = validateNumberValue(42);
if (result.valid) {
  console.log("Sanitized value:", result.sanitizedValue);
} else {
  console.error("Errors:", result.errors);
}
```

## Configuration Constants

All validation limits are defined as constants in `validation.ts`:

```typescript
export const MAX_STRING_LENGTH = 1000;
export const MAX_FIELD_KEY_LENGTH = 100;
export const MAX_MULTI_VALUES = 100;
export const MAX_NUMBER_VALUE = Number.MAX_SAFE_INTEGER;
export const MIN_NUMBER_VALUE = Number.MIN_SAFE_INTEGER;
```

These can be imported and used throughout the application for consistency.

## Testing Validation

To test the validation:

1. **XSS Test**: Try entering `<script>alert('xss')</script>` - it will be sanitized
2. **SQL Injection Test**: Try `' OR 1=1 --` - it will be detected and blocked
3. **Length Test**: Paste text longer than 1,000 characters - it will be truncated
4. **Type Test**: Try entering text in a number field - validation error will appear
5. **Range Test**: Set max value less than min value - validation error will appear

## Security Best Practices

1. **Never Trust Client Validation**: Always validate on the backend as well
2. **Sanitize Before Storage**: All values are sanitized before being stored
3. **Encode on Display**: When displaying values, use proper encoding
4. **Regular Updates**: Keep XSS and injection patterns up to date
5. **Log Suspicious Activity**: Consider logging when injection attempts are detected

## Performance Considerations

- Validation runs on every input change
- Uses React memoization to prevent unnecessary re-validation
- Validation is synchronous and fast (< 1ms for typical trees)
- Large condition trees (100+ nodes) may see slight lag

## Future Enhancements

Potential improvements:

1. **Async Validation**: Backend validation for complex rules
2. **Custom Field Validators**: Per-field validation rules
3. **Regex Pattern Validation**: For fields with specific formats
4. **Whitelist Validation**: For enum fields with predefined values
5. **Cross-Field Validation**: Validate relationships between fields
6. **Rate Limiting**: Prevent rapid-fire validation attempts
