/**
 * Domain models for the Fraud Rule Authoring System
 *
 * These types represent the core entities in the system and must match
 * the database schema defined in Fraud-DB.md exactly.
 */

import {
  RuleType,
  RuleStatus,
  DataType,
  Operator,
  ApprovalStatus,
  EntityType,
  AuditAction,
  LogicalOperator,
  RuleSetStatus,
  RulesetEnvironment,
} from "./enums";

// ============================================================================
// Rule Fields (Metadata)
// ============================================================================

/**
 * RuleField defines a dimension that can be used in rule conditions
 * Extended to support field registry versioning.
 */
export interface RuleField {
  /** Immutable unique identifier for this field */
  field_key: string;
  /** Numeric field ID (sequential, assigned by backend) */
  field_id?: number;
  /** Human-readable name for UI display */
  display_name: string;
  /** Optional description */
  description?: string;
  /** Data type of the field values */
  data_type: DataType;
  /** Operators allowed for this field */
  allowed_operators: Operator[];
  /** Whether this field can accept multiple values */
  multi_value_allowed: boolean;
  /** Whether this field contains sensitive data (PII, PAN, etc.) */
  is_sensitive: boolean;
  /** Whether this field is currently active and available for use */
  is_active: boolean;
  /** Current active version number */
  current_version?: number;
  /** Current version number (alias for consistency) */
  version?: number;
  /** User who created this field */
  created_by?: string;
  /** Timestamp when this field was created */
  created_at: string;
  /** Last update timestamp */
  updated_at?: string;
  /** Current version status (if available) */
  current_status?: string;
  /** Current version ID (if available) */
  current_version_id?: string;
}

/**
 * RuleFieldMetadata provides extensible attributes for rule fields
 */
export interface RuleFieldMetadata {
  /** Reference to the parent field */
  field_key: string;
  /** Metadata key (e.g., 'ui_group', 'velocity_config', 'validation_hint') */
  meta_key: string;
  /** Metadata value (flexible JSON structure) */
  meta_value: Record<string, unknown>;
  /** Timestamp when this metadata was created */
  created_at: string;
}

// ============================================================================
// Condition Tree Nodes
// ============================================================================

/**
 * Base interface for all condition nodes
 */
export interface BaseConditionNode {
  /** Discriminator for node type */
  kind: "group" | "predicate";
}

/**
 * Group node contains logical AND/OR operations
 */
export interface GroupNode extends BaseConditionNode {
  kind: "group";
  /** Logical operator (and/or) */
  op: LogicalOperator;
  /** Child nodes */
  children: ConditionNode[];
}

/**
 * Predicate node contains a single comparison
 */
export interface PredicateNode extends BaseConditionNode {
  kind: "predicate";
  /** Field key being evaluated */
  field: string;
  /** Comparison operator */
  op: Operator;
  /** Value(s) to compare against */
  value: unknown;
}

/**
 * Velocity field definition for runtime counters
 */
export interface VelocityField {
  type: "VELOCITY";
  /** Aggregation type (COUNT, SUM, DISTINCT) */
  aggregation: "COUNT" | "SUM" | "DISTINCT";
  /** Time window for velocity calculation */
  window: {
    value: number;
    unit: "SECONDS" | "MINUTES" | "HOURS" | "DAYS";
  };
  /** Grouping dimensions (e.g., ['CARD'], ['MERCHANT', 'MCC']) */
  group_by: string[];
}

/**
 * Predicate node with velocity field
 */
export interface VelocityPredicateNode extends BaseConditionNode {
  kind: "predicate";
  /** Velocity field definition */
  field: VelocityField;
  /** Comparison operator */
  op: Operator;
  /** Threshold value */
  value: number;
}

/**
 * Union type for all condition nodes
 */
export type ConditionNode = GroupNode | PredicateNode | VelocityPredicateNode;

/**
 * Persisted condition tree format (matches database JSONB structure)
 */
export interface PersistedConditionTree {
  and?: PersistedConditionNode[];
  or?: PersistedConditionNode[];
}

export type PersistedConditionNode =
  | PersistedConditionTree
  | {
      field: string | VelocityField;
      op: Operator;
      value: unknown;
    };

// ============================================================================
// Rules
// ============================================================================

/**
 * Rule represents the logical identity of a rule
 * (does not contain the actual condition logic)
 */
export interface Rule {
  /** Unique rule identifier */
  rule_id: string;
  /** Rule name (must be unique within scope) */
  rule_name: string;
  /** Optional description */
  description?: string | null;
  /** Rule category */
  rule_type: RuleType;
  /** Current active version number */
  current_version: number;
  /** Current status */
  status: RuleStatus;
  /** User who created this rule */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * RuleVersion contains the actual rule logic
 */
export interface RuleVersion {
  /** Unique version identifier */
  rule_version_id: string;
  /** Reference to parent rule */
  rule_id: string;
  /** Version number (sequential) */
  version: number;
  /** Condition tree (structured JSON AST) */
  condition_tree: PersistedConditionTree;
  /** Priority for evaluation order (lower = higher priority) */
  priority: number;
  /** Scope dimensions for rule bucketing (null = country-only rule) */
  scope: {
    network?: string[];
    bin?: string[];
    mcc?: string[];
    logo?: string[];
  } | null;
  /** User who created this version */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** User who approved this version (if approved) */
  approved_by: string | null;
  /** Approval timestamp */
  approved_at: string | null;
  /** Version status */
  status: RuleStatus;
}

/**
 * Complete rule with its current version
 */
export interface RuleWithVersion extends Rule {
  /** Current version details */
  version_details: RuleVersion;
}

// ============================================================================
// RuleSets
// ============================================================================

/**
 * RuleSet is the deployment unit containing a collection of rule versions
 */
export interface RuleSet {
  /** Unique ruleset identifier */
  ruleset_id: string;
  /** Optional human-readable name */
  name: string | null;
  /** Optional description */
  description: string | null;
  /** Rule type (all rules in set must match) */
  rule_type: RuleType;
  /** Environment for deployment */
  environment: RulesetEnvironment;
  /** Geographic region */
  region: string;
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  /** Version number */
  version: number;
  /** Compiled AST/DSL for Quarkus runtime (generated on approval) */
  compiled_ast: CompiledAST | null;
  /** RuleSet status */
  status: RuleSetStatus;
  /** User who created this ruleset */
  created_by: string;
  /** User who approved this ruleset (if approved) */
  approved_by: string | null;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** Approval timestamp */
  approved_at: string | null;
  /** Activation timestamp */
  activated_at: string | null;
}

/**
 * Association between RuleSet and RuleVersion
 */
export interface RuleSetRule {
  /** Reference to ruleset */
  ruleset_id: string;
  /** Reference to specific rule version */
  rule_version_id: string;
}

/**
 * RuleSet with associated rule versions
 */
export interface RuleSetWithRules extends RuleSet {
  /** Rule versions included in this set */
  rules: RuleVersion[];
}

/**
 * Compiled AST format for Quarkus consumption
 */
export interface CompiledAST {
  /** RuleSet identifier */
  rulesetId: string;
  /** RuleSet version */
  version: number;
  /** Rule type */
  ruleType: RuleType;
  /** Evaluation configuration */
  evaluation: {
    mode: "FIRST_MATCH" | "ALL_MATCHING";
  };
  /** Compiled rules */
  rules: CompiledRule[];
}

/**
 * Compiled rule format
 */
export interface CompiledRule {
  /** Rule identifier */
  ruleId: string;
  /** Priority (for ordering) */
  priority: number;
  /** Condition expression */
  when: PersistedConditionTree;
  /** Action to take when rule matches */
  action: "ALLOW" | "BLOCK" | "FLAG" | "REVIEW";
}

// ============================================================================
// Approvals (Maker-Checker approval flow - ROLE NAMES: RULE_MAKER / RULE_CHECKER)
// ============================================================================

/**
 * Approval record for maker-checker workflow (RULE_MAKER / RULE_CHECKER)
 */
export interface Approval {
  /** Unique approval identifier */
  approval_id: string;
  /** Type of entity being approved */
  entity_type: EntityType;
  /** ID of the entity being approved */
  entity_id: string;
  /** Action being approved */
  action: AuditAction;
  /** User who submitted for approval (maker) */
  maker: string;
  /** User who approved/rejected (checker) */
  checker: string | null;
  /** Approval status */
  status: ApprovalStatus;
  /** Optional remarks from checker */
  remarks: string | null;
  /** Submission timestamp */
  created_at: string;
  /** Decision timestamp */
  decided_at: string | null;
}

/**
 * Approval with entity details for display
 */
export interface ApprovalWithDetails extends Approval {
  /** Name/description of the entity */
  entity_name: string;
  /** Old value (for updates) */
  old_value?: Record<string, unknown>;
  /** New value */
  new_value: Record<string, unknown>;
}

// ============================================================================
// Audit Log
// ============================================================================

/**
 * Audit log entry
 */
export interface AuditLog {
  /** Unique audit entry identifier */
  audit_id: string;
  /** Type of entity */
  entity_type: EntityType;
  /** ID of the entity */
  entity_id: string;
  /** Action performed */
  action: AuditAction;
  /** State before change (for updates/deletes) */
  old_value: Record<string, unknown> | null;
  /** State after change (for creates/updates) */
  new_value: Record<string, unknown> | null;
  /** User who performed the action */
  performed_by: string;
  /** Timestamp of action */
  performed_at: string;
}

// ============================================================================
// User & Authentication
// ============================================================================

/**
 * User role for RBAC
 */
export type SystemRole =
  | "PLATFORM_ADMIN"
  | "RULE_MAKER"
  | "RULE_CHECKER"
  | "RULE_VIEWER"
  | "FRAUD_ANALYST"
  | "FRAUD_SUPERVISOR";

/**
 * Display labels for system roles
 */
export const ROLE_DISPLAY_LABELS: Record<SystemRole, string> = {
  RULE_MAKER: "Rule Maker",
  RULE_CHECKER: "Rule Checker",
  RULE_VIEWER: "Rule Viewer",
  FRAUD_ANALYST: "Fraud Analyst",
  FRAUD_SUPERVISOR: "Fraud Supervisor",
  PLATFORM_ADMIN: "Platform Admin",
};

/**
 * User profile
 */
export interface User {
  /** User identifier */
  user_id: string;
  /** Username */
  username: string;
  /** Display name */
  display_name: string;
  /** User roles (multi-role support) */
  roles: SystemRole[];
  /** Email address */
  email: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /** JWT token or session token */
  token: string;
  /** User profile */
  user: User;
}

// ============================================================================
// UI-specific types
// ============================================================================

/**
 * Human-readable summary of a condition tree
 */
export interface ConditionSummary {
  /** Plain text summary */
  text: string;
  /** Structured segments for rich rendering */
  segments: ConditionSummarySegment[];
}

export interface ConditionSummarySegment {
  type: "field" | "operator" | "value" | "logical" | "text";
  content: string;
  /** Additional metadata for rendering */
  metadata?: {
    field_key?: string;
    is_sensitive?: boolean;
  };
}
