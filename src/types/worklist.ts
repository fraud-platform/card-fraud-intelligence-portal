/**
 * Worklist Types
 *
 * Types for the analyst worklist/queue for prioritized transaction review.
 */

import type { RiskLevel, TransactionStatus } from "./review";
import type { TransactionDecision, DecisionReason } from "./transaction";

/**
 * Item in the analyst worklist queue
 */
export interface WorklistItem {
  review_id: string;
  transaction_id: string;
  status: TransactionStatus;
  priority: number;
  card_id: string;
  card_last4: string | null;
  transaction_amount: number;
  transaction_currency: string;
  transaction_timestamp: string;
  decision: TransactionDecision;
  decision_reason: DecisionReason;
  decision_score: number | null;
  risk_level: RiskLevel | null;
  assigned_analyst_id: string | null;
  assigned_at: string | null;
  case_id: string | null;
  case_number: string | null;
  first_reviewed_at: string | null;
  last_activity_at: string | null;
  created_at: string;
  merchant_id: string | null;
  merchant_category_code: string | null;
  trace_id: string | null;
  time_in_queue_seconds?: number;
}

/**
 * Worklist statistics for dashboard
 */
export interface WorklistStats {
  unassigned_total: number;
  unassigned_by_priority: Record<string, number>;
  unassigned_by_risk: Record<RiskLevel, number>;
  my_assigned_total: number;
  my_assigned_by_status: Record<TransactionStatus, number>;
  resolved_today: number;
  resolved_by_code: Record<string, number>;
  avg_resolution_minutes: number;
}

/**
 * Worklist filters
 */
export interface WorklistFilters {
  status?: TransactionStatus | null;
  priority_filter?: number | null;
  risk_level_filter?: RiskLevel | null;
  assigned_only?: boolean;
  limit?: number;
  cursor?: string | null;
}

/**
 * Request to claim next transaction from queue
 */
export interface ClaimNextRequest {
  priority_filter?: number;
  risk_level_filter?: RiskLevel;
}

/**
 * Paginated worklist response
 */
export interface WorklistResponse {
  items: WorklistItem[];
  total: number;
  page_size: number;
  has_more: boolean;
  next_cursor?: string | null;
}

/**
 * Priority display configuration
 */
export const PRIORITY_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: "Critical", color: "red" },
  2: { label: "High", color: "orange" },
  3: { label: "Medium", color: "gold" },
  4: { label: "Low", color: "blue" },
  5: { label: "Minimal", color: "default" },
};

/**
 * Risk level display configuration
 */
export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string }> = {
  CRITICAL: { label: "Critical", color: "red" },
  HIGH: { label: "High", color: "orange" },
  MEDIUM: { label: "Medium", color: "gold" },
  LOW: { label: "Low", color: "green" },
};

/**
 * Transaction status display configuration
 */
export const TRANSACTION_STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; color: string }
> = {
  PENDING: { label: "Pending", color: "default" },
  IN_REVIEW: { label: "In Review", color: "processing" },
  ESCALATED: { label: "Escalated", color: "warning" },
  RESOLVED: { label: "Resolved", color: "success" },
  CLOSED: { label: "Closed", color: "default" },
};
