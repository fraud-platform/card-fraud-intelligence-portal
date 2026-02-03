import { describe, it, expect } from "vitest";
import { computeTotalCounts, buildDecisionReasonRows } from "../metrics";

const mockMetrics = {
  total_transactions: 100,
  decision_breakdown: {
    APPROVE: 60,
    DECLINE: 30,
    MONITORING: 10,
  },
  decision_reason_breakdown: {
    HIGH_RISK: 40,
    SUSPECTED_FRAUD: 20,
  },
} as any;

describe("transaction metrics utils", () => {
  it("computes totals and percentages correctly", () => {
    const res = computeTotalCounts(mockMetrics);
    expect(res.total).toBe(100);
    expect(res.approved).toBe(60);
    expect(res.declined).toBe(30);
    expect(res.MONITORING).toBe(10);
    expect(res.approvePercent).toBeCloseTo(60.0, 5);
    expect(res.declinePercent).toBeCloseTo(30.0, 5);
    expect(res.MONITORINGPercent).toBeCloseTo(10.0, 5);
  });

  it("handles empty/null metrics gracefully", () => {
    const res = computeTotalCounts(null);
    expect(res.total).toBe(0);
    expect(res.approvePercent).toBe(0);
  });

  it("builds decision reason rows", () => {
    const rows = buildDecisionReasonRows(mockMetrics);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveProperty("reason");
    expect(rows[0]).toHaveProperty("count");
    expect(rows[0]).toHaveProperty("percent");
    expect(rows[0].percent).toBeCloseTo((40 / 100) * 100, 5);
  });
});
