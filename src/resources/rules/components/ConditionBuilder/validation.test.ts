/**
 * Tests for ConditionBuilder Validation
 *
 * These tests verify that input validation and sanitization work correctly.
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  detectSqlInjection,
  detectNoSqlInjection,
  sanitizeAndValidateString,
  validateNumberValue,
  validateDateValue,
  validateBooleanValue,
  validateRangeValue,
  validateMultiValue,
  validateFieldKey,
  validateOperator,
  validatePredicate,
  validateLogicalOperator,
  validateValue,
  MAX_STRING_LENGTH,
  MAX_MULTI_VALUES,
} from "./validation";
import { DataType, Operator, LogicalOperator } from "../../../../types/enums";
import type { RuleField } from "../../../../types/domain";

// Mock rule fields for testing
const mockFields: RuleField[] = [
  {
    field_key: "transaction_amount",
    display_name: "Transaction Amount",
    data_type: DataType.NUMBER,
    allowed_operators: [
      Operator.EQ,
      Operator.GT,
      Operator.LT,
      Operator.BETWEEN,
      Operator.IS_NULL,
      Operator.IS_NOT_NULL,
    ],
    multi_value_allowed: false,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    field_key: "merchant_name",
    display_name: "Merchant Name",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ, Operator.LIKE, Operator.IN, Operator.NOT_IN],
    multi_value_allowed: true,
    is_sensitive: false,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    field_key: "card_number",
    display_name: "Card Number",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ],
    multi_value_allowed: false,
    is_sensitive: true,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    field_key: "inactive_field",
    display_name: "Inactive Field",
    data_type: DataType.STRING,
    allowed_operators: [Operator.EQ],
    multi_value_allowed: false,
    is_sensitive: false,
    is_active: false,
    created_at: "2024-01-01T00:00:00Z",
  },
];

describe("String Sanitization", () => {
  it("should encode HTML special characters", () => {
    const input = "<div>Test & \"quotes\" and 'apostrophes'</div>";
    const result = sanitizeString(input);
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
  });

  it("should remove script tags", () => {
    const input = '<script>alert("XSS")</script>Normal text';
    const result = sanitizeString(input);
    expect(result).not.toContain("script");
    expect(result).not.toContain("alert");
  });

  it("should remove inline event handlers", () => {
    const input = '<img src="x" onerror="alert(1)" />';
    const result = sanitizeString(input);
    expect(result).not.toContain("onerror");
  });

  it("should block javascript: protocol", () => {
    const input = "javascript:alert(1)";
    const result = sanitizeString(input);
    expect(result).not.toContain("javascript:");
  });
});

describe("SQL Injection Detection", () => {
  it("should detect SQL keywords", () => {
    expect(detectSqlInjection("SELECT * FROM users")).toBe(true);
    expect(detectSqlInjection("DROP TABLE users")).toBe(true);
    expect(detectSqlInjection("INSERT INTO users")).toBe(true);
  });

  it("should detect SQL comments", () => {
    expect(detectSqlInjection("admin' --")).toBe(true);
    expect(detectSqlInjection("/* comment */")).toBe(true);
  });

  it("should detect boolean-based injection", () => {
    expect(detectSqlInjection("' OR 1=1 --")).toBe(true);
    expect(detectSqlInjection("' AND 1=1 --")).toBe(true);
  });

  it("should not flag normal strings", () => {
    expect(detectSqlInjection("John Doe")).toBe(false);
    expect(detectSqlInjection("test@example.com")).toBe(false);
  });
});

describe("NoSQL Injection Detection", () => {
  it("should detect MongoDB operators", () => {
    expect(detectNoSqlInjection('{"$where": "this.a == this.b"}')).toBe(true);
    expect(detectNoSqlInjection('{"$ne": null}')).toBe(true);
  });

  it("should not flag normal JSON", () => {
    expect(detectNoSqlInjection('{"name": "test"}')).toBe(false);
  });
});

describe("String Validation", () => {
  it("should pass valid strings", () => {
    const result = sanitizeAndValidateString("Normal text");
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toBeDefined();
  });

  it("should reject strings that are too long", () => {
    const longString = "a".repeat(MAX_STRING_LENGTH + 1);
    const result = sanitizeAndValidateString(longString);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe("STRING_TOO_LONG");
  });

  it("should reject SQL injection attempts", () => {
    const result = sanitizeAndValidateString("' OR 1=1 --");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("SQL_INJECTION_DETECTED");
  });

  it("should reject NoSQL injection attempts", () => {
    const result = sanitizeAndValidateString('{"$where": "attack"}');
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("NOSQL_INJECTION_DETECTED");
  });
});

describe("Number Validation", () => {
  it("should accept valid numbers", () => {
    const result = validateNumberValue(42);
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toBe(42);
  });

  it("should accept zero", () => {
    const result = validateNumberValue(0);
    expect(result.valid).toBe(true);
  });

  it("should accept BLOCKLIST numbers", () => {
    const result = validateNumberValue(-100);
    expect(result.valid).toBe(true);
  });

  it("should reject NaN", () => {
    const result = validateNumberValue("not a number");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_NUMBER");
  });

  it("should reject Infinity", () => {
    const result = validateNumberValue(Infinity);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_NUMBER");
  });

  it("should reject null/undefined", () => {
    const result = validateNumberValue(null);
    expect(result.valid).toBe(false);
  });
});

describe("Date Validation", () => {
  it("should accept valid ISO date strings", () => {
    const result = validateDateValue("2024-01-01T00:00:00Z");
    expect(result.valid).toBe(true);
  });

  it("should reject invalid date strings", () => {
    const result = validateDateValue("not a date");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_DATE");
  });

  it("should reject non-string values", () => {
    const result = validateDateValue(12345);
    expect(result.valid).toBe(false);
  });
});

describe("Boolean Validation", () => {
  it("should accept true", () => {
    const result = validateBooleanValue(true);
    expect(result.valid).toBe(true);
  });

  it("should accept false", () => {
    const result = validateBooleanValue(false);
    expect(result.valid).toBe(true);
  });

  it("should reject non-boolean values", () => {
    const result = validateBooleanValue("true");
    expect(result.valid).toBe(false);
  });
});

describe("Range Validation", () => {
  it("should accept valid number range", () => {
    const result = validateRangeValue([10, 20], DataType.NUMBER);
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toEqual([10, 20]);
  });

  it("should reject range where min > max", () => {
    const result = validateRangeValue([20, 10], DataType.NUMBER);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_RANGE");
  });

  it("should accept valid date range", () => {
    const result = validateRangeValue(
      ["2024-01-01T00:00:00Z", "2024-12-31T23:59:59Z"],
      DataType.DATE
    );
    expect(result.valid).toBe(true);
  });

  it("should reject invalid array format", () => {
    const result = validateRangeValue([10], DataType.NUMBER);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_RANGE");
  });
});

describe("Multi-Value Validation", () => {
  it("should accept valid array of numbers", () => {
    const result = validateMultiValue([1, 2, 3], DataType.NUMBER);
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toEqual([1, 2, 3]);
  });

  it("should reject empty arrays", () => {
    const result = validateMultiValue([], DataType.NUMBER);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("VALUE_REQUIRED");
  });

  it("should reject arrays with too many values", () => {
    const longArray = new Array(MAX_MULTI_VALUES + 1).fill(1);
    const result = validateMultiValue(longArray, DataType.NUMBER);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("TOO_MANY_VALUES");
  });

  it("should validate each value in the array", () => {
    const result = validateMultiValue([1, "invalid", 3], DataType.NUMBER);
    expect(result.valid).toBe(false);
  });
});

describe("Field Key Validation", () => {
  it("should accept valid active field", () => {
    const result = validateFieldKey("transaction_amount", mockFields);
    expect(result.valid).toBe(true);
  });

  it("should reject inactive field", () => {
    const result = validateFieldKey("inactive_field", mockFields);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("FIELD_INACTIVE");
  });

  it("should reject non-existent field", () => {
    const result = validateFieldKey("fake_field", mockFields);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_FIELD");
  });

  it("should reject empty field key", () => {
    const result = validateFieldKey("", mockFields);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("FIELD_REQUIRED");
  });
});

describe("Operator Validation", () => {
  it("should accept allowed operator for field type", () => {
    const field = mockFields[0]; // transaction_amount (NUMBER)
    const result = validateOperator(Operator.GT, field);
    expect(result.valid).toBe(true);
  });

  it("should reject operator not in field's allowed list", () => {
    const field = mockFields[0]; // only allows EQ, GT, LT, BETWEEN
    const result = validateOperator(Operator.LIKE, field);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("OPERATOR_NOT_ALLOWED");
  });
});

describe("Logical Operator Validation", () => {
  it("should accept AND", () => {
    const result = validateLogicalOperator(LogicalOperator.AND);
    expect(result.valid).toBe(true);
  });

  it("should accept OR", () => {
    const result = validateLogicalOperator(LogicalOperator.OR);
    expect(result.valid).toBe(true);
  });

  it("should reject invalid operator", () => {
    const result = validateLogicalOperator("INVALID");
    expect(result.valid).toBe(false);
  });
});

describe("Complete Predicate Validation", () => {
  it("should validate complete valid predicate", () => {
    const result = validatePredicate("transaction_amount", Operator.GT, 100, mockFields);
    expect(result.valid).toBe(true);
  });

  it("should catch invalid field", () => {
    const result = validatePredicate("fake_field", Operator.EQ, "value", mockFields);
    expect(result.valid).toBe(false);
  });

  it("should catch invalid operator for field", () => {
    const result = validatePredicate("transaction_amount", Operator.LIKE, "value", mockFields);
    expect(result.valid).toBe(false);
  });

  it("should catch invalid value type", () => {
    const result = validatePredicate("transaction_amount", Operator.GT, "not a number", mockFields);
    expect(result.valid).toBe(false);
  });

  it("should detect XSS in string values", () => {
    const result = validatePredicate(
      "merchant_name",
      Operator.EQ,
      '<script>alert("xss")</script>',
      mockFields
    );
    // String should be sanitized but still valid
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toBeDefined();
    const sanitized = (result.sanitizedValue as { value: string }).value;
    expect(sanitized).not.toContain("<script>");
  });

  it("should allow IS_NULL operator without value", () => {
    const result = validatePredicate("transaction_amount", Operator.IS_NULL, null, mockFields);
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toEqual({
      field: "transaction_amount",
      operator: "IS_NULL",
      value: null,
    });
  });

  it("should allow IS_NOT_NULL operator without value", () => {
    const result = validatePredicate("transaction_amount", Operator.IS_NOT_NULL, null, mockFields);
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toEqual({
      field: "transaction_amount",
      operator: "IS_NOT_NULL",
      value: null,
    });
  });

  it("should validate BETWEEN operator with range", () => {
    const result = validatePredicate("transaction_amount", Operator.BETWEEN, [10, 100], mockFields);
    expect(result.valid).toBe(true);
  });

  it("should reject BETWEEN operator with invalid range", () => {
    const result = validatePredicate("transaction_amount", Operator.BETWEEN, [100, 10], mockFields);
    expect(result.valid).toBe(false);
  });

  it("should validate IN operator with array of values", () => {
    const result = validatePredicate(
      "merchant_name",
      Operator.IN,
      ["amazon", "google"],
      mockFields
    );
    expect(result.valid).toBe(true);
  });

  it("should reject IN operator with empty array", () => {
    const result = validatePredicate("merchant_name", Operator.IN, [], mockFields);
    expect(result.valid).toBe(false);
  });

  it("should validate NOT_IN operator", () => {
    const result = validatePredicate("merchant_name", Operator.NOT_IN, ["blocked"], mockFields);
    expect(result.valid).toBe(true);
  });

  it("should reject NOT_IN operator with too many values", () => {
    const tooMany = new Array(MAX_MULTI_VALUES + 1).fill("value");
    const result = validatePredicate("merchant_name", Operator.NOT_IN, tooMany, mockFields);
    expect(result.valid).toBe(false);
  });
});

describe("Value Validation Helper", () => {
  it("should validate value based on field data type for STRING", () => {
    const field = mockFields[1]; // merchant_name (STRING)
    const result = validateValue("test value", Operator.EQ, field);
    expect(result.valid).toBe(true);
  });

  it("should validate value based on field data type for NUMBER", () => {
    const field = mockFields[0]; // transaction_amount (NUMBER)
    const result = validateValue(42, Operator.EQ, field);
    expect(result.valid).toBe(true);
  });

  it("should return null for IS_NULL without validation", () => {
    const field = mockFields[0];
    const result = validateValue(null, Operator.IS_NULL, field);
    expect(result.valid).toBe(true);
    // validateValue for IS_NULL returns { valid: true, errors: [], sanitizedValue: null }
    expect(result.sanitizedValue).toBe(null);
  });

  it("should return null for IS_NOT_NULL without validation", () => {
    const field = mockFields[0];
    const result = validateValue(null, Operator.IS_NOT_NULL, field);
    expect(result.valid).toBe(true);
    expect(result.sanitizedValue).toBe(null);
  });

  it("should handle BETWEEN operator for range validation", () => {
    const field = mockFields[0]; // transaction_amount (NUMBER)
    const result = validateValue([10, 100], Operator.BETWEEN, field);
    expect(result.valid).toBe(true);
  });

  it("should reject invalid range for BETWEEN operator", () => {
    const field = mockFields[0]; // transaction_amount (NUMBER)
    const result = validateValue([100, 10], Operator.BETWEEN, field);
    expect(result.valid).toBe(false);
  });

  it("should handle IN operator for multi-value validation", () => {
    const field = mockFields[1]; // merchant_name (STRING)
    const result = validateValue(["a", "b"], Operator.IN, field);
    expect(result.valid).toBe(true);
  });

  it("should handle NOT_IN operator for multi-value validation", () => {
    const field = mockFields[1]; // merchant_name (STRING)
    const result = validateValue(["a", "b"], Operator.NOT_IN, field);
    expect(result.valid).toBe(true);
  });
});
