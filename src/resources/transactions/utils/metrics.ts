import type { TransactionMetricsResponse } from "../../../api/types";

export interface DecisionReasonRow {
  reason: string;
  count: number;
  percent: number;
}

// complexity is acceptable for concise domain math; extract further if this grows
/* eslint-disable-next-line complexity */
export function computeTotalCounts(metrics: TransactionMetricsResponse | null): {
  total: number;
  approved: number;
  declined: number;
  MONITORING: number;
  approvePercent: number;
  declinePercent: number;
  MONITORINGPercent: number;
} {
  const total = metrics?.total_transactions ?? 0;
  const approved = metrics?.decision_breakdown?.APPROVE ?? metrics?.approved_count ?? 0;
  const declined = metrics?.decision_breakdown?.DECLINE ?? metrics?.declined_count ?? 0;
  const MONITORING = metrics?.decision_breakdown?.MONITORING ?? metrics?.MONITORING_count ?? 0;

  const pct = (count: number): number => (total > 0 ? (count / total) * 100 : 0);

  return {
    total,
    approved,
    declined,
    MONITORING,
    approvePercent: pct(approved),
    declinePercent: pct(declined),
    MONITORINGPercent: pct(MONITORING),
  };
}

export function buildDecisionReasonRows(
  metrics: TransactionMetricsResponse | null
): DecisionReasonRow[] {
  const total = metrics?.total_transactions ?? 0;
  const breakdown = metrics?.decision_reason_breakdown ?? {};

  return Object.entries(breakdown).map(([reason, count]) => ({
    reason,
    count: count as number,
    percent: total > 0 ? ((count as number) / total) * 100 : 0,
  }));
}

export default {
  computeTotalCounts,
  buildDecisionReasonRows,
};
