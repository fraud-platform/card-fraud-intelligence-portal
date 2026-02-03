/**
 * Type guards for runtime type checking
 *
 * These guards provide safe runtime type checking for domain objects
 * and API responses.
 */

import {
  GroupNode,
  PredicateNode,
  VelocityPredicateNode,
  ConditionNode,
  VelocityField,
} from "../../types/domain";
import { LogicalOperator } from "../../types/enums";

/**
 * Type guard to check if a node is a GroupNode
 */
export function isGroupNode(node: ConditionNode): node is GroupNode {
  return node.kind === "group" && "op" in node && "children" in node;
}

/**
 * Type guard to check if a node is a PredicateNode
 */
export function isPredicateNode(
  node: ConditionNode
): node is PredicateNode | VelocityPredicateNode {
  return node.kind === "predicate" && "field" in node && "op" in node;
}

/**
 * Type guard to check if a node is a VelocityPredicateNode
 */
export function isVelocityPredicateNode(node: ConditionNode): node is VelocityPredicateNode {
  return (
    isPredicateNode(node) &&
    typeof node.field === "object" &&
    "type" in node.field &&
    node.field.type === "VELOCITY"
  );
}

/**
 * Type guard to check if a field is a VelocityField
 */
export function isVelocityField(field: unknown): field is VelocityField {
  return (
    typeof field === "object" &&
    field !== null &&
    "type" in field &&
    field.type === "VELOCITY" &&
    "aggregation" in field &&
    "window" in field &&
    "group_by" in field
  );
}

/**
 * Type guard to check if a value is a valid LogicalOperator
 */
export function isLogicalOperator(value: unknown): value is LogicalOperator {
  return value === "and" || value === "or";
}

/**
 * Type guard to check if an object is a valid persisted condition tree
 */
export function isPersistedConditionTree(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const keys = Object.keys(obj);

  // Must have either 'and' or 'or' key (or be a predicate with field/op/value)
  if (keys.includes("and") || keys.includes("or")) {
    return true;
  }

  // Or it's a predicate node
  if (keys.includes("field") && keys.includes("op")) {
    return true;
  }

  return false;
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

/**
 * Type guard to check if a value is a valid date string (ISO 8601)
 */
export function isValidDateString(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

/**
 * Type guard to check if an error is an API error with a message
 */
export function isApiError(error: unknown): error is { message: string; status?: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}
