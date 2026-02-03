/**
 * Transaction Review Types
 *
 * Types for the fraud analyst review workflow including status management,
 * assignment, resolution, and escalation.
 */

/**
 * Status of a transaction review
 */
export type TransactionStatus = "PENDING" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "CLOSED";

/**
 * Risk level classification
 */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Resolution codes for completed reviews
 */
export type ResolutionCode =
  | "FRAUD_CONFIRMED"
  | "FALSE_POSITIVE"
  | "LEGITIMATE"
  | "DUPLICATE"
  | "INSUFFICIENT_INFO";

/**
 * Analyst decision override
 */
export type AnalystDecision = "APPROVE" | "DECLINE";

/**
 * Transaction review record
 */
export interface TransactionReview {
  id: string;
  transaction_id: string;
  status: TransactionStatus;
  risk_level: RiskLevel | null;
  priority: number;
  assigned_analyst_id: string | null;
  assigned_analyst_name: string | null;
  assigned_at: string | null;
  first_reviewed_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_code: ResolutionCode | null;
  resolution_notes: string | null;
  analyst_decision: AnalystDecision | null;
  analyst_decision_reason: string | null;
  case_id: string | null;
  escalated_at: string | null;
  escalated_to: string | null;
  escalation_reason: string | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
  // Denormalized transaction fields for display
  transaction_amount?: number;
  transaction_currency?: string;
  decision?: string;
}

/**
 * Request to update review status
 */
export interface StatusUpdateRequest {
  status: TransactionStatus;
  notes?: string;
}

/**
 * Request to assign a transaction to an analyst
 */
export interface AssignRequest {
  analyst_id: string;
  analyst_name?: string;
}

/**
 * Request to resolve a transaction review
 */
export interface ResolveRequest {
  resolution_code: ResolutionCode;
  resolution_notes?: string;
  analyst_decision?: AnalystDecision;
  analyst_decision_reason?: string;
}

/**
 * Request to escalate a transaction
 */
export interface EscalateRequest {
  escalation_reason: string;
  escalate_to?: string;
}

/**
 * Valid status transitions
 */
export const VALID_STATUS_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ["IN_REVIEW"],
  IN_REVIEW: ["ESCALATED", "RESOLVED"],
  ESCALATED: ["IN_REVIEW", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_REVIEW"],
  CLOSED: [],
};

/**
 * Check if a status transition is valid
 */
export function canTransition(from: TransactionStatus, to: TransactionStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to);
}

/**
 * Get valid transitions from a given status
 */
export function getValidTransitions(current: TransactionStatus): TransactionStatus[] {
  return VALID_STATUS_TRANSITIONS[current];
}
