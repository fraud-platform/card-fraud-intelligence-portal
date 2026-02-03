/**
 * API request/response types for the Fraud Rule Authoring System
 *
 * These types define the contract between the frontend and backend REST API.
 */

import {
  Rule,
  RuleVersion,
  RuleSet,
  Approval,
  PersistedConditionTree,
  CompiledAST,
} from "../types/domain";
import {
  RuleType,
  RuleStatus,
  DataType,
  Operator,
  ApprovalStatus,
  EntityType,
  RuleSetStatus,
  RulesetEnvironment,
} from "../types/enums";

// ============================================================================
// Generic API Types
// ============================================================================

/**
 * Keyset (cursor-based) paginated response
 */
export interface KeysetPaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Base64-encoded cursor for the next page */
  next_cursor: string | null;
  /** Base64-encoded cursor for the previous page */
  prev_cursor: string | null;
  /** Whether there are more items after current page */
  has_next: boolean;
  /** Whether there are items before current page */
  has_prev: boolean;
  /** Number of items per page */
  limit: number;
}

/**
 * Legacy paginated response wrapper (deprecated - use KeysetPaginatedResponse)
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  /** Pagination metadata */
  pagination: {
    /** Current page number (1-indexed) */
    page: number;
    /** Number of items per page */
    page_size: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    total_pages: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Validation errors by field */
  errors?: Record<string, string[]>;
  /** HTTP status code */
  status: number;
}

/**
 * Generic list filter parameters (keyset pagination)
 */
export interface ListFilters {
  /** Base64-encoded cursor from previous page */
  cursor?: string | null;
  /** Number of items per page */
  limit?: number;
  /** Pagination direction: "next" for forward, "prev" for backward */
  direction?: "next" | "prev";
  /** Sort field */
  sort_by?: string;
  /** Sort direction */
  sort_order?: "asc" | "desc";
}

// ============================================================================
// Rule Field API Types
// ============================================================================

/**
 * Request to create a new rule field
 */
export interface CreateRuleFieldRequest {
  field_key: string;
  display_name: string;
  data_type: DataType;
  allowed_operators: Operator[];
  multi_value_allowed?: boolean;
  is_sensitive?: boolean;
  is_active?: boolean;
}

/**
 * Request to update a rule field
 */
export interface UpdateRuleFieldRequest {
  display_name?: string;
  allowed_operators?: Operator[];
  multi_value_allowed?: boolean;
  is_sensitive?: boolean;
  is_active?: boolean;
}

/**
 * Filters for listing rule fields
 */
export interface RuleFieldFilters extends ListFilters {
  is_active?: boolean;
  data_type?: DataType;
  search?: string;
}

/**
 * Request to set rule field metadata
 */
export interface SetRuleFieldMetadataRequest {
  meta_key: string;
  meta_value: Record<string, unknown>;
}

// ============================================================================
// Rule API Types
// ============================================================================

/**
 * Request to create a new rule (creates both identity and initial version)
 */
export interface CreateRuleRequest {
  rule_name: string;
  rule_type: RuleType;
  condition_tree: PersistedConditionTree;
  priority: number;
}

/**
 * Request to update a rule (creates a new version)
 */
export interface UpdateRuleRequest {
  condition_tree?: PersistedConditionTree;
  priority?: number;
}

/**
 * Filters for listing rules
 */
export interface RuleFilters extends ListFilters {
  rule_type?: RuleType;
  status?: RuleStatus;
  created_by?: string;
  search?: string;
}

/**
 * Request to submit a rule version for approval
 */
export interface SubmitRuleVersionRequest {
  remarks?: string;
  idempotency_key?: string;
}

/**
 * Request to submit a ruleset version for approval
 */
export interface SubmitRuleSetVersionRequest {
  idempotency_key?: string;
}

/**
 * Request to approve/reject a ruleset version
 */
export interface RuleSetVersionDecisionRequest {
  remarks?: string;
}

/**
 * Response containing rule with its versions
 */
export interface RuleDetailResponse {
  rule: Rule;
  versions: RuleVersion[];
  current_version: RuleVersion;
}

export interface RuleSummaryResponse {
  rule_id: string;
  rule_name: string;
  rule_type: string;
  status: string;
  latest_version?: number | null;
  latest_version_id?: string | null;
  priority?: number | null;
  action?: string | null;
}

export interface RuleSimulateRequest {
  rule_type: string;
  condition_tree: PersistedConditionTree;
  scope?: Record<string, unknown>;
  query: Record<string, unknown>;
}

export interface RuleSimulateResponse {
  match_count: number;
  sample_transactions?: string[];
  simulation_id?: string | null;
}

/**
 * Request to create a new rule version
 */
export interface CreateRuleVersionRequest {
  condition_tree: PersistedConditionTree;
  priority: number;
  scope?: {
    network?: string[];
    bin?: string[];
    mcc?: string[];
    logo?: string[];
  } | null;
}

// ============================================================================
// RuleSet API Types
// ============================================================================

/**
 * Request to create a new ruleset
 */
export interface CreateRuleSetRequest {
  rule_type: RuleType;
  environment: RulesetEnvironment;
  region: string;
  country: string;
  name?: string;
  description?: string;
}

/**
 * Request to attach rule versions to a ruleset
 */
export interface AttachRuleVersionsRequest {
  /** Rule version IDs to attach to the ruleset */
  rule_version_ids: string[];
}

/**
 * Filters for listing rulesets
 */
export interface RuleSetFilters extends ListFilters {
  rule_type?: RuleType;
  status?: RuleSetStatus;
  search?: string;
}

/**
 * Request to submit a ruleset for approval
 */
export interface SubmitRuleSetRequest {
  ruleset_id: string;
  remarks?: string;
}

/**
 * Response for ruleset detail
 */
export interface RuleSetDetailResponse {
  ruleset: RuleSet;
  rule_versions: RuleVersion[];
}

/**
 * Request to compile a ruleset
 */
export interface CompileRuleSetRequest {
  ruleset_id: string;
}

/**
 * Response from ruleset compilation
 */
export interface CompileRuleSetResponse {
  ruleset_id: string;
  compiled_ast: CompiledAST;
  compiled_at: string;
}

// ============================================================================
// Approval API Types
// ============================================================================

/**
 * Request to create an approval (submit entity for approval)
 */
export interface CreateApprovalRequest {
  entity_type: EntityType;
  entity_id: string;
  action: "SUBMIT" | "UPDATE" | "DELETE";
  remarks?: string;
}

/**
 * Request to make an approval decision
 */
export interface ApprovalDecisionRequest {
  decision: "APPROVE" | "REJECT";
  remarks?: string;
}

/**
 * Filters for listing approvals
 */
export interface ApprovalFilters extends ListFilters {
  status?: ApprovalStatus;
  entity_type?: EntityType;
  maker?: string;
  checker?: string;
}

/**
 * Response for approval detail with entity data
 */
export interface ApprovalDetailResponse {
  approval: Approval;
  entity_data: {
    entity_type: EntityType;
    entity_id: string;
    entity_name: string;
    old_value?: Record<string, unknown>;
    new_value: Record<string, unknown>;
  };
}

// ============================================================================
// Audit Log API Types
// ============================================================================

/**
 * Filters for listing audit logs
 */
export interface AuditLogFilters extends ListFilters {
  entity_type?: EntityType;
  entity_id?: string;
  performed_by?: string;
  from_date?: string;
  to_date?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Request to validate a condition tree
 */
export interface ValidateConditionTreeRequest {
  condition_tree: PersistedConditionTree;
  rule_type: RuleType;
}

/**
 * Response from condition tree validation
 */
export interface ValidateConditionTreeResponse {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Success response for mutations
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse {
  success: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// ============================================================================
// Transaction Management API Types
// ============================================================================

export type CardNetwork = "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER";

export type TransactionDecision = "APPROVE" | "DECLINE";

export type EvaluationType = "AUTH" | "MONITORING";

export type DecisionReason =
  | "RULE_MATCH"
  | "VELOCITY_MATCH"
  | "SYSTEM_DECLINE"
  | "DEFAULT_ALLOW"
  | "MANUAL_REVIEW";

export interface MatchedRuleResponse {
  rule_id: string;
  rule_version?: number | null;
  rule_version_id?: string | null;
  rule_name?: string | null;
  priority?: number | null;
  rule_type?: string | null;
  rule_action?: string | null;
  matched_at?: string | null;
  match_reason?: string | null;
  match_reason_text?: string | null;
  conditions_met?: string[] | null;
  condition_values?: Record<string, unknown> | null;
  scope?: {
    network?: string[];
    bin?: string[];
    mcc?: string[];
    logo?: string[];
  };
}

export interface TransactionResponse {
  transaction_id: string;
  evaluation_type?: EvaluationType | null;
  card_id: string;
  card_last4: string;
  card_network: CardNetwork;
  amount: number | string;
  currency: string;
  merchant_id: string;
  mcc: string;
  decision: TransactionDecision;
  decision_reason: DecisionReason;
  decision_score?: number | string | null;
  risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  review_status?: string | null;
  review_priority?: number | null;
  review_assigned_analyst_id?: string | null;
  review_case_id?: string | null;
  ruleset_id: string;
  ruleset_version: number;
  matched_rules: MatchedRuleResponse[];
  transaction_timestamp: string;
  ingestion_timestamp: string;
}

export interface TransactionFilters extends ListFilters {
  decision?: TransactionDecision | null;
  decision_reason?: DecisionReason | null;
  card_id?: string | null;
  merchant_id?: string | null;
  ruleset_id?: string | null;
  rule_id?: string | null;
  from_date?: string | null;
  to_date?: string | null;
  case_id?: string | null;
  assigned_to_me?: boolean | null;
  review_status?: string | null;
  risk_level?: string | null;
  min_amount?: number | null;
  max_amount?: number | null;
}

export interface TransactionMetricsResponse {
  total_transactions: number;
  decision_breakdown?: {
    APPROVE: number;
    DECLINE: number;
    MONITORING?: number;
  };
  decision_reason_breakdown?: Record<DecisionReason, number>;
  top_matched_rules?: Array<{
    rule_id: string;
    rule_name: string;
    match_count: number;
  }>;
  transactions_over_time?: Array<{
    date: string;
    total: number;
    approve: number;
    decline: number;
    MONITORING?: number;
  }>;
  approved_count?: number;
  declined_count?: number;
  MONITORING_count?: number;
  total_amount?: number;
  avg_amount?: number;
}

// ============================================================================
// RuleSet Version API Types
// ============================================================================

export interface RuleSetVersionResponse {
  ruleset_version_id: string;
  ruleset_id: string;
  version: number;
  status: string;
  created_by: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  activated_at: string | null;
  rule_versions: RuleVersionInRulesetResponse[];
}

export interface RuleVersionInRulesetResponse {
  rule_version_id: string;
  rule_id: string;
  version: number;
  rule_name: string;
  rule_type: string;
  priority: number;
  scope: {
    network?: string[];
    bin?: string[];
    mcc?: string[];
    logo?: string[];
  } | null;
  status: string;
}

export interface RuleSetVersionFilters extends ListFilters {
  status?: string | null;
}

// ============================================================================
// Analyst Workflow API Types (Review, Notes, Worklist, Cases)
// ============================================================================

// Re-export types from domain types for API consistency
export type {
  TransactionStatus,
  RiskLevel,
  ResolutionCode,
  AnalystDecision,
  TransactionReview,
  StatusUpdateRequest,
  AssignRequest,
  ResolveRequest,
  EscalateRequest,
} from "../types/review";

export type {
  NoteType,
  AnalystNote,
  NoteCreateRequest,
  NoteUpdateRequest,
  NotesListResponse,
} from "../types/notes";

export type {
  CaseType,
  CaseStatus,
  TransactionCase,
  CaseCreateRequest,
  CaseUpdateRequest,
  CaseResolveRequest,
  CaseActivity,
  CasesListResponse,
  CaseActivityResponse,
} from "../types/case";

export type {
  WorklistItem,
  WorklistStats,
  WorklistFilters,
  ClaimNextRequest,
  WorklistResponse,
} from "../types/worklist";

export type {
  BulkOperationResult,
  BulkOperationResponse,
  BulkAssignRequest,
  BulkStatusUpdateRequest,
  BulkCreateCaseRequest,
} from "../types/bulk";

/**
 * Enhanced transaction filters with review status
 */
export interface EnhancedTransactionFilters extends TransactionFilters {
  review_status?: string | null;
  risk_level?: string | null;
  assigned_analyst_id?: string | null;
  case_id?: string | null;
}

/**
 * Field Registry response types
 */
export interface FieldRegistryResponse {
  registry_version: number;
  artifact_uri: string;
  checksum: string;
  field_count: number;
  created_at: string;
  created_by: string;
}

export interface NextFieldIdResponse {
  next_field_id: number;
}
