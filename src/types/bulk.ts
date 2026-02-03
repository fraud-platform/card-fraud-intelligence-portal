/**
 * Bulk Operations Types
 *
 * Types for bulk operations on transactions.
 */

import type { TransactionStatus, ResolutionCode, RiskLevel } from "./review";
import type { CaseType } from "./case";

/**
 * Result of a single item in a bulk operation
 */
export interface BulkOperationResult {
  transaction_id: string;
  success: boolean;
  error_message: string | null;
  error_code: string | null;
}

/**
 * Response from a bulk operation
 */
export interface BulkOperationResponse {
  success_count: number;
  failure_count: number;
  results: BulkOperationResult[];
  case_id?: string | null;
}

/**
 * Request to bulk assign transactions to an analyst
 */
export interface BulkAssignRequest {
  transaction_ids: string[];
  analyst_id: string;
}

/**
 * Request to bulk update transaction status
 */
export interface BulkStatusUpdateRequest {
  transaction_ids: string[];
  status: TransactionStatus;
  resolution_code?: ResolutionCode;
  resolution_notes?: string;
}

/**
 * Request to create a case from multiple transactions
 */
export interface BulkCreateCaseRequest {
  transaction_ids: string[];
  case_type: CaseType;
  title: string;
  description?: string;
  assigned_analyst_id?: string;
  risk_level?: RiskLevel;
}
