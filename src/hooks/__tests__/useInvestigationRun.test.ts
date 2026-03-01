import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useInvestigationRun } from "../useInvestigationRun";
import * as httpClient from "@/api/httpClient";
import { OPS_ANALYST } from "@/api/endpoints";
import type { RunInvestigationRequest, RunResponse } from "@/types/opsAnalyst";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  post: vi.fn(),
}));

describe("useInvestigationRun", () => {
  const mockPost = vi.mocked(httpClient.post);

  const mockResponse: RunResponse = {
    run_id: "run-1",
    status: "SUCCESS",
    mode: "quick",
    transaction_id: "txn-1",
    model_mode: "agentic",
    duration_ms: 100,
    insight: {
      insight_id: "insight-1",
      severity: "LOW",
      summary: "No issues",
      generated_at: "2024-01-01T12:00:00Z",
    },
    recommendations: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should initialize correctly", () => {
    const { result } = renderHook(() => useInvestigationRun());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastResult).toBeNull();
  });

  it("should run investigation successfully", async () => {
    mockPost.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useInvestigationRun());

    const req: RunInvestigationRequest = { transaction_id: "txn-1", mode: "quick" };

    await result.current.run(req);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(OPS_ANALYST.INVESTIGATIONS.RUN, req);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastResult).toEqual(mockResponse);
    });
  });

  it("should handle run failure", async () => {
    const error = new Error("Run failed");
    mockPost.mockRejectedValue(error);

    const { result } = renderHook(() => useInvestigationRun());

    const req: RunInvestigationRequest = { transaction_id: "txn-1", mode: "deep" };

    try {
      await result.current.run(req);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Run failed");
      expect(result.current.lastResult).toBeNull();
    });
  });
});
