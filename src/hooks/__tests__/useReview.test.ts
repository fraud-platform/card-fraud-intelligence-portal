import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useReview } from "../useReview";
import * as httpClient from "@/api/httpClient";
import { REVIEW } from "@/api/endpoints";
import type {
  TransactionReview,
  StatusUpdateRequest,
  AssignRequest,
  ResolveRequest,
  EscalateRequest,
} from "@/types/review";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe("useReview", () => {
  const mockGet = vi.mocked(httpClient.get);
  const mockPost = vi.mocked(httpClient.post);
  const mockPatch = vi.mocked(httpClient.patch);

  const mockTransactionId = "txn-123";

  const mockReview: TransactionReview = {
    id: "review-1",
    transaction_id: mockTransactionId,
    status: "IN_REVIEW",
    risk_level: "HIGH",
    priority: 1,
    assigned_analyst_id: "analyst-1",
    assigned_analyst_name: "John Doe",
    assigned_at: "2024-01-15T10:00:00Z",
    first_reviewed_at: "2024-01-15T10:05:00Z",
    resolved_at: null,
    resolved_by: null,
    resolution_code: null,
    resolution_notes: null,
    analyst_decision: null,
    analyst_decision_reason: null,
    case_id: null,
    escalated_at: null,
    escalated_to: null,
    escalation_reason: null,
    last_activity_at: "2024-01-15T10:05:00Z",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T10:05:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "setImmediate",
        "clearImmediate",
        "Date",
      ],
    });
  });

  describe("fetchReview", () => {
    it("should fetch and set review state on mount", async () => {
      mockGet.mockResolvedValue(mockReview);

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.review).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(REVIEW.GET(mockTransactionId), expect.any(Object));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.review).toEqual(mockReview);
      expect(result.current.error).toBeNull();
    });

    it("should handle review not found gracefully", async () => {
      const error = new Error("Review not found");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.review).toBeNull();
      expect(result.current.error).toEqual(error);
    });

    it("should not fetch when enabled is false", async () => {
      const { result } = renderHook(() =>
        useReview({ transactionId: mockTransactionId, enabled: false })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.review).toBeNull();
    });

    it("should not fetch when transactionId is empty", async () => {
      const { result } = renderHook(() => useReview({ transactionId: "" }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.review).toBeNull();
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network error");
      mockGet.mockRejectedValue(networkError);

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(networkError);
      expect(result.current.review).toBeNull();
    });

    it("should handle non-Error exceptions", async () => {
      mockGet.mockRejectedValue("string error");

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Failed to fetch review");
      expect(result.current.review).toBeNull();
    });
  });

  describe("refetch", () => {
    it("should refetch review data when called", async () => {
      mockGet.mockResolvedValue(mockReview);

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Call refetch wrapped in act
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should update review state after refetch", async () => {
      const updatedReview: TransactionReview = {
        ...mockReview,
        status: "RESOLVED",
        resolution_code: "FRAUD_CONFIRMED",
      };

      mockGet.mockResolvedValueOnce(mockReview).mockResolvedValueOnce(updatedReview);

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.review?.status).toBe("IN_REVIEW");
      });

      // Call refetch wrapped in act
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.review?.status).toBe("RESOLVED");
      });
    });
  });

  describe("updateStatus", () => {
    it("should call API and refetch after updating status", async () => {
      const statusRequest: StatusUpdateRequest = {
        status: "RESOLVED",
        notes: "Review completed",
      };

      mockGet.mockResolvedValue(mockReview);
      // Add a small delay to ensure isUpdating state can be observed
      mockPatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 50))
      );

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isUpdating).toBe(false);

      // Call updateStatus wrapped in act
      await act(async () => {
        await result.current.updateStatus(statusRequest);
      });

      expect(mockPatch).toHaveBeenCalledWith(REVIEW.STATUS(mockTransactionId), statusRequest);
      // Initial fetch + refetch after update
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should set isUpdating to false even if update fails", async () => {
      const statusRequest: StatusUpdateRequest = {
        status: "RESOLVED",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPatch.mockRejectedValue(new Error("Update failed"));

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call updateStatus wrapped in act
      await act(async () => {
        await result.current.updateStatus(statusRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("assign", () => {
    it("should call API and refetch after assigning", async () => {
      const assignRequest: AssignRequest = {
        analyst_id: "analyst-2",
        analyst_name: "Jane Smith",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPatch.mockResolvedValue({});

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call assign wrapped in act
      await act(async () => {
        await result.current.assign(assignRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockPatch).toHaveBeenCalledWith(REVIEW.ASSIGN(mockTransactionId), assignRequest);
      // Initial fetch + refetch after assign
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle assign errors correctly", async () => {
      const assignRequest: AssignRequest = {
        analyst_id: "analyst-2",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPatch.mockRejectedValue(new Error("Assign failed"));

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.assign(assignRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("resolve", () => {
    it("should call API and refetch after resolving", async () => {
      const resolveRequest: ResolveRequest = {
        resolution_code: "FRAUD_CONFIRMED",
        resolution_notes: "Confirmed fraud based on investigation",
        analyst_decision: "DECLINE",
        analyst_decision_reason: "Clear fraud indicators",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call resolve wrapped in act
      await act(async () => {
        await result.current.resolve(resolveRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith(REVIEW.RESOLVE(mockTransactionId), resolveRequest);
      // Initial fetch + refetch after resolve
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle resolve with minimal request data", async () => {
      const resolveRequest: ResolveRequest = {
        resolution_code: "FALSE_POSITIVE",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resolve(resolveRequest);
      });

      expect(mockPost).toHaveBeenCalledWith(REVIEW.RESOLVE(mockTransactionId), resolveRequest);
    });

    it("should handle resolve errors correctly", async () => {
      const resolveRequest: ResolveRequest = {
        resolution_code: "FRAUD_CONFIRMED",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPost.mockRejectedValue(new Error("Resolve failed"));

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resolve(resolveRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("escalate", () => {
    it("should call API and refetch after escalating", async () => {
      const escalateRequest: EscalateRequest = {
        escalation_reason: "Requires senior analyst review",
        escalate_to: "senior-analyst-1",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.escalate(escalateRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith(REVIEW.ESCALATE(mockTransactionId), escalateRequest);
      // Initial fetch + refetch after escalate
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle escalate with minimal request data", async () => {
      const escalateRequest: EscalateRequest = {
        escalation_reason: "Complex case",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.escalate(escalateRequest);
      });

      expect(mockPost).toHaveBeenCalledWith(REVIEW.ESCALATE(mockTransactionId), escalateRequest);
    });

    it("should handle escalate errors correctly", async () => {
      const escalateRequest: EscalateRequest = {
        escalation_reason: "Complex case",
      };

      mockGet.mockResolvedValue(mockReview);
      mockPost.mockRejectedValue(new Error("Escalate failed"));

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.escalate(escalateRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple mutations in sequence", async () => {
      mockGet.mockResolvedValue(mockReview);
      mockPatch.mockResolvedValue({});
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform multiple operations wrapped in act
      await act(async () => {
        await result.current.assign({ analyst_id: "analyst-1" });
      });
      await act(async () => {
        await result.current.updateStatus({ status: "IN_REVIEW" });
      });
      await act(async () => {
        await result.current.escalate({ escalation_reason: "Test" });
      });

      // Should have called fetch 4 times: initial + after each mutation
      expect(mockGet).toHaveBeenCalledTimes(4);
    });

    it("should track isUpdating state correctly across operations", async () => {
      mockGet.mockResolvedValue(mockReview);
      mockPost.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useReview({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isUpdating).toBe(false);

      // Start the resolve operation
      let resolvePromise: Promise<void>;
      await act(async () => {
        resolvePromise = result.current.resolve({
          resolution_code: "FRAUD_CONFIRMED",
        });
      });

      // Immediately after act, isUpdating should be true
      expect(result.current.isUpdating).toBe(true);

      // Wait for the operation to complete
      await act(async () => {
        await resolvePromise!;
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("transactionId changes", () => {
    it("should refetch when transactionId changes", async () => {
      const txn1 = "txn-1";
      const txn2 = "txn-2";

      const review1: TransactionReview = {
        ...mockReview,
        transaction_id: txn1,
      };
      const review2: TransactionReview = {
        ...mockReview,
        transaction_id: txn2,
      };

      mockGet.mockImplementation((url) => {
        if (url.includes(txn1)) return Promise.resolve(review1);
        if (url.includes(txn2)) return Promise.resolve(review2);
        return Promise.reject(new Error("Unknown transaction"));
      });

      const { result, rerender } = renderHook(({ transactionId }) => useReview({ transactionId }), {
        initialProps: { transactionId: txn1 },
      });

      await waitFor(() => {
        expect(result.current.review?.transaction_id).toBe(txn1);
      });

      // Change transactionId
      rerender({ transactionId: txn2 });

      await waitFor(() => {
        expect(result.current.review?.transaction_id).toBe(txn2);
      });

      expect(mockGet).toHaveBeenCalledWith(REVIEW.GET(txn1), expect.any(Object));
      expect(mockGet).toHaveBeenCalledWith(REVIEW.GET(txn2), expect.any(Object));
    });

    it("should refetch when enabled changes from false to true", async () => {
      mockGet.mockResolvedValue(mockReview);

      const { result, rerender } = renderHook(
        ({ enabled }) => useReview({ transactionId: mockTransactionId, enabled }),
        { initialProps: { enabled: false } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();

      // Enable fetching
      rerender({ enabled: true });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(result.current.review).toEqual(mockReview);
      });
    });
  });
});
