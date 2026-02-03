/**
 * Unit tests for useWorklist hooks
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useWorklist, useWorklistStats, useClaimNext } from "../useWorklist";
import * as httpClient from "@/api/httpClient";
import { WORKLIST } from "@/api/endpoints";
import type {
  WorklistItem,
  WorklistStats,
  WorklistResponse,
  ClaimNextRequest,
} from "@/types/worklist";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe("useWorklist", () => {
  const mockGet = vi.mocked(httpClient.get);

  const mockWorklistItem1: WorklistItem = {
    review_id: "review-1",
    transaction_id: "txn-123",
    status: "PENDING",
    priority: 1,
    card_id: "card-1",
    card_last4: "1234",
    transaction_amount: 500.0,
    transaction_currency: "USD",
    transaction_timestamp: "2024-01-15T10:00:00Z",
    decision: "APPROVE",
    decision_reason: "NORMAL",
    decision_score: 95.5,
    risk_level: "HIGH",
    assigned_analyst_id: null,
    assigned_at: null,
    case_id: null,
    case_number: null,
    first_reviewed_at: null,
    last_activity_at: "2024-01-15T10:00:00Z",
    created_at: "2024-01-15T09:00:00Z",
    merchant_id: "merchant-1",
    merchant_category_code: "5967",
    trace_id: "trace-123",
    time_in_queue_seconds: 3600,
  };

  const mockWorklistItem2: WorklistItem = {
    review_id: "review-2",
    transaction_id: "txn-456",
    status: "IN_REVIEW",
    priority: 2,
    card_id: "card-2",
    card_last4: "5678",
    transaction_amount: 1500.0,
    transaction_currency: "USD",
    transaction_timestamp: "2024-01-15T11:00:00Z",
    decision: "DECLINE",
    decision_reason: "SUSPICIOUS_PATTERN",
    decision_score: 35.0,
    risk_level: "MEDIUM",
    assigned_analyst_id: "analyst-1",
    assigned_at: "2024-01-15T11:05:00Z",
    case_id: "case-1",
    case_number: "CASE-001",
    first_reviewed_at: "2024-01-15T11:05:00Z",
    last_activity_at: "2024-01-15T11:30:00Z",
    created_at: "2024-01-15T10:30:00Z",
    merchant_id: "merchant-2",
    merchant_category_code: "5411",
    trace_id: "trace-456",
    time_in_queue_seconds: 1800,
  };

  const mockWorklistResponse: WorklistResponse = {
    items: [mockWorklistItem1, mockWorklistItem2],
    total: 2,
    page_size: 50,
    has_more: false,
    next_cursor: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchWorklist", () => {
    it("should fetch worklist items on mount", async () => {
      mockGet.mockResolvedValue(mockWorklistResponse);

      const { result } = renderHook(() => useWorklist());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(WORKLIST.LIST, expect.any(Object));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.items).toEqual([mockWorklistItem1, mockWorklistItem2]);
      expect(result.current.total).toBe(2);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.nextCursor).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("should fetch worklist with filters", async () => {
      mockGet.mockResolvedValue(mockWorklistResponse);

      const filters = {
        status: "PENDING" as const,
        priority_filter: 1,
        risk_level_filter: "HIGH" as const,
        assigned_only: true,
      };

      const { result } = renderHook(() => useWorklist({ filters }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedUrl = expect.stringContaining("?");
      expect(mockGet).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(result.current.items).toEqual([mockWorklistItem1, mockWorklistItem2]);
    });

    it("should handle pagination with cursor", async () => {
      const paginatedResponse: WorklistResponse = {
        items: [mockWorklistItem1],
        total: 10,
        page_size: 50,
        has_more: true,
        next_cursor: "cursor-123",
      };

      mockGet.mockResolvedValue(paginatedResponse);

      const { result } = renderHook(() =>
        useWorklist({
          filters: { limit: 50, cursor: "cursor-123" },
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toEqual([mockWorklistItem1]);
      expect(result.current.total).toBe(10);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.nextCursor).toBe("cursor-123");
    });

    it("should handle empty worklist", async () => {
      const emptyResponse: WorklistResponse = {
        items: [],
        total: 0,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useWorklist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle response with missing optional fields", async () => {
      const partialResponse = {
        items: [mockWorklistItem1],
        total: 1,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValue(partialResponse);

      const { result } = renderHook(() => useWorklist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toEqual([mockWorklistItem1]);
      expect(result.current.nextCursor).toBeNull();
    });

    it("should not fetch when enabled is false", async () => {
      const { result } = renderHook(() => useWorklist({ enabled: false }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.items).toEqual([]);
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Failed to fetch worklist");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useWorklist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.items).toEqual([]);
    });

    it("should handle non-Error exceptions", async () => {
      mockGet.mockRejectedValue("string error");

      const { result } = renderHook(() => useWorklist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Failed to fetch worklist");
      expect(result.current.items).toEqual([]);
    });
  });

  describe("refetch", () => {
    it("should refetch worklist when called", async () => {
      mockGet.mockResolvedValue(mockWorklistResponse);

      const { result } = renderHook(() => useWorklist());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should update items after refetch", async () => {
      const updatedResponse: WorklistResponse = {
        items: [
          mockWorklistItem1,
          mockWorklistItem2,
          { ...mockWorklistItem1, review_id: "review-3" },
        ],
        total: 3,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValueOnce(mockWorklistResponse).mockResolvedValueOnce(updatedResponse);

      const { result } = renderHook(() => useWorklist());

      await waitFor(() => {
        expect(result.current.items.length).toBe(2);
      });

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.items.length).toBe(3);
        expect(result.current.total).toBe(3);
      });
    });
  });

  describe("filter changes", () => {
    it("should refetch when filters change", async () => {
      mockGet.mockResolvedValue(mockWorklistResponse);

      const { result, rerender } = renderHook(({ filters }) => useWorklist({ filters }), {
        initialProps: { filters: { status: "PENDING" as const } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Change filters
      rerender({ filters: { status: "IN_REVIEW" as const } });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should refetch when enabled changes from false to true", async () => {
      mockGet.mockResolvedValue(mockWorklistResponse);

      const { result, rerender } = renderHook(({ enabled }) => useWorklist({ enabled }), {
        initialProps: { enabled: false },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();

      // Enable fetching
      rerender({ enabled: true });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(result.current.items).toEqual([mockWorklistItem1, mockWorklistItem2]);
      });
    });
  });
});

describe("useWorklistStats", () => {
  const mockGet = vi.mocked(httpClient.get);

  const mockStats: WorklistStats = {
    unassigned_total: 45,
    unassigned_by_priority: {
      "1": 10,
      "2": 15,
      "3": 12,
      "4": 8,
    },
    unassigned_by_risk: {
      CRITICAL: 5,
      HIGH: 15,
      MEDIUM: 18,
      LOW: 7,
    },
    my_assigned_total: 12,
    my_assigned_by_status: {
      PENDING: 3,
      IN_REVIEW: 6,
      ESCALATED: 2,
      RESOLVED: 1,
      CLOSED: 0,
    },
    resolved_today: 24,
    resolved_by_code: {
      FRAUD_CONFIRMED: 8,
      FALSE_POSITIVE: 12,
      MANUAL_REVIEW: 4,
    },
    avg_resolution_minutes: 35.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchStats", () => {
    it("should fetch worklist stats on mount", async () => {
      mockGet.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useWorklistStats());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.stats).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(WORKLIST.STATS, expect.any(Object));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.error).toBeNull();
    });

    it("should not fetch when enabled is false", async () => {
      const { result } = renderHook(() => useWorklistStats(false));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.stats).toBeNull();
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Failed to fetch stats");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useWorklistStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.stats).toBeNull();
    });

    it("should handle non-Error exceptions", async () => {
      mockGet.mockRejectedValue("string error");

      const { result } = renderHook(() => useWorklistStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Failed to fetch stats");
      expect(result.current.stats).toBeNull();
    });
  });

  describe("refetch", () => {
    it("should refetch stats when called", async () => {
      mockGet.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useWorklistStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should update stats after refetch", async () => {
      const updatedStats: WorklistStats = {
        ...mockStats,
        unassigned_total: 50,
        resolved_today: 30,
      };

      mockGet.mockResolvedValueOnce(mockStats).mockResolvedValueOnce(updatedStats);

      const { result } = renderHook(() => useWorklistStats());

      await waitFor(() => {
        expect(result.current.stats?.unassigned_total).toBe(45);
      });

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.stats?.unassigned_total).toBe(50);
        expect(result.current.stats?.resolved_today).toBe(30);
      });
    });
  });

  describe("enabled changes", () => {
    it("should refetch when enabled changes from false to true", async () => {
      mockGet.mockResolvedValue(mockStats);

      const { result, rerender } = renderHook(({ enabled }) => useWorklistStats(enabled), {
        initialProps: { enabled: false },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();

      // Enable fetching
      rerender({ enabled: true });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(1);
      });

      expect(result.current.stats).toEqual(mockStats);
    });
  });
});

describe("useClaimNext", () => {
  const mockPost = vi.mocked(httpClient.post);

  const mockClaimedItem: WorklistItem = {
    review_id: "review-claimed",
    transaction_id: "txn-claimed",
    status: "IN_REVIEW",
    priority: 1,
    card_id: "card-claimed",
    card_last4: "9999",
    transaction_amount: 750.0,
    transaction_currency: "USD",
    transaction_timestamp: "2024-01-15T12:00:00Z",
    decision: "APPROVE",
    decision_reason: "NORMAL",
    decision_score: 90.0,
    risk_level: "HIGH",
    assigned_analyst_id: "analyst-current",
    assigned_at: "2024-01-15T12:05:00Z",
    case_id: null,
    case_number: null,
    first_reviewed_at: null,
    last_activity_at: "2024-01-15T12:05:00Z",
    created_at: "2024-01-15T11:00:00Z",
    merchant_id: "merchant-3",
    merchant_category_code: "5812",
    trace_id: "trace-claimed",
    time_in_queue_seconds: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("claimNext", () => {
    it("should claim next item with empty request", async () => {
      // Ensure the mock resolves asynchronously so the intermediate "isClaiming" state is observable
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockClaimedItem), 10))
      );

      const { result } = renderHook(() => useClaimNext());

      expect(result.current.isClaiming).toBe(false);

      const claimPromise = result.current.claimNext();

      // Wait for claim to complete
      const claimedItem = await claimPromise;

      await waitFor(() => {
        expect(result.current.isClaiming).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith(WORKLIST.CLAIM, {});
      expect(claimedItem).toEqual(mockClaimedItem);
    });

    it("should claim next item with priority filter", async () => {
      mockPost.mockResolvedValue(mockClaimedItem);

      const { result } = renderHook(() => useClaimNext());

      const request: ClaimNextRequest = { priority_filter: 1 };
      let claimedItem: any;
      await act(async () => {
        claimedItem = await result.current.claimNext(request);
      });

      expect(mockPost).toHaveBeenCalledWith(WORKLIST.CLAIM, request);
      expect(claimedItem).toEqual(mockClaimedItem);
    });

    it("should claim next item with risk level filter", async () => {
      mockPost.mockResolvedValue(mockClaimedItem);

      const { result } = renderHook(() => useClaimNext());

      const request: ClaimNextRequest = { risk_level_filter: "HIGH" };
      let claimedItem: any;
      await act(async () => {
        claimedItem = await result.current.claimNext(request);
      });

      expect(mockPost).toHaveBeenCalledWith(WORKLIST.CLAIM, request);
      expect(claimedItem).toEqual(mockClaimedItem);
    });

    it("should claim next item with both filters", async () => {
      mockPost.mockResolvedValue(mockClaimedItem);

      const { result } = renderHook(() => useClaimNext());

      const request: ClaimNextRequest = {
        priority_filter: 1,
        risk_level_filter: "CRITICAL",
      };
      let claimedItem: any;
      await act(async () => {
        claimedItem = await result.current.claimNext(request);
      });

      expect(mockPost).toHaveBeenCalledWith(WORKLIST.CLAIM, request);
      expect(claimedItem).toEqual(mockClaimedItem);
    });

    it("should return null when claim fails", async () => {
      mockPost.mockRejectedValue(new Error("No items available"));

      const { result } = renderHook(() => useClaimNext());

      let claimedItem: any;
      await act(async () => {
        claimedItem = await result.current.claimNext();
      });

      expect(claimedItem).toBeNull();
      await waitFor(() => {
        expect(result.current.isClaiming).toBe(false);
      });
    });

    it("should set isClaiming to false even if claim fails", async () => {
      mockPost.mockRejectedValue(new Error("Claim failed"));

      const { result } = renderHook(() => useClaimNext());

      expect(result.current.isClaiming).toBe(false);

      let claimResult: any;
      await act(async () => {
        claimResult = await result.current.claimNext();
      });

      // Should return null on error
      expect(claimResult).toBeNull();
      // State should be reset after completion
      expect(result.current.isClaiming).toBe(false);
    });

    it("should handle multiple sequential claims", async () => {
      mockPost.mockResolvedValue(mockClaimedItem);

      const { result } = renderHook(() => useClaimNext());

      await act(async () => {
        await result.current.claimNext({ priority_filter: 1 });
      });
      await act(async () => {
        await result.current.claimNext({ priority_filter: 2 });
      });
      await act(async () => {
        await result.current.claimNext({ risk_level_filter: "HIGH" });
      });

      expect(mockPost).toHaveBeenCalledTimes(3);
      expect(result.current.isClaiming).toBe(false);
    });

    it("should handle null response from backend", async () => {
      mockPost.mockResolvedValue(null);

      const { result } = renderHook(() => useClaimNext());

      let claimedItem: any;
      await act(async () => {
        claimedItem = await result.current.claimNext();
      });

      expect(claimedItem).toBeNull();
      expect(result.current.isClaiming).toBe(false);
    });
  });
});
