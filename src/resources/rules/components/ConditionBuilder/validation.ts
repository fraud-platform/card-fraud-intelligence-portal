/**
 * Validation and Sanitization Utilities for ConditionBuilder
 *
 * Provides comprehensive input validation and XSS prevention for rule conditions.
 * All user inputs must be validated through these utilities before being used.
 */

import { DataType, Operator, LogicalOperator } from "../../../../types/enums";
import type { RuleField } from "../../../../types/domain";

// ============================================================================
// Constants and Configuration
// ============================================================================

/**
 * Maximum allowed length for string values
 */
export const MAX_STRING_LENGTH = 1000;

/**
 * Maximum allowed length for field keys
 */
export const MAX_FIELD_KEY_LENGTH = 100;

/**
 * Maximum number of values in multi-value inputs (IN, NOT_IN)
 */
export const MAX_MULTI_VALUES = 100;

/**
 * Maximum number value (to prevent overflow)
 */
export const MAX_NUMBER_VALUE = Number.MAX_SAFE_INTEGER;

/**
 * Minimum number value
 */
export const MIN_NUMBER_VALUE = Number.MIN_SAFE_INTEGER;

/**
 * Dangerous HTML patterns that could lead to XSS attacks
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick=, onload=, etc.
  /<object\b/gi,
  /<embed\b/gi,
  /<applet\b/gi,
  /document\.cookie/gi,
  /document\.write/gi,
  /eval\(/gi,
];

/**
 * SQL injection patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
  /(--|\/\*|\*\/)/i,
  /(\bOR\b.*=.*\b)/i,
  /(\bAND\b.*=.*\b)/i,
  /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
];

/**
 * NoSQL injection patterns (for MongoDB, etc.)
 */
const NOSQL_INJECTION_PATTERNS = [/\$where/i, /\$regex/i, /\$ne/i, /\{\s*\$\w+/i];

// ============================================================================
// Validation Error Types
// ============================================================================

export interface ValidationError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Field or path where error occurred */
  field?: string;
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
  /** Sanitized value (if valid) */
  sanitizedValue?: unknown;
}

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitizes a string value to prevent XSS attacks
 * Removes dangerous HTML/JS patterns and encodes special characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // Remove XSS patterns
  XSS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });

  // Encode HTML special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return sanitized.trim();
}

/**
 * Validates that a string doesn't contain SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Validates that a string doesn't contain NoSQL injection patterns
 */
export function detectNoSqlInjection(input: string): boolean {
  return NOSQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitizes and validates a string for injection attacks
 */
export function sanitizeAndValidateString(input: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof input !== "string") {
    errors.push({
      code: "INVALID_TYPE",
      message: "Value must be a string",
    });
    return { valid: false, errors };
  }

  // Check length
  if (input.length > MAX_STRING_LENGTH) {
    errors.push({
      code: "STRING_TOO_LONG",
      message: `String must not exceed ${MAX_STRING_LENGTH} characters`,
    });
    return { valid: false, errors };
  }

  // Check for NoSQL injection first (JSON-like inputs should be classified as NoSQL)
  if (detectNoSqlInjection(input)) {
    errors.push({
      code: "NOSQL_INJECTION_DETECTED",
      message: "Input contains potentially dangerous NoSQL patterns",
    });
    return { valid: false, errors };
  }

  // Check for SQL injection
  if (detectSqlInjection(input)) {
    errors.push({
      code: "SQL_INJECTION_DETECTED",
      message: "Input contains potentially dangerous SQL patterns",
    });
    return { valid: false, errors };
  }

  // Sanitize XSS
  const sanitized = sanitizeString(input);

  return {
    valid: true,
    errors: [],
    sanitizedValue: sanitized,
  };
}

// ============================================================================
// Field Validation
// ============================================================================

/**
 * Validates that a field key exists in the allowed fields list
 */
export function validateFieldKey(fieldKey: string, allowedFields: RuleField[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (
    fieldKey === undefined ||
    fieldKey === null ||
    fieldKey === "" ||
    typeof fieldKey !== "string"
  ) {
    errors.push({
      code: "FIELD_REQUIRED",
      message: "Field selection is required",
      field: "field",
    });
    return { valid: false, errors };
  }

  if (fieldKey.length > MAX_FIELD_KEY_LENGTH) {
    errors.push({
      code: "FIELD_KEY_TOO_LONG",
      message: `Field key must not exceed ${MAX_FIELD_KEY_LENGTH} characters`,
      field: "field",
    });
    return { valid: false, errors };
  }

  // Check if field exists in allowed fields
  const field = allowedFields.find((f) => f.field_key === fieldKey);
  if (field === undefined) {
    errors.push({
      code: "INVALID_FIELD",
      message: "Selected field is not valid or not allowed",
      field: "field",
    });
    return { valid: false, errors };
  }

  // Check if field is active
  if (!field.is_active) {
    errors.push({
      code: "FIELD_INACTIVE",
      message: "Selected field is not active and cannot be used",
      field: "field",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [], sanitizedValue: fieldKey };
}

// ============================================================================
// Operator Validation
// ============================================================================

/**
 * Gets allowed operators based on data type
 */
export function getOperatorsForDataType(dataType: DataType): Operator[] {
  switch (dataType) {
    case DataType.NUMBER:
      return [
        Operator.EQ,
        Operator.NE,
        Operator.GT,
        Operator.GTE,
        Operator.LT,
        Operator.LTE,
        Operator.BETWEEN,
        Operator.IN,
        Operator.NOT_IN,
        Operator.IS_NULL,
        Operator.IS_NOT_NULL,
      ];
    case DataType.STRING:
      return [
        Operator.EQ,
        Operator.NE,
        Operator.LIKE,
        Operator.NOT_LIKE,
        Operator.IN,
        Operator.NOT_IN,
        Operator.IS_NULL,
        Operator.IS_NOT_NULL,
      ];
    case DataType.DATE:
      return [
        Operator.EQ,
        Operator.NE,
        Operator.GT,
        Operator.GTE,
        Operator.LT,
        Operator.LTE,
        Operator.BETWEEN,
        Operator.IS_NULL,
        Operator.IS_NOT_NULL,
      ];
    case DataType.BOOLEAN:
      return [Operator.EQ, Operator.NE, Operator.IS_NULL, Operator.IS_NOT_NULL];
    case DataType.ENUM:
      return [
        Operator.EQ,
        Operator.NE,
        Operator.IN,
        Operator.NOT_IN,
        Operator.IS_NULL,
        Operator.IS_NOT_NULL,
      ];
    default:
      return Object.values(Operator);
  }
}

/**
 * Validates that an operator is allowed for a given field
 */
export function validateOperator(operator: Operator, field: RuleField): ValidationResult {
  const errors: ValidationError[] = [];

  if (operator === undefined || operator === null) {
    errors.push({
      code: "OPERATOR_REQUIRED",
      message: "Operator selection is required",
      field: "operator",
    });
    return { valid: false, errors };
  }

  // Check if operator is a valid enum value
  if (!Object.values(Operator).includes(operator)) {
    errors.push({
      code: "INVALID_OPERATOR",
      message: "Selected operator is not valid",
      field: "operator",
    });
    return { valid: false, errors };
  }

  // Check if operator is allowed for this field
  const allowedOperators = field.allowed_operators ?? getOperatorsForDataType(field.data_type);
  if (!allowedOperators.includes(operator)) {
    errors.push({
      code: "OPERATOR_NOT_ALLOWED",
      message: `Operator '${operator}' is not allowed for field type '${field.data_type}'`,
      field: "operator",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [], sanitizedValue: operator };
}

// ============================================================================
// Value Validation
// ============================================================================

/**
 * Validates a number value
 */
export function validateNumberValue(value: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (value === null || value === undefined || value === "") {
    errors.push({
      code: "VALUE_REQUIRED",
      message: "Value is required",
      field: "value",
    });
    return { valid: false, errors };
  }

  const num = typeof value === "number" ? value : Number(value);

  if (isNaN(num)) {
    errors.push({
      code: "INVALID_NUMBER",
      message: "Value must be a valid number",
      field: "value",
    });
    return { valid: false, errors };
  }

  // Ensure finite (Infinity should be considered invalid number)
  if (!isFinite(num)) {
    errors.push({
      code: "INVALID_NUMBER",
      message: "Number must be finite",
      field: "value",
    });
    return { valid: false, errors };
  }

  if (num > MAX_NUMBER_VALUE || num < MIN_NUMBER_VALUE) {
    errors.push({
      code: "NUMBER_OUT_OF_RANGE",
      message: "Number value is out of allowed range",
      field: "value",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [], sanitizedValue: num };
}

/**
 * Validates a date string
 */
export function validateDateValue(value: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (value === null || value === undefined || value === "") {
    errors.push({
      code: "VALUE_REQUIRED",
      message: "Date value is required",
      field: "value",
    });
    return { valid: false, errors };
  }

  if (typeof value !== "string") {
    errors.push({
      code: "INVALID_DATE",
      message: "Date value must be a string",
      field: "value",
    });
    return { valid: false, errors };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    errors.push({
      code: "INVALID_DATE",
      message: "Value must be a valid date",
      field: "value",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [], sanitizedValue: value };
}

/**
 * Validates a boolean value
 */
export function validateBooleanValue(value: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (value === null || value === undefined) {
    errors.push({
      code: "VALUE_REQUIRED",
      message: "Boolean value is required",
      field: "value",
    });
    return { valid: false, errors };
  }

  if (typeof value !== "boolean") {
    errors.push({
      code: "INVALID_BOOLEAN",
      message: "Value must be a boolean",
      field: "value",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [], sanitizedValue: value };
}

/**
 * Validates a range value (array with two elements)
 */
export function validateRangeValue(value: unknown, dataType: DataType): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(value) || value.length !== 2) {
    errors.push({
      code: "INVALID_RANGE",
      message: "Range value must be an array with exactly 2 elements [min, max]",
      field: "value",
    });
    return { valid: false, errors };
  }

  const rangeArray = value as [unknown, unknown];
  const [min, max] = rangeArray;

  // Validate based on data type
  if (dataType === DataType.NUMBER) {
    const minResult = validateNumberValue(min);
    const maxResult = validateNumberValue(max);

    if (!minResult.valid) {
      errors.push({
        code: "INVALID_RANGE_MIN",
        message: "Minimum value is invalid",
        field: "value",
      });
    }

    if (!maxResult.valid) {
      errors.push({
        code: "INVALID_RANGE_MAX",
        message: "Maximum value is invalid",
        field: "value",
      });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    if (minResult.sanitizedValue! > maxResult.sanitizedValue!) {
      errors.push({
        code: "INVALID_RANGE",
        message: "Minimum value must be less than or equal to maximum value",
        field: "value",
      });
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      sanitizedValue: [minResult.sanitizedValue, maxResult.sanitizedValue],
    };
  }

  if (dataType === DataType.DATE) {
    const minResult = validateDateValue(min);
    const maxResult = validateDateValue(max);

    if (!minResult.valid || !maxResult.valid) {
      errors.push({
        code: "INVALID_RANGE",
        message: "Both minimum and maximum dates must be valid",
        field: "value",
      });
      return { valid: false, errors };
    }

    const minDate = new Date(minResult.sanitizedValue as string);
    const maxDate = new Date(maxResult.sanitizedValue as string);

    if (minDate > maxDate) {
      errors.push({
        code: "INVALID_RANGE",
        message: "Minimum date must be before or equal to maximum date",
        field: "value",
      });
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      sanitizedValue: [minResult.sanitizedValue, maxResult.sanitizedValue],
    };
  }

  // For strings, just validate and sanitize
  const minResult = sanitizeAndValidateString(String(min));
  const maxResult = sanitizeAndValidateString(String(max));

  if (!minResult.valid || !maxResult.valid) {
    errors.push({
      code: "INVALID_RANGE",
      message: "Range values contain invalid characters",
      field: "value",
    });
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitizedValue: [minResult.sanitizedValue, maxResult.sanitizedValue],
  };
}

/**
 * Validates multi-value input (array of values)
 */
export function validateMultiValue(value: unknown, dataType: DataType): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(value)) {
    errors.push({
      code: "INVALID_MULTI_VALUE",
      message: "Multi-value input must be an array",
      field: "value",
    });
    return { valid: false, errors };
  }

  const valueArray = value as unknown[];

  if (valueArray.length === 0) {
    errors.push({
      code: "VALUE_REQUIRED",
      message: "At least one value is required",
      field: "value",
    });
    return { valid: false, errors };
  }

  if (valueArray.length > MAX_MULTI_VALUES) {
    errors.push({
      code: "TOO_MANY_VALUES",
      message: `Cannot have more than ${MAX_MULTI_VALUES} values`,
      field: "value",
    });
    return { valid: false, errors };
  }

  const sanitizedValues: unknown[] = [];

  // Validate each value based on data type
  for (let i = 0; i < valueArray.length; i++) {
    const item = valueArray[i];
    let itemResult: ValidationResult;

    switch (dataType) {
      case DataType.NUMBER:
        itemResult = validateNumberValue(item);
        break;
      case DataType.DATE:
        itemResult = validateDateValue(item);
        break;
      case DataType.BOOLEAN:
        itemResult = validateBooleanValue(item);
        break;
      default:
        itemResult = sanitizeAndValidateString(String(item));
    }

    if (!itemResult.valid) {
      errors.push({
        code: "INVALID_VALUE_IN_ARRAY",
        message: `Value at index ${i} is invalid: ${itemResult.errors[0]?.message}`,
        field: "value",
      });
    } else {
      sanitizedValues.push(itemResult.sanitizedValue);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], sanitizedValue: sanitizedValues };
}

/**
 * Validates a single value based on data type
 */
export function validateSingleValue(value: unknown, dataType: DataType): ValidationResult {
  switch (dataType) {
    case DataType.NUMBER:
      return validateNumberValue(value);
    case DataType.DATE:
      return validateDateValue(value);
    case DataType.BOOLEAN:
      return validateBooleanValue(value);
    case DataType.STRING:
    case DataType.ENUM:
    default:
      return sanitizeAndValidateString(String(value));
  }
}

/**
 * Main value validation function that handles all operator types
 */
export function validateValue(
  value: unknown,
  operator: Operator,
  field: RuleField
): ValidationResult {
  // IS_NULL and IS_NOT_NULL don't need values
  if (operator === Operator.IS_NULL || operator === Operator.IS_NOT_NULL) {
    return { valid: true, errors: [], sanitizedValue: null };
  }

  // BETWEEN requires range validation
  if (operator === Operator.BETWEEN) {
    return validateRangeValue(value, field.data_type);
  }

  // IN and NOT_IN require multi-value validation
  if (operator === Operator.IN || operator === Operator.NOT_IN) {
    return validateMultiValue(value, field.data_type);
  }

  // All other operators require single value validation
  return validateSingleValue(value, field.data_type);
}

// ============================================================================
// Logical Operator Validation
// ============================================================================

/**
 * Validates a logical operator (AND/OR)
 */
export function validateLogicalOperator(operator: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (operator === undefined || operator === null) {
    errors.push({
      code: "LOGICAL_OPERATOR_REQUIRED",
      message: "Logical operator is required",
    });
    return { valid: false, errors };
  }

  if (!Object.values(LogicalOperator).includes(operator as LogicalOperator)) {
    errors.push({
      code: "INVALID_LOGICAL_OPERATOR",
      message: "Invalid logical operator. Must be AND or OR",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [], sanitizedValue: operator };
}

// ============================================================================
// Complete Predicate Validation
// ============================================================================

/**
 * Validates a complete predicate (field + operator + value)
 */
export function validatePredicate(
  fieldKey: string,
  operator: Operator,
  value: unknown,
  allowedFields: RuleField[]
): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Validate field
  const fieldResult = validateFieldKey(fieldKey, allowedFields);
  if (!fieldResult.valid) {
    allErrors.push(...fieldResult.errors);
    return { valid: false, errors: allErrors };
  }

  const field = allowedFields.find((f) => f.field_key === fieldKey)!;

  // Validate operator
  const operatorResult = validateOperator(operator, field);
  if (!operatorResult.valid) {
    allErrors.push(...operatorResult.errors);
  }

  // Validate value
  const valueResult = validateValue(value, operator, field);
  if (!valueResult.valid) {
    allErrors.push(...valueResult.errors);
  }

  if (allErrors.length > 0) {
    return { valid: false, errors: allErrors };
  }

  return {
    valid: true,
    errors: [],
    sanitizedValue: {
      field: fieldResult.sanitizedValue,
      operator: operatorResult.sanitizedValue,
      value: valueResult.sanitizedValue,
    },
  };
}

// ---------------------------------------------------------------------------
// Tree-level validation utilities
// ---------------------------------------------------------------------------
import type { UiConditionNode, UiPredicateNode, UiGroupNode } from "./nodeTypes";

/**
 * Validates a predicate node and returns validation errors
 */
export function validatePredicateNode(
  node: UiPredicateNode,
  fields: RuleField[]
): ValidationError[] {
  // Skip validation for velocity predicates (read-only)
  if (typeof node.field !== "string") {
    return [];
  }

  // Skip validation if field is not selected yet
  if (node.field === "") {
    return [
      {
        code: "FIELD_REQUIRED",
        message: "Please select a field",
        field: "field",
      },
    ];
  }

  const result = validatePredicate(node.field, node.op, node.value, fields);
  return result.valid ? [] : result.errors;
}

/**
 * Validates a group node and returns validation errors
 */
export function validateGroupNode(node: UiGroupNode): ValidationError[] {
  const result = validateLogicalOperator(node.op);
  return result.valid ? [] : result.errors;
}

/**
 * Recursively validates the entire condition tree
 */
export function validateTree(node: UiConditionNode, fields: RuleField[]): UiConditionNode {
  if (node.kind === "group") {
    const errors = validateGroupNode(node);
    const validatedChildren = node.children.map((child) => validateTree(child, fields));
    return {
      ...node,
      children: validatedChildren,
      validationErrors: errors,
    };
  }

  const errors = validatePredicateNode(node, fields);
  return {
    ...node,
    validationErrors: errors,
  };
}

/**
 * Checks if a node or any of its children have validation errors
 */
export function hasValidationErrors(node: UiConditionNode): boolean {
  if ((node.validationErrors?.length ?? 0) > 0) {
    return true;
  }

  if (node.kind === "group") {
    return node.children.some(hasValidationErrors);
  }

  return false;
}
