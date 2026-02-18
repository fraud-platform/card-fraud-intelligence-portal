/**
 * Ops Analyst Agent types
 * Mirrors app/schemas/v1/ from card-fraud-ops-analyst-agent
 */

export type OpsAgentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type OpsAgentRunMode = "quick" | "deep";
export type OpsAgentRunStatus = "SUCCESS" | "FAILED" | "PARTIAL";
export type OpsAgentModelMode = "deterministic" | "hybrid";
export type OpsAgentRecommendationStatus = "OPEN" | "ACKNOWLEDGED" | "REJECTED" | "EXPORTED";
export type OpsAgentRecommendationType = "review_priority" | "case_action" | "rule_candidate";

export interface RunInvestigationRequest {
  transaction_id: string;
  mode?: OpsAgentRunMode;
  case_id?: string;
  include_rule_draft_preview?: boolean;
}

export interface InsightSummary {
  insight_id: string;
  severity: OpsAgentSeverity;
  summary: string;
  generated_at: string;
}

export interface RecommendationPayload {
  title: string;
  impact: string;
  [key: string]: unknown;
}

export interface RecommendationDetail {
  recommendation_id: string;
  insight_id?: string;
  type: OpsAgentRecommendationType;
  status: OpsAgentRecommendationStatus;
  priority: number;
  payload: RecommendationPayload | Record<string, unknown>;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  created_at?: string;
}

export interface RunResponse {
  run_id: string;
  status: OpsAgentRunStatus;
  mode: OpsAgentRunMode;
  transaction_id: string;
  model_mode: OpsAgentModelMode;
  duration_ms: number | null;
  insight: InsightSummary | null;
  recommendations: RecommendationDetail[];
}

export interface DetailResponse extends RunResponse {
  case_id: string | null;
  started_at: string;
  completed_at: string | null;
  error_summary: string | null;
  stage_durations: Record<string, number>;
  evidence: Record<string, unknown>[];
}

export interface EvidenceItem {
  evidence_id: string;
  evidence_kind: string;
  evidence_payload: Record<string, unknown>;
  created_at: string;
}

export interface InsightDetail {
  insight_id: string;
  transaction_id: string;
  severity: OpsAgentSeverity;
  summary: string;
  insight_type: string;
  model_mode: OpsAgentModelMode;
  generated_at: string;
  evidence: EvidenceItem[];
}

export interface InsightListResponse {
  insights: InsightDetail[];
  next_cursor: string | null;
}

export interface RecommendationListResponse {
  recommendations: RecommendationDetail[];
  next_cursor: string | null;
  total: number;
}

export interface AcknowledgeRequest {
  action: "ACKNOWLEDGED" | "REJECTED";
  comment?: string;
}
