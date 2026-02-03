/**
 * Unit tests for useCases hooks
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCasesList, useCase, useCaseActivity, useCreateCase } from "../useCases";
import * as httpClient from "@/api/httpClient";
import { CASES } from "@/api/endpoints";
import type {
  TransactionCase,
  CaseCreateRequest,
  CaseUpdateRequest,
  CaseResolveRequest,
  CaseActivity,
  CasesListResponse,
  CaseActivityResponse,
} from "@/types/case";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe("useCasesList", () => {
  const mockGet = vi.mocked(httpClient.get);

  const mockCase1: TransactionCase = {
    id: "case-1",
    case_number: "CASE-001",
    case_type: "FRAUD_RING",
    case_status: "OPEN",
    risk_level: "HIGH",
    title: "Suspected Fraud Ring",
    description: "Multiple suspicious transactions detected",
    total_transaction_count: 5,
    total_transaction_amount: 2500.0,
    assigned_analyst_id: "analyst-1",
    assigned_analyst_name: "John Doe",
    assigned_at: "2024-01-15T10:00:00Z",
    resolved_at: null,
    resolved_by: null,
    resolution_summary: null,
    created_by: "analyst-1",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  const mockCase2: TransactionCase = {
    id: "case-2",
    case_number: "CASE-002",
    case_type: "ACCOUNT_TAKEOVER",
    case_status: "IN_PROGRESS",
    risk_level: "CRITICAL",
    title: "Account Takeover Investigation",
    description: "Unusual login pattern and transaction behavior",
    total_transaction_count: 12,
    total_transaction_amount: 8750.5,
    assigned_analyst_id: "analyst-2",
    assigned_analyst_name: "Jane Smith",
    assigned_at: "2024-01-15T11:00:00Z",
    resolved_at: null,
    resolved_by: null,
    resolution_summary: null,
    created_by: "analyst-2",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T11:30:00Z",
  };

  const mockCasesResponse: CasesListResponse = {
    items: [mockCase1, mockCase2],
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

  describe("fetchCases", () => {
    it("should fetch cases list on mount", async () => {
      mockGet.mockResolvedValue(mockCasesResponse);

      const { result } = renderHook(() => useCasesList());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.cases).toEqual([]);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedUrl = expect.stringContaining(`${CASES.LIST}?`);
      expect(mockGet).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.cases).toEqual([mockCase1, mockCase2]);
      expect(result.current.total).toBe(2);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.nextCursor).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("should fetch cases with filters", async () => {
      mockGet.mockResolvedValue(mockCasesResponse);

      const filters = {
        case_status: "OPEN",
        case_type: "FRAUD_RING",
        assigned_analyst_id: "analyst-1",
        risk_level: "HIGH",
      };

      const { result } = renderHook(() => useCasesList({ filters }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedUrl = expect.stringContaining("?");
      expect(mockGet).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(result.current.cases).toEqual([mockCase1, mockCase2]);
    });

    it("should handle pagination with cursor", async () => {
      const paginatedResponse: CasesListResponse = {
        items: [mockCase1],
        total: 20,
        page_size: 50,
        has_more: true,
        next_cursor: "cursor-abc",
      };

      mockGet.mockResolvedValue(paginatedResponse);

      const { result } = renderHook(() =>
        useCasesList({
          limit: 50,
          cursor: "cursor-abc",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cases).toEqual([mockCase1]);
      expect(result.current.total).toBe(20);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.nextCursor).toBe("cursor-abc");
    });

    it("should handle empty cases list", async () => {
      const emptyResponse: CasesListResponse = {
        items: [],
        total: 0,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useCasesList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cases).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it("should handle response with missing optional fields", async () => {
      const partialResponse = {
        items: [mockCase1],
        total: 1,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValue(partialResponse);

      const { result } = renderHook(() => useCasesList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cases).toEqual([mockCase1]);
      expect(result.current.nextCursor).toBeNull();
    });

    it("should not fetch when enabled is false", async () => {
      const { result } = renderHook(() => useCasesList({ enabled: false }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.cases).toEqual([]);
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Failed to fetch cases");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useCasesList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.cases).toEqual([]);
    });

    it("should handle non-Error exceptions", async () => {
      mockGet.mockRejectedValue("string error");

      const { result } = renderHook(() => useCasesList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Failed to fetch cases");
      expect(result.current.cases).toEqual([]);
    });
  });

  describe("refetch", () => {
    it("should refetch cases when called", async () => {
      mockGet.mockResolvedValue(mockCasesResponse);

      const { result } = renderHook(() => useCasesList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Call refetch
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should update cases after refetch", async () => {
      const updatedResponse: CasesListResponse = {
        items: [mockCase1, mockCase2, { ...mockCase1, id: "case-3" }],
        total: 3,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValueOnce(mockCasesResponse).mockResolvedValueOnce(updatedResponse);

      const { result } = renderHook(() => useCasesList());

      await waitFor(() => {
        expect(result.current.cases.length).toBe(2);
      });

      // Call refetch
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.cases.length).toBe(3);
        expect(result.current.total).toBe(3);
      });
    });
  });

  describe("filter changes", () => {
    it("should refetch when filters change", async () => {
      mockGet.mockResolvedValue(mockCasesResponse);

      const { result, rerender } = renderHook(({ filters }) => useCasesList({ filters }), {
        initialProps: { filters: { case_status: "OPEN" } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Change filters
      rerender({ filters: { case_status: "IN_PROGRESS" } });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should refetch when enabled changes from false to true", async () => {
      mockGet.mockResolvedValue(mockCasesResponse);

      const { result, rerender } = renderHook(({ enabled }) => useCasesList({ enabled }), {
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

      // Wait for the results to be populated
      await waitFor(() => {
        expect(result.current.cases).toEqual([mockCase1, mockCase2]);
      });
    });
  });
});

describe("useCase", () => {
  const mockGet = vi.mocked(httpClient.get);
  const mockPatch = vi.mocked(httpClient.patch);
  const mockPost = vi.mocked(httpClient.post);
  const mockDel = vi.mocked(httpClient.del);

  const caseId = "case-123";

  const mockCase: TransactionCase = {
    id: caseId,
    case_number: "CASE-123",
    case_type: "INVESTIGATION",
    case_status: "OPEN",
    risk_level: "MEDIUM",
    title: "Test Investigation",
    description: "Test case description",
    total_transaction_count: 3,
    total_transaction_amount: 1500.0,
    assigned_analyst_id: "analyst-1",
    assigned_analyst_name: "John Doe",
    assigned_at: "2024-01-15T10:00:00Z",
    resolved_at: null,
    resolved_by: null,
    resolution_summary: null,
    created_by: "analyst-1",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchCase", () => {
    it("should fetch case on mount", async () => {
      mockGet.mockResolvedValue(mockCase);

      const { result } = renderHook(() => useCase({ caseId }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.case_).toBeNull();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(CASES.GET(caseId), expect.any(Object));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.case_).toEqual(mockCase);
      expect(result.current.error).toBeNull();
    });

    it("should not fetch when enabled is false", async () => {
      const { result } = renderHook(() => useCase({ caseId, enabled: false }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.case_).toBeNull();
    });

    it("should not fetch when caseId is empty", async () => {
      const { result } = renderHook(() => useCase({ caseId: "" }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.case_).toBeNull();
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Failed to fetch case");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.case_).toBeNull();
    });

    it("should handle non-Error exceptions", async () => {
      mockGet.mockRejectedValue("string error");

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Failed to fetch case");
      expect(result.current.case_).toBeNull();
    });
  });

  describe("refetch", () => {
    it("should refetch case when called", async () => {
      mockGet.mockResolvedValue(mockCase);

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Call refetch
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("update", () => {
    it("should update case and refetch", async () => {
      const updateRequest: CaseUpdateRequest = {
        case_status: "IN_PROGRESS",
        title: "Updated Title",
      };

      mockGet.mockResolvedValue(mockCase);
      mockPatch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 50))
      );

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isUpdating).toBe(false);

      // Call update
      await act(async () => {
        await result.current.update(updateRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockPatch).toHaveBeenCalledWith(CASES.UPDATE(caseId), updateRequest);
      // Initial fetch + refetch after update
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle update errors", async () => {
      const updateRequest: CaseUpdateRequest = {
        case_status: "IN_PROGRESS",
      };

      mockGet.mockResolvedValue(mockCase);
      mockPatch.mockRejectedValue(new Error("Update failed"));

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          return result.current.update(updateRequest);
        })
      ).rejects.toThrow("Update failed");

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("resolve", () => {
    it("should resolve case and refetch", async () => {
      const resolveRequest: CaseResolveRequest = {
        resolution_summary: "Case resolved successfully",
        resolved_by: "analyst-1",
      };

      mockGet.mockResolvedValue(mockCase);
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call resolve
      await act(async () => {
        await result.current.resolve(resolveRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith(
        `${CASES.RESOLVE(caseId)}?resolution_summary=Case+resolved+successfully`
      );
      // Initial fetch + refetch after resolve
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle resolve errors", async () => {
      const resolveRequest: CaseResolveRequest = {
        resolution_summary: "Test resolution",
      };

      mockGet.mockResolvedValue(mockCase);
      mockPost.mockRejectedValue(new Error("Resolve failed"));

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          return result.current.resolve(resolveRequest);
        })
      ).rejects.toThrow("Resolve failed");

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("addTransaction", () => {
    it("should add transaction and refetch", async () => {
      const transactionId = "txn-123";

      mockGet.mockResolvedValue(mockCase);
      mockPost.mockResolvedValue({});

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call addTransaction
      await act(async () => {
        await result.current.addTransaction(transactionId);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith(CASES.TRANSACTIONS.ADD(caseId), {
        transaction_id: transactionId,
      });
      // Initial fetch + refetch after add
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle add transaction errors", async () => {
      const transactionId = "txn-123";

      mockGet.mockResolvedValue(mockCase);
      mockPost.mockRejectedValue(new Error("Add failed"));

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          return result.current.addTransaction(transactionId);
        })
      ).rejects.toThrow("Add failed");

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("removeTransaction", () => {
    it("should remove transaction and refetch", async () => {
      const transactionId = "txn-456";

      mockGet.mockResolvedValue(mockCase);
      mockDel.mockResolvedValue({});

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call removeTransaction
      await act(async () => {
        await result.current.removeTransaction(transactionId);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockDel).toHaveBeenCalledWith(CASES.TRANSACTIONS.REMOVE(caseId, transactionId));
      // Initial fetch + refetch after remove
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle remove transaction errors", async () => {
      const transactionId = "txn-456";

      mockGet.mockResolvedValue(mockCase);
      mockDel.mockRejectedValue(new Error("Remove failed"));

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          return result.current.removeTransaction(transactionId);
        })
      ).rejects.toThrow("Remove failed");

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple mutations in sequence", async () => {
      mockGet.mockResolvedValue(mockCase);
      mockPatch.mockResolvedValue({});
      mockPost.mockResolvedValue({});
      mockDel.mockResolvedValue({});

      const { result } = renderHook(() => useCase({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform multiple operations
      await act(async () => {
        await result.current.update({ case_status: "IN_PROGRESS" });
      });
      await act(async () => {
        await result.current.addTransaction("txn-1");
      });
      await act(async () => {
        await result.current.removeTransaction("txn-2");
      });
      await act(async () => {
        await result.current.resolve({ resolution_summary: "Resolved" });
      });

      // Should have called fetch 5 times: initial + after each mutation
      expect(mockGet).toHaveBeenCalledTimes(5);
    });
  });

  describe("caseId changes", () => {
    it("should refetch when caseId changes", async () => {
      const case1Id = "case-1";
      const case2Id = "case-2";

      const case1: TransactionCase = { ...mockCase, id: case1Id };
      const case2: TransactionCase = { ...mockCase, id: case2Id };

      mockGet.mockImplementation((url) => {
        if (url.includes(case1Id)) return Promise.resolve(case1);
        if (url.includes(case2Id)) return Promise.resolve(case2);
        return Promise.reject(new Error("Unknown case"));
      });

      const { result, rerender } = renderHook(({ caseId }) => useCase({ caseId }), {
        initialProps: { caseId: case1Id },
      });

      await waitFor(() => {
        expect(result.current.case_?.id).toBe(case1Id);
      });

      // Change caseId
      rerender({ caseId: case2Id });

      await waitFor(() => {
        expect(result.current.case_?.id).toBe(case2Id);
      });

      expect(mockGet).toHaveBeenCalledWith(CASES.GET(case1Id), expect.any(Object));
      expect(mockGet).toHaveBeenCalledWith(CASES.GET(case2Id), expect.any(Object));
    });
  });
});

describe("useCaseActivity", () => {
  const mockGet = vi.mocked(httpClient.get);

  const caseId = "case-123";

  const mockActivity1: CaseActivity = {
    id: "activity-1",
    case_id: caseId,
    activity_type: "CASE_CREATED",
    activity_description: "Case created",
    activity_data: { initiator: "analyst-1" },
    performed_by: "analyst-1",
    performed_by_name: "John Doe",
    created_at: "2024-01-15T09:00:00Z",
  };

  const mockActivity2: CaseActivity = {
    id: "activity-2",
    case_id: caseId,
    activity_type: "TRANSACTION_ADDED",
    activity_description: "Transaction txn-123 added to case",
    activity_data: { transaction_id: "txn-123" },
    performed_by: "analyst-1",
    performed_by_name: "John Doe",
    created_at: "2024-01-15T09:30:00Z",
  };

  const mockActivityResponse: CaseActivityResponse = {
    items: [mockActivity1, mockActivity2],
    total: 2,
    has_more: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchActivity", () => {
    it("should fetch activity on mount", async () => {
      mockGet.mockResolvedValue(mockActivityResponse);

      const { result } = renderHook(() => useCaseActivity({ caseId }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.activities).toEqual([]);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedUrl = `${CASES.ACTIVITY(caseId)}?limit=50`;
      expect(mockGet).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.activities).toEqual([mockActivity1, mockActivity2]);
      expect(result.current.total).toBe(2);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should fetch activity with custom limit", async () => {
      mockGet.mockResolvedValue(mockActivityResponse);

      const { result } = renderHook(() => useCaseActivity({ caseId, limit: 20 }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedUrl = `${CASES.ACTIVITY(caseId)}?limit=20`;
      expect(mockGet).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
      expect(result.current.activities).toEqual([mockActivity1, mockActivity2]);
    });

    it("should handle empty activity list", async () => {
      const emptyResponse: CaseActivityResponse = {
        items: [],
        total: 0,
        has_more: false,
      };

      mockGet.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useCaseActivity({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activities).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it("should handle response with missing optional fields", async () => {
      const partialResponse = {
        items: [mockActivity1],
        total: 1,
        has_more: false,
      };

      mockGet.mockResolvedValue(partialResponse);

      const { result } = renderHook(() => useCaseActivity({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activities).toEqual([mockActivity1]);
    });

    it("should not fetch when enabled is false", async () => {
      const { result } = renderHook(() => useCaseActivity({ caseId, enabled: false }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.activities).toEqual([]);
    });

    it("should not fetch when caseId is empty", async () => {
      const { result } = renderHook(() => useCaseActivity({ caseId: "" }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.activities).toEqual([]);
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Failed to fetch activity");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useCaseActivity({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.activities).toEqual([]);
    });

    it("should handle non-Error exceptions", async () => {
      mockGet.mockRejectedValue("string error");

      const { result } = renderHook(() => useCaseActivity({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Failed to fetch activity");
      expect(result.current.activities).toEqual([]);
    });
  });

  describe("refetch", () => {
    it("should refetch activity when called", async () => {
      mockGet.mockResolvedValue(mockActivityResponse);

      const { result } = renderHook(() => useCaseActivity({ caseId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Call refetch
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should update activities after refetch", async () => {
      const updatedResponse: CaseActivityResponse = {
        items: [mockActivity1, mockActivity2, { ...mockActivity1, id: "activity-3" }],
        total: 3,
        has_more: false,
      };

      mockGet.mockResolvedValueOnce(mockActivityResponse).mockResolvedValueOnce(updatedResponse);

      const { result } = renderHook(() => useCaseActivity({ caseId }));

      await waitFor(() => {
        expect(result.current.activities.length).toBe(2);
      });

      // Call refetch
      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.activities.length).toBe(3);
        expect(result.current.total).toBe(3);
      });
    });
  });

  describe("caseId changes", () => {
    it("should refetch when caseId changes", async () => {
      const case1Id = "case-1";
      const case2Id = "case-2";

      const activity1: CaseActivity = { ...mockActivity1, case_id: case1Id };
      const activity2: CaseActivity = { ...mockActivity2, case_id: case2Id };

      mockGet.mockImplementation((url) => {
        if (url.includes(case1Id))
          return Promise.resolve({ items: [activity1], total: 1, has_more: false });
        if (url.includes(case2Id))
          return Promise.resolve({ items: [activity2], total: 1, has_more: false });
        return Promise.reject(new Error("Unknown case"));
      });

      const { result, rerender } = renderHook(({ caseId }) => useCaseActivity({ caseId }), {
        initialProps: { caseId: case1Id },
      });

      await waitFor(() => {
        expect(result.current.activities[0]?.case_id).toBe(case1Id);
      });

      // Change caseId
      rerender({ caseId: case2Id });

      await waitFor(() => {
        expect(result.current.activities[0]?.case_id).toBe(case2Id);
      });
    });
  });
});

describe("useCreateCase", () => {
  const mockPost = vi.mocked(httpClient.post);

  const mockCreatedCase: TransactionCase = {
    id: "case-new",
    case_number: "CASE-999",
    case_type: "INVESTIGATION",
    case_status: "OPEN",
    risk_level: "MEDIUM",
    title: "New Case",
    description: "New case description",
    total_transaction_count: 0,
    total_transaction_amount: 0,
    assigned_analyst_id: "analyst-1",
    assigned_analyst_name: "John Doe",
    assigned_at: "2024-01-15T12:00:00Z",
    resolved_at: null,
    resolved_by: null,
    resolution_summary: null,
    created_by: "analyst-1",
    created_at: "2024-01-15T12:00:00Z",
    updated_at: "2024-01-15T12:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createCase", () => {
    it("should create case with minimal data", async () => {
      const createRequest: CaseCreateRequest = {
        case_type: "INVESTIGATION",
        title: "New Case",
      };

      mockPost.mockResolvedValue(mockCreatedCase);

      const { result } = renderHook(() => useCreateCase());

      expect(result.current.isCreating).toBe(false);

      const createdCase = await act(async () => {
        return result.current.createCase(createRequest);
      });

      // State should be reset after completion
      expect(result.current.isCreating).toBe(false);

      expect(mockPost).toHaveBeenCalledWith(CASES.CREATE, createRequest);
      expect(createdCase).toEqual(mockCreatedCase);
    });

    it("should create case with full data", async () => {
      const createRequest: CaseCreateRequest = {
        case_type: "FRAUD_RING",
        title: "Fraud Ring Investigation",
        description: "Suspected fraud ring detected",
        risk_level: "HIGH",
        transaction_ids: ["txn-1", "txn-2", "txn-3"],
        assigned_analyst_id: "analyst-2",
      };

      mockPost.mockResolvedValue(mockCreatedCase);

      const { result } = renderHook(() => useCreateCase());

      const createdCase = await act(async () => {
        return result.current.createCase(createRequest);
      });

      expect(mockPost).toHaveBeenCalledWith(CASES.CREATE, createRequest);
      expect(createdCase).toEqual(mockCreatedCase);
    });

    it("should handle create errors", async () => {
      const createRequest: CaseCreateRequest = {
        case_type: "INVESTIGATION",
        title: "New Case",
      };

      mockPost.mockRejectedValue(new Error("Create failed"));

      const { result } = renderHook(() => useCreateCase());

      await expect(
        act(async () => {
          return result.current.createCase(createRequest);
        })
      ).rejects.toThrow("Create failed");

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });

    it("should set isCreating to false even if creation fails", async () => {
      const createRequest: CaseCreateRequest = {
        case_type: "INVESTIGATION",
        title: "New Case",
      };

      mockPost.mockRejectedValue(new Error("Create failed"));

      const { result } = renderHook(() => useCreateCase());

      expect(result.current.isCreating).toBe(false);

      await expect(
        act(async () => {
          return result.current.createCase(createRequest);
        })
      ).rejects.toThrow("Create failed");

      // State should be reset after error
      expect(result.current.isCreating).toBe(false);
    });

    it("should handle multiple sequential creations", async () => {
      mockPost.mockResolvedValue(mockCreatedCase);

      const { result } = renderHook(() => useCreateCase());

      await act(async () => {
        await result.current.createCase({
          case_type: "INVESTIGATION",
          title: "Case 1",
        });
      });
      await act(async () => {
        await result.current.createCase({
          case_type: "DISPUTE",
          title: "Case 2",
        });
      });
      await act(async () => {
        await result.current.createCase({
          case_type: "FRAUD_RING",
          title: "Case 3",
        });
      });

      expect(mockPost).toHaveBeenCalledTimes(3);
      expect(result.current.isCreating).toBe(false);
    });
  });
});
