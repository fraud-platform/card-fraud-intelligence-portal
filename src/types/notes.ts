/**
 * Analyst Notes Types
 *
 * Types for managing analyst notes on transactions for documentation
 * and investigation tracking.
 */

/**
 * Type of note
 */
export type NoteType =
  | "GENERAL"
  | "INITIAL_REVIEW"
  | "CUSTOMER_CONTACT"
  | "MERCHANT_CONTACT"
  | "BANK_CONTACT"
  | "FRAUD_CONFIRMED"
  | "FALSE_POSITIVE"
  | "ESCALATION"
  | "RESOLUTION"
  | "LEGAL_HOLD"
  | "INTERNAL_REVIEW";

/**
 * Analyst note attached to a transaction
 */
export interface AnalystNote {
  id: string;
  transaction_id: string;
  note_type: NoteType;
  note_content: string;
  is_private: boolean;
  is_system_generated: boolean;
  analyst_id: string;
  analyst_name: string | null;
  analyst_email: string | null;
  case_id: string | null;
  attachments?: NoteAttachment[];
  created_at: string;
  updated_at: string;
}

/**
 * Note attachment reference
 */
export interface NoteAttachment {
  name: string;
  s3_key: string;
  content_type?: string;
  size_bytes?: number;
}

/**
 * Request to create a new note
 */
export interface NoteCreateRequest {
  note_type: NoteType;
  note_content: string;
  is_private?: boolean;
}

/**
 * Request to update an existing note
 */
export interface NoteUpdateRequest {
  note_content?: string;
  note_type?: NoteType;
}

/**
 * Paginated notes response
 */
export interface NotesListResponse {
  items: AnalystNote[];
  total: number;
  page_size: number;
  has_more: boolean;
  next_cursor?: string | null;
}

/**
 * Note type display configuration
 */
export const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; color: string; icon?: string }> = {
  GENERAL: { label: "General", color: "default" },
  INITIAL_REVIEW: { label: "Initial Review", color: "blue" },
  CUSTOMER_CONTACT: { label: "Customer Contact", color: "cyan" },
  MERCHANT_CONTACT: { label: "Merchant Contact", color: "purple" },
  BANK_CONTACT: { label: "Bank Contact", color: "geekblue" },
  FRAUD_CONFIRMED: { label: "Fraud Confirmed", color: "red" },
  FALSE_POSITIVE: { label: "False Positive", color: "green" },
  ESCALATION: { label: "Escalation", color: "orange" },
  RESOLUTION: { label: "Resolution", color: "lime" },
  LEGAL_HOLD: { label: "Legal Hold", color: "volcano" },
  INTERNAL_REVIEW: { label: "Internal Review", color: "gold" },
};
