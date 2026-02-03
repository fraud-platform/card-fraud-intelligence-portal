/**
 * Enumerations for the Fraud Rule Authoring System
 *
 * These enums define the core types and states used throughout the application.
 * All values must match the backend and database specifications exactly.
 */

/**
 * Rule Type defines the category and evaluation semantics of a rule
 */
export enum RuleType {
  ALLOWLIST = "ALLOWLIST",
  BLOCKLIST = "BLOCKLIST",
  AUTH = "AUTH",
  MONITORING = "MONITORING",
}

/**
 * Rule Status defines the lifecycle state of a rule
 */
export enum RuleStatus {
  /** Rule is being authored/edited */
  DRAFT = "DRAFT",
  /** Rule has been submitted and awaits approval */
  PENDING_APPROVAL = "PENDING_APPROVAL",
  /** Rule has been approved and can be used */
  APPROVED = "APPROVED",
  /** Rule approval was rejected */
  REJECTED = "REJECTED",
  /** Rule has been replaced by a newer version */
  SUPERSEDED = "SUPERSEDED",
}

/**
 * Data Type for rule fields
 */
export enum DataType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  ENUM = "ENUM",
}

/**
 * Approval Status for maker-checker workflow (RULE_MAKER / RULE_CHECKER)
 */
export enum ApprovalStatus {
  /** Awaiting checker decision */
  PENDING = "PENDING",
  /** Approved by checker */
  APPROVED = "APPROVED",
  /** Rejected by checker */
  REJECTED = "REJECTED",
}

/**
 * Evaluation Mode defines how rules are evaluated
 */
export enum EvaluationMode {
  /** Stop at first matching rule */
  FIRST_MATCH = "FIRST_MATCH",
  /** Evaluate all matching rules */
  ALL_MATCHING = "ALL_MATCHING",
}

/**
 * Operator types allowed in rule conditions
 */
export enum Operator {
  EQ = "EQ",
  NE = "NE",
  GT = "GT",
  GTE = "GTE",
  LT = "LT",
  LTE = "LTE",
  IN = "IN",
  NOT_IN = "NOT_IN",
  LIKE = "LIKE",
  NOT_LIKE = "NOT_LIKE",
  BETWEEN = "BETWEEN",
  IS_NULL = "IS_NULL",
  IS_NOT_NULL = "IS_NOT_NULL",
  CONTAINS = "CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
  REGEX = "REGEX",
}

/**
 * Entity types for audit logging and approvals
 */
export enum EntityType {
  RULE_FIELD = "RULE_FIELD",
  FIELD_DEFINITION = "FIELD_DEFINITION",
  FIELD_VERSION = "FIELD_VERSION",
  RULE = "RULE",
  RULE_VERSION = "RULE_VERSION",
  RULESET = "RULESET",
}

/**
 * Audit action types
 */
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  SUBMIT = "SUBMIT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  COMPILE = "COMPILE",
}

/**
 * Logical operators for condition groups
 */
export enum LogicalOperator {
  AND = "and",
  OR = "or",
}

/**
 * RuleSet Status
 */
export enum RuleSetStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  SUPERSEDED = "SUPERSEDED",
}

/**
 * Environment for ruleset deployment
 */
export enum RulesetEnvironment {
  LOCAL = "LOCAL",
  TEST = "TEST",
  PROD = "PROD",
}
