/**
 * Rule type constants and configuration
 *
 * Defines the locked rule types and their evaluation semantics.
 * These constants must never be modified as they form the core contract
 * between the control plane and the runtime engine.
 */

import { RuleType, EvaluationMode, Operator, LogicalOperator } from "../../types/enums";

/**
 * Evaluation mode mapping for each rule type
 *
 * This mapping is LOCKED and must not be changed:
 * - ALLOWLIST: Allow-list (FIRST_MATCH)
 * - BLOCKLIST: Block-list (FIRST_MATCH)
 * - AUTH: Real-time risk checks (FIRST_MATCH)
 * - MONITORING: Post-authorization analytics (ALL_MATCHING)
 */
export const RULE_TYPE_EVALUATION_MODE: Record<RuleType, EvaluationMode> = {
  [RuleType.ALLOWLIST]: EvaluationMode.FIRST_MATCH,
  [RuleType.BLOCKLIST]: EvaluationMode.FIRST_MATCH,
  [RuleType.AUTH]: EvaluationMode.FIRST_MATCH,
  [RuleType.MONITORING]: EvaluationMode.ALL_MATCHING,
};

/**
 * Human-readable descriptions for rule types
 */
export const RULE_TYPE_DESCRIPTIONS: Record<RuleType, string> = {
  [RuleType.ALLOWLIST]: "Allow-list rules that permit matching transactions",
  [RuleType.BLOCKLIST]: "Block-list rules that deny matching transactions",
  [RuleType.AUTH]: "Real-time risk checks performed before authorization",
  [RuleType.MONITORING]: "Post-authorization analytics and monitoring",
};

/**
 * Display names for rule types
 */
export const RULE_TYPE_LABELS: Record<RuleType, string> = {
  [RuleType.ALLOWLIST]: "ALLOWLIST (Allow-list)",
  [RuleType.BLOCKLIST]: "BLOCKLIST (Block-list)",
  [RuleType.AUTH]: "Pre-Auth Risk",
  [RuleType.MONITORING]: "Post-Auth Analytics",
};

/**
 * Operator constants
 *
 * Re-exported from the Operator enum to maintain a single source of truth.
 * The Operator enum is the canonical definition.
 */
export const OPERATORS = Operator;

/**
 * Operator display labels
 */
export const OPERATOR_LABELS: Record<Operator, string> = {
  [Operator.EQ]: "equals",
  [Operator.NE]: "not equals",
  [Operator.GT]: "greater than",
  [Operator.GTE]: "greater than or equals",
  [Operator.LT]: "less than",
  [Operator.LTE]: "less than or equals",
  [Operator.IN]: "in",
  [Operator.NOT_IN]: "not in",
  [Operator.LIKE]: "matches pattern",
  [Operator.NOT_LIKE]: "does not match pattern",
  [Operator.BETWEEN]: "between",
  [Operator.IS_NULL]: "is null",
  [Operator.IS_NOT_NULL]: "is not null",
  [Operator.CONTAINS]: "contains",
  [Operator.STARTS_WITH]: "starts with",
  [Operator.ENDS_WITH]: "ends with",
  [Operator.REGEX]: "matches regex",
};

/**
 * Operators that require array values
 */
export const MULTI_VALUE_OPERATORS = [Operator.IN, Operator.NOT_IN] as const;

/**
 * Operators that require range values [min, max]
 */
export const RANGE_OPERATORS = [Operator.BETWEEN] as const;

/**
 * Operators that require no value
 */
export const NO_VALUE_OPERATORS = [Operator.IS_NULL, Operator.IS_NOT_NULL] as const;

/**
 * Logical operators for condition groups
 * Re-exported from LogicalOperator enum for consistency
 */
export const LOGICAL_OPERATORS = LogicalOperator;
