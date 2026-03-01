import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOpsAnalystInsights } from "../useOpsAnalystInsights";
import * as httpClient from "@/api/httpClient";
import { OPS_ANALYST } from "@/api/endpoints";
import type { InsightListResponse, InsightDetail } from "@/types/opsAnalyst";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
}));

describe("useOpsAnalystInsights", () => {
  const mockGet = vi.mocked(httpClient.get);

  const mockInsight: InsightDetail = {
    insight_id: "insight-1",
    transaction_id: "txn-1",
    severity: "HIGH",
    summary: "Suspicious activity detected",
    insight_type: "FRAUD",
    model_mode: "agentic",
    generated_at: "2024-01-01T12:00:00Z",
    evidence: [],
  };

  const mockResponse: InsightListResponse = {
    insights: [mockInsight],
    next_cursor: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch insights", async () => {
    mockGet.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useOpsAnalystInsights("txn-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.insights).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGet).toHaveBeenCalledWith(OPS_ANALYST.INSIGHTS.LIST("txn-1"));
    expect(result.current.insights).toEqual([mockInsight]);
    expect(result.current.error).toBeNull();
  });

  it("should handle errors", async () => {
    mockGet.mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useOpsAnalystInsights("txn-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.insights).toEqual([]);
  });

  it("should not fetch if transactionId is undefined", async () => {
    const { result } = renderHook(() => useOpsAnalystInsights(undefined));

    expect(result.current.loading).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should reload insights", async () => {
    mockGet.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useOpsAnalystInsights("txn-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGet).toHaveBeenCalledTimes(1);

    result.current.reload();

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });
});
