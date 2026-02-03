/**
 * Case Management Types
 *
 * Types for grouping related transactions into investigation cases.
 */

import type { RiskLevel } from "./review";

/**
 * Type of investigation case
 */
export type CaseType =
  | "INVESTIGATION"
  | "DISPUTE"
  | "CHARGEBACK"
  | "FRAUD_RING"
  | "ACCOUNT_TAKEOVER"
  | "PATTERN_ANALYSIS"
  | "MERCHANT_REVIEW"
  | "CARD_COMPROMISE"
  | "OTHER";

/**
 * Status of a case
 */
export type CaseStatus = "OPEN" | "IN_PROGRESS" | "PENDING_INFO" | "RESOLVED" | "CLOSED";

/**
 * Transaction case for grouping related transactions
 */
export interface TransactionCase {
  id: string;
  case_number: string;
  case_type: CaseType;
  case_status: CaseStatus;
  risk_level: RiskLevel | null;
  title: string;
  description: string | null;
  total_transaction_count: number;
  total_transaction_amount: number;
  assigned_analyst_id: string | null;
  assigned_analyst_name: string | null;
  assigned_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_summary: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request to create a new case
 */
export interface CaseCreateRequest {
  case_type: CaseType;
  title: string;
  description?: string;
  risk_level?: RiskLevel;
  transaction_ids?: string[];
  assigned_analyst_id?: string;
}

/**
 * Request to update a case
 */
export interface CaseUpdateRequest {
  case_status?: CaseStatus;
  risk_level?: RiskLevel;
  title?: string;
  description?: string;
  assigned_analyst_id?: string;
}

/**
 * Request to resolve a case
 */
export interface CaseResolveRequest {
  resolution_summary: string;
  resolved_by?: string;
}

/**
 * Case activity log entry
 */
export interface CaseActivity {
  id: string;
  case_id: string;
  activity_type: string;
  activity_description: string;
  activity_data: Record<string, unknown> | null;
  performed_by: string;
  performed_by_name: string | null;
  created_at: string;
}

/**
 * Paginated cases response
 */
export interface CasesListResponse {
  items: TransactionCase[];
  total: number;
  page_size: number;
  has_more: boolean;
  next_cursor?: string | null;
}

/**
 * Case activity log response
 */
export interface CaseActivityResponse {
  items: CaseActivity[];
  total: number;
  has_more: boolean;
}

/**
 * Case type display configuration
 */
export const CASE_TYPE_CONFIG: Record<CaseType, { label: string; color: string }> = {
  INVESTIGATION: { label: "Investigation", color: "blue" },
  DISPUTE: { label: "Dispute", color: "orange" },
  CHARGEBACK: { label: "Chargeback", color: "volcano" },
  FRAUD_RING: { label: "Fraud Ring", color: "red" },
  ACCOUNT_TAKEOVER: { label: "Account Takeover", color: "magenta" },
  PATTERN_ANALYSIS: { label: "Pattern Analysis", color: "purple" },
  MERCHANT_REVIEW: { label: "Merchant Review", color: "geekblue" },
  CARD_COMPROMISE: { label: "Card Compromise", color: "gold" },
  OTHER: { label: "Other", color: "default" },
};

/**
 * Case status display configuration
 */
export const CASE_STATUS_CONFIG: Record<CaseStatus, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "blue" },
  IN_PROGRESS: { label: "In Progress", color: "processing" },
  PENDING_INFO: { label: "Pending Info", color: "warning" },
  RESOLVED: { label: "Resolved", color: "success" },
  CLOSED: { label: "Closed", color: "default" },
};
