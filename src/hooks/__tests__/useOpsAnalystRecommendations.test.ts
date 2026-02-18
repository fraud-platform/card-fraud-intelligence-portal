import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOpsAnalystRecommendations } from "../useOpsAnalystRecommendations";
import * as httpClient from "@/api/httpClient";
import { OPS_ANALYST } from "@/api/endpoints";
import type { RecommendationListResponse, RecommendationDetail } from "@/types/opsAnalyst";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe("useOpsAnalystRecommendations", () => {
  const mockGet = vi.mocked(httpClient.get);
  const mockPost = vi.mocked(httpClient.post);

  const mockRec: RecommendationDetail = {
    recommendation_id: "rec-1",
    type: "review_priority",
    status: "OPEN",
    priority: 1,
    payload: { title: "Urgent Review", impact: "High Risk" },
  };

  const mockResponse: RecommendationListResponse = {
    recommendations: [mockRec],
    total: 1,
    next_cursor: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch recommendations on mount", async () => {
    mockGet.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useOpsAnalystRecommendations());

    expect(result.current.loading).toBe(true);
    expect(result.current.recommendations).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(OPS_ANALYST.RECOMMENDATIONS.LIST));
    expect(result.current.recommendations).toEqual([mockRec]);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    mockGet.mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useOpsAnalystRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.recommendations).toEqual([]);
  });

  it("should acknowledge recommendation", async () => {
    mockPost.mockResolvedValue({});
    mockGet.mockResolvedValue(mockResponse); // initial load

    // First setup the hook and wait for load
    const { result } = renderHook(() => useOpsAnalystRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Now call acknowledge
    mockGet.mockClear();

    // Mock the reload response (maybe empty or different)
    const afterAckResponse = { ...mockResponse, total: 0, recommendations: [] };
    mockGet.mockResolvedValue(afterAckResponse);

    await result.current.acknowledge("rec-1", { action: "ACKNOWLEDGED", comment: "Done" });

    expect(mockPost).toHaveBeenCalledWith(OPS_ANALYST.RECOMMENDATIONS.ACKNOWLEDGE("rec-1"), {
      action: "ACKNOWLEDGED",
      comment: "Done",
    });

    // Should trigger reload
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });
});
