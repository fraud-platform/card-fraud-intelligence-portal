/**
 * Field Definition Types
 *
 * Types for field definition management with versioning support.
 * These types align with the backend field registry API specification.
 */

import { DataType, Operator } from "./enums";

// ============================================================================
// Field Definition (Current State)
// ============================================================================

/**
 * FieldDefinition represents the current state of a field definition.
 * It includes metadata about the field and its current version.
 */
export interface FieldDefinition {
  /** Immutable unique identifier for this field (snake_case) */
  field_key: string;
  /** Numeric field ID (sequential, assigned by backend) */
  field_id: number;
  /** Human-readable name for UI display */
  display_name: string;
  /** Optional description explaining what this field represents */
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
  current_version: number;
  /** Current version number (alias for consistency) */
  version: number;
  /** User who created this field */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

// ============================================================================
// Field Version (Immutable)
// ============================================================================

/**
 * FieldVersion represents an immutable version of a field definition.
 * Each time a field is modified, a new version is created.
 */
export interface FieldVersion {
  /** Unique identifier for this field version */
  rule_field_version_id: string;
  /** Reference to the parent field key */
  field_key: string;
  /** Version number (sequential, starting at 1) */
  version: number;
  /** Numeric field ID */
  field_id: number;
  /** Human-readable name */
  display_name: string;
  /** Optional description */
  description?: string;
  /** Data type */
  data_type: DataType;
  /** Allowed operators */
  allowed_operators: Operator[];
  /** Whether multi-value is allowed */
  multi_value_allowed: boolean;
  /** Whether field is sensitive */
  is_sensitive: boolean;
  /** Version status for maker-checker workflow (approval flow between RULE_MAKER and RULE_CHECKER) */
  status: FieldVersionStatus;
  /** User who created this version */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** User who approved this version (if approved) */
  approved_by?: string;
  /** Approval timestamp */
  approved_at?: string;
}

/**
 * FieldVersionStatus defines the lifecycle state of a field version.
 * Extends RuleStatus for consistency with other versioned entities.
 */
export type FieldVersionStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "SUPERSEDED";

// ============================================================================
// Field Registry
// ============================================================================

/**
 * FieldRegistryManifest represents a published field registry version.
 * The registry is published when field versions are approved.
 */
export interface FieldRegistryManifest {
  /** Unique manifest identifier */
  manifest_id: string;
  /** Registry version number (sequential) */
  registry_version: number;
  /** URI to the published artifact (e.g., S3 location) */
  artifact_uri: string;
  /** Checksum for integrity verification */
  checksum: string;
  /** Number of fields in this registry version */
  field_count: number;
  /** User who triggered the publish */
  created_by: string;
  /** Publication timestamp */
  created_at: string;
}

/**
 * FieldRegistryDetail extends manifest with optional field list
 */
export interface FieldRegistryDetail extends FieldRegistryManifest {
  /** Optional: Full list of fields in this registry version */
  fields?: FieldDefinition[];
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request to create a new field definition
 */
export interface CreateFieldDefinitionRequest {
  field_key: string;
  field_id: number;
  display_name: string;
  description?: string;
  data_type: DataType;
  allowed_operators: Operator[];
  multi_value_allowed?: boolean;
  is_sensitive?: boolean;
  is_active?: boolean;
}

/**
 * Request to create a new field version
 */
export interface CreateFieldVersionRequest {
  display_name?: string;
  description?: string;
  allowed_operators?: Operator[];
  multi_value_allowed?: boolean;
  is_sensitive?: boolean;
  is_active?: boolean;
  expected_version?: number; // For optimistic locking
}

/**
 * Request to submit a field version for approval
 */
export interface SubmitFieldVersionRequest {
  remarks?: string;
  idempotency_key?: string;
}

/**
 * Request to approve/reject a field version
 */
export interface FieldVersionDecisionRequest {
  decision: "APPROVE" | "REJECT";
  remarks?: string;
}

/**
 * Response from next field ID endpoint
 */
export interface NextFieldIdResponse {
  next_field_id: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Status badge configuration for field versions
 */
export interface StatusBadgeConfig {
  color: "default" | "warning" | "success" | "error" | "info" | "processing";
  label: string;
}

/**
 * Map of field version status to badge configuration
 */
export const FIELD_VERSION_STATUS_BADGES: Record<FieldVersionStatus, StatusBadgeConfig> = {
  DRAFT: { color: "default", label: "Draft" },
  PENDING_APPROVAL: { color: "warning", label: "Pending Approval" },
  APPROVED: { color: "success", label: "Approved" },
  REJECTED: { color: "error", label: "Rejected" },
  SUPERSEDED: { color: "info", label: "Superseded" },
};

/**
 * Get status badge configuration for a field version
 */
export function getFieldVersionStatusBadge(status: FieldVersionStatus): StatusBadgeConfig {
  return FIELD_VERSION_STATUS_BADGES[status] ?? { color: "default", label: status };
}

/**
 * Check if a field version can be edited
 */
export function canEditFieldVersion(status: FieldVersionStatus): boolean {
  return status === "DRAFT";
}

/**
 * Check if a field version can be submitted for approval
 */
export function canSubmitFieldVersion(status: FieldVersionStatus): boolean {
  return status === "DRAFT";
}

/**
 * Check if a field version can be approved/rejected
 */
export function canDecideFieldVersion(status: FieldVersionStatus): boolean {
  return status === "PENDING_APPROVAL";
}
