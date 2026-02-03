import type { RiskLevel, TransactionStatus } from "./review";

export type CardNetwork = "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER";

export type TransactionDecision = "APPROVE" | "DECLINE";

export type EvaluationType = "AUTH" | "MONITORING";

export type DecisionReason =
  | "RULE_MATCH"
  | "VELOCITY_MATCH"
  | "SYSTEM_DECLINE"
  | "DEFAULT_ALLOW"
  | "MANUAL_REVIEW";

export interface MatchedRule {
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

export interface Transaction {
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
  risk_level?: RiskLevel | null;
  review_status?: TransactionStatus | null;
  review_priority?: number | null;
  review_assigned_analyst_id?: string | null;
  review_case_id?: string | null;
  ruleset_id: string;
  ruleset_version: number;
  matched_rules: MatchedRule[];
  transaction_timestamp: string;
  ingestion_timestamp: string;
}

export interface TransactionFilters {
  cursor?: string | null;
  limit?: number;
  decision?: TransactionDecision | null;
  decision_reason?: DecisionReason | null;
  card_id?: string | null;
  merchant_id?: string | null;
  ruleset_id?: string | null;
  rule_id?: string | null;
  from_date?: string | null;
  to_date?: string | null;
  date_range?: [unknown, unknown] | null;
  case_id?: string | null;
  assigned_to_me?: boolean | null;
  review_status?: TransactionStatus | null;
  risk_level?: RiskLevel | null;
  min_amount?: number | null;
  max_amount?: number | null;
  search?: string | null;
}

export interface TransactionMetrics {
  total_transactions: number;
  decision_breakdown: {
    APPROVE: number;
    DECLINE: number;
    MONITORING: number;
  };
  decision_reason_breakdown: Record<DecisionReason, number>;
  top_matched_rules: Array<{
    rule_id: string;
    rule_name: string;
    match_count: number;
  }>;
  transactions_over_time: Array<{
    date: string;
    total: number;
    approve: number;
    decline: number;
    MONITORING: number;
  }>;
}

export interface TransactionOverview {
  transaction: Transaction;
  review?: import("./review").TransactionReview | null;
  notes?: import("./notes").AnalystNote[];
  case?: import("./case").TransactionCase | null;
  matched_rules?: MatchedRule[];
  last_activity_at?: string | null;
}
