/**
 * Unit tests for useBulkOperations hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useBulkOperations } from "../useBulkOperations";
import * as httpClient from "@/api/httpClient";
import { BULK } from "@/api/endpoints";
import type {
  BulkAssignRequest,
  BulkStatusUpdateRequest,
  BulkCreateCaseRequest,
  BulkOperationResponse,
} from "@/types/bulk";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe("useBulkOperations", () => {
  const mockPost = vi.mocked(httpClient.post);

  const mockTransactionIds = ["txn-1", "txn-2", "txn-3"];

  const mockBulkAssignRequest: BulkAssignRequest = {
    transaction_ids: mockTransactionIds,
    analyst_id: "analyst-123",
  };

  const mockBulkStatusUpdateRequest: BulkStatusUpdateRequest = {
    transaction_ids: mockTransactionIds,
    status: "RESOLVED",
    resolution_code: "FRAUD_CONFIRMED",
    resolution_notes: "Confirmed fraud after investigation",
  };

  const mockBulkCreateCaseRequest: BulkCreateCaseRequest = {
    transaction_ids: mockTransactionIds,
    case_type: "FRAUD_INVESTIGATION",
    title: "Suspicious transaction pattern",
    description: "Multiple transactions from same IP within short time",
    assigned_analyst_id: "analyst-123",
    risk_level: "HIGH",
  };

  const mockBulkOperationResponse: BulkOperationResponse = {
    success_count: 3,
    failure_count: 0,
    results: [
      {
        transaction_id: "txn-1",
        success: true,
        error_message: null,
        error_code: null,
      },
      {
        transaction_id: "txn-2",
        success: true,
        error_message: null,
        error_code: null,
      },
      {
        transaction_id: "txn-3",
        success: true,
        error_message: null,
        error_code: null,
      },
    ],
  };

  const mockBulkOperationResponseWithCase: BulkOperationResponse = {
    success_count: 3,
    failure_count: 0,
    results: [
      {
        transaction_id: "txn-1",
        success: true,
        error_message: null,
        error_code: null,
      },
      {
        transaction_id: "txn-2",
        success: true,
        error_message: null,
        error_code: null,
      },
      {
        transaction_id: "txn-3",
        success: true,
        error_message: null,
        error_code: null,
      },
    ],
    case_id: "case-456",
  };

  const mockPartialFailureResponse: BulkOperationResponse = {
    success_count: 2,
    failure_count: 1,
    results: [
      {
        transaction_id: "txn-1",
        success: true,
        error_message: null,
        error_code: null,
      },
      {
        transaction_id: "txn-2",
        success: false,
        error_message: "Transaction already assigned",
        error_code: "ALREADY_ASSIGNED",
      },
      {
        transaction_id: "txn-3",
        success: true,
        error_message: null,
        error_code: null,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initial state", () => {
    it("should initialize with all loading states set to false", () => {
      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.isAssigning).toBe(false);
      expect(result.current.isUpdatingStatus).toBe(false);
      expect(result.current.isCreatingCase).toBe(false);
    });

    it("should provide all mutation functions", () => {
      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.bulkAssign).toBeDefined();
      expect(typeof result.current.bulkAssign).toBe("function");

      expect(result.current.bulkUpdateStatus).toBeDefined();
      expect(typeof result.current.bulkUpdateStatus).toBe("function");

      expect(result.current.bulkCreateCase).toBeDefined();
      expect(typeof result.current.bulkCreateCase).toBe("function");
    });
  });

  describe("bulkAssign", () => {
    it("should call the correct API endpoint with request data", async () => {
      mockPost.mockResolvedValue(mockBulkOperationResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkAssign(mockBulkAssignRequest);
      });

      expect(mockPost).toHaveBeenCalledWith(BULK.ASSIGN, mockBulkAssignRequest);
      expect(response).toEqual(mockBulkOperationResponse);
    });

    it("should set isAssigning to true during operation", async () => {
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockBulkOperationResponse), 50))
      );

      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.isAssigning).toBe(false);

      let promise: Promise<BulkOperationResponse>;
      await act(async () => {
        promise = result.current.bulkAssign(mockBulkAssignRequest);
      });

      // Wait for isAssigning to be set to true
      await waitFor(() => {
        expect(result.current.isAssigning).toBe(true);
      });

      await promise!;

      // Verify isAssigning is reset to false
      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });
    });

    it("should return successful response with all transactions assigned", async () => {
      mockPost.mockResolvedValue(mockBulkOperationResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkAssign(mockBulkAssignRequest);
      });

      expect(response.success_count).toBe(3);
      expect(response.failure_count).toBe(0);
      expect(response.results).toHaveLength(3);
      expect(response.results.every((r) => r.success)).toBe(true);
    });

    it("should handle partial failures in bulk assign", async () => {
      mockPost.mockResolvedValue(mockPartialFailureResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkAssign(mockBulkAssignRequest);
      });

      expect(response.success_count).toBe(2);
      expect(response.failure_count).toBe(1);
      expect(response.results[1].success).toBe(false);
      expect(response.results[1].error_message).toBe("Transaction already assigned");
      expect(response.results[1].error_code).toBe("ALREADY_ASSIGNED");
    });

    it("should set isAssigning to false even if request fails", async () => {
      const error = new Error("Network error");
      mockPost.mockRejectedValue(error);

      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.isAssigning).toBe(false);

      await act(async () => {
        await expect(result.current.bulkAssign(mockBulkAssignRequest)).rejects.toThrow(
          "Network error"
        );
      });

      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });
    });

    it("should handle API error responses correctly", async () => {
      const error = new Error("Analyst not found");
      mockPost.mockRejectedValue(error);

      const { result } = renderHook(() => useBulkOperations());

      await act(async () => {
        await expect(result.current.bulkAssign(mockBulkAssignRequest)).rejects.toThrow(
          "Analyst not found"
        );
      });

      expect(mockPost).toHaveBeenCalledWith(BULK.ASSIGN, mockBulkAssignRequest);
    });

    it("should handle empty transaction IDs array", async () => {
      const emptyRequest: BulkAssignRequest = {
        transaction_ids: [],
        analyst_id: "analyst-123",
      };

      const emptyResponse: BulkOperationResponse = {
        success_count: 0,
        failure_count: 0,
        results: [],
      };

      mockPost.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkAssign(emptyRequest);
      });

      expect(response.success_count).toBe(0);
      expect(response.results).toHaveLength(0);
      expect(mockPost).toHaveBeenCalledWith(BULK.ASSIGN, emptyRequest);
    });
  });

  describe("bulkUpdateStatus", () => {
    it("should call the correct API endpoint with request data", async () => {
      mockPost.mockResolvedValue(mockBulkOperationResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest);
      });

      expect(mockPost).toHaveBeenCalledWith(BULK.STATUS, mockBulkStatusUpdateRequest);
      expect(response).toEqual(mockBulkOperationResponse);
    });

    it("should set isUpdatingStatus to true during operation", async () => {
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockBulkOperationResponse), 50))
      );

      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.isUpdatingStatus).toBe(false);

      let promise: Promise<BulkOperationResponse>;
      await act(async () => {
        promise = result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest);
      });

      // Wait for isUpdatingStatus to be set to true
      await waitFor(() => {
        expect(result.current.isUpdatingStatus).toBe(true);
      });

      await promise!;

      // Verify isUpdatingStatus is reset to false
      await waitFor(() => {
        expect(result.current.isUpdatingStatus).toBe(false);
      });
    });

    it("should return successful response with all statuses updated", async () => {
      mockPost.mockResolvedValue(mockBulkOperationResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest);
      });

      expect(response.success_count).toBe(3);
      expect(response.failure_count).toBe(0);
      expect(response.results).toHaveLength(3);
      expect(response.results.every((r) => r.success)).toBe(true);
    });

    it("should handle partial failures in bulk status update", async () => {
      mockPost.mockResolvedValue(mockPartialFailureResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest);
      });

      expect(response.success_count).toBe(2);
      expect(response.failure_count).toBe(1);
      expect(response.results[1].success).toBe(false);
      expect(response.results[1].error_message).toBe("Transaction already assigned");
      expect(response.results[1].error_code).toBe("ALREADY_ASSIGNED");
    });

    it("should set isUpdatingStatus to false even if request fails", async () => {
      const error = new Error("Network error");
      mockPost.mockRejectedValue(error);

      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.isUpdatingStatus).toBe(false);

      await act(async () => {
        await expect(result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest)).rejects.toThrow(
          "Network error"
        );
      });

      await waitFor(() => {
        expect(result.current.isUpdatingStatus).toBe(false);
      });
    });

    it("should handle status update with minimal request data", async () => {
      const minimalRequest: BulkStatusUpdateRequest = {
        transaction_ids: mockTransactionIds,
        status: "IN_REVIEW",
      };

      mockPost.mockResolvedValue(mockBulkOperationResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkUpdateStatus(minimalRequest);
      });

      expect(response.success_count).toBe(3);
      expect(mockPost).toHaveBeenCalledWith(BULK.STATUS, minimalRequest);
    });

    it("should handle different status types", async () => {
      const statusTypes: Array<BulkStatusUpdateRequest["status"]> = [
        "IN_REVIEW",
        "RESOLVED",
        "PENDING_ESCALATION",
        "ESCALATED",
      ];

      for (const status of statusTypes) {
        const request: BulkStatusUpdateRequest = {
          transaction_ids: mockTransactionIds,
          status,
        };

        mockPost.mockResolvedValue(mockBulkOperationResponse);

        const { result } = renderHook(() => useBulkOperations());

        let response: BulkOperationResponse;
        await act(async () => {
          response = await result.current.bulkUpdateStatus(request);
        });

        expect(response.success_count).toBe(3);
        expect(mockPost).toHaveBeenCalledWith(BULK.STATUS, request);
      }
    });

    it("should handle empty transaction IDs array", async () => {
      const emptyRequest: BulkStatusUpdateRequest = {
        transaction_ids: [],
        status: "RESOLVED",
      };

      const emptyResponse: BulkOperationResponse = {
        success_count: 0,
        failure_count: 0,
        results: [],
      };

      mockPost.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkUpdateStatus(emptyRequest);
      });

      expect(response.success_count).toBe(0);
      expect(response.results).toHaveLength(0);
      expect(mockPost).toHaveBeenCalledWith(BULK.STATUS, emptyRequest);
    });
  });

  describe("bulkCreateCase", () => {
    it("should call the correct API endpoint with request data", async () => {
      mockPost.mockResolvedValue(mockBulkOperationResponseWithCase);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkCreateCase(mockBulkCreateCaseRequest);
      });

      expect(mockPost).toHaveBeenCalledWith(BULK.CREATE_CASE, mockBulkCreateCaseRequest);
      expect(response).toEqual(mockBulkOperationResponseWithCase);
    });

    it("should set isCreatingCase to true during operation", async () => {
      mockPost.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockBulkOperationResponseWithCase), 50))
      );

      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.isCreatingCase).toBe(false);

      let promise: Promise<BulkOperationResponse>;
      await act(async () => {
        promise = result.current.bulkCreateCase(mockBulkCreateCaseRequest);
      });

      // Wait for isCreatingCase to be set to true
      await waitFor(() => {
        expect(result.current.isCreatingCase).toBe(true);
      });

      await promise!;

      // Verify isCreatingCase is reset to false
      await waitFor(() => {
        expect(result.current.isCreatingCase).toBe(false);
      });
    });

    it("should return successful response with case_id", async () => {
      mockPost.mockResolvedValue(mockBulkOperationResponseWithCase);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkCreateCase(mockBulkCreateCaseRequest);
      });

      expect(response.success_count).toBe(3);
      expect(response.failure_count).toBe(0);
      expect(response.results).toHaveLength(3);
      expect(response.case_id).toBe("case-456");
      expect(response.results.every((r) => r.success)).toBe(true);
    });

    it("should handle partial failures in bulk case creation", async () => {
      mockPost.mockResolvedValue(mockPartialFailureResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkCreateCase(mockBulkCreateCaseRequest);
      });

      expect(response.success_count).toBe(2);
      expect(response.failure_count).toBe(1);
      expect(response.results[1].success).toBe(false);
      expect(response.results[1].error_message).toBe("Transaction already assigned");
      expect(response.results[1].error_code).toBe("ALREADY_ASSIGNED");
    });

    it("should set isCreatingCase to false even if request fails", async () => {
      const error = new Error("Network error");
      mockPost.mockRejectedValue(error);

      const { result } = renderHook(() => useBulkOperations());

      expect(result.current.isCreatingCase).toBe(false);

      await act(async () => {
        await expect(result.current.bulkCreateCase(mockBulkCreateCaseRequest)).rejects.toThrow(
          "Network error"
        );
      });

      await waitFor(() => {
        expect(result.current.isCreatingCase).toBe(false);
      });
    });

    it("should handle API error responses correctly", async () => {
      const error = new Error("Invalid case type");
      mockPost.mockRejectedValue(error);

      const { result } = renderHook(() => useBulkOperations());

      await act(async () => {
        await expect(result.current.bulkCreateCase(mockBulkCreateCaseRequest)).rejects.toThrow(
          "Invalid case type"
        );
      });

      expect(mockPost).toHaveBeenCalledWith(BULK.CREATE_CASE, mockBulkCreateCaseRequest);
    });

    it("should handle case creation with minimal request data", async () => {
      const minimalRequest: BulkCreateCaseRequest = {
        transaction_ids: mockTransactionIds,
        case_type: "FRAUD_INVESTIGATION",
        title: "Test case",
      };

      const minimalResponse: BulkOperationResponse = {
        success_count: 3,
        failure_count: 0,
        results: mockBulkOperationResponse.results,
        case_id: "case-789",
      };

      mockPost.mockResolvedValue(minimalResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkCreateCase(minimalRequest);
      });

      expect(response.success_count).toBe(3);
      expect(response.case_id).toBe("case-789");
      expect(mockPost).toHaveBeenCalledWith(BULK.CREATE_CASE, minimalRequest);
    });

    it("should handle different case types", async () => {
      const caseTypes: Array<BulkCreateCaseRequest["case_type"]> = [
        "FRAUD_INVESTIGATION",
        "COMPLIANCE_REVIEW",
        "CUSTOMER_DISPUTE",
        "CHARGEBACK_MANAGEMENT",
      ];

      for (const caseType of caseTypes) {
        const request: BulkCreateCaseRequest = {
          transaction_ids: mockTransactionIds,
          case_type: caseType,
          title: `Test ${caseType} case`,
        };

        const response: BulkOperationResponse = {
          ...mockBulkOperationResponseWithCase,
          case_id: `case-${caseType}`,
        };

        mockPost.mockResolvedValue(response);

        const { result } = renderHook(() => useBulkOperations());

        let resultResponse: BulkOperationResponse;
        await act(async () => {
          resultResponse = await result.current.bulkCreateCase(request);
        });

        expect(resultResponse.success_count).toBe(3);
        expect(resultResponse.case_id).toBe(`case-${caseType}`);
        expect(mockPost).toHaveBeenCalledWith(BULK.CREATE_CASE, request);
      }
    });

    it("should handle empty transaction IDs array", async () => {
      const emptyRequest: BulkCreateCaseRequest = {
        transaction_ids: [],
        case_type: "FRAUD_INVESTIGATION",
        title: "Test case",
      };

      const emptyResponse: BulkOperationResponse = {
        success_count: 0,
        failure_count: 0,
        results: [],
        case_id: null,
      };

      mockPost.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkCreateCase(emptyRequest);
      });

      expect(response.success_count).toBe(0);
      expect(response.results).toHaveLength(0);
      expect(response.case_id).toBeNull();
      expect(mockPost).toHaveBeenCalledWith(BULK.CREATE_CASE, emptyRequest);
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple operations in sequence", async () => {
      mockPost.mockResolvedValue(mockBulkOperationResponse);

      const { result } = renderHook(() => useBulkOperations());

      // Perform multiple operations in sequence
      await act(async () => {
        await result.current.bulkAssign(mockBulkAssignRequest);
      });
      await act(async () => {
        await result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest);
      });
      await act(async () => {
        await result.current.bulkCreateCase(mockBulkCreateCaseRequest);
      });

      expect(mockPost).toHaveBeenCalledTimes(3);
      expect(mockPost).toHaveBeenCalledWith(BULK.ASSIGN, mockBulkAssignRequest);
      expect(mockPost).toHaveBeenCalledWith(BULK.STATUS, mockBulkStatusUpdateRequest);
      expect(mockPost).toHaveBeenCalledWith(BULK.CREATE_CASE, mockBulkCreateCaseRequest);
    });

    it("should track loading states independently for each operation", async () => {
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockBulkOperationResponse), 100))
      );

      const { result } = renderHook(() => useBulkOperations());

      // Start all operations
      let assignPromise: Promise<BulkOperationResponse>;
      let statusPromise: Promise<BulkOperationResponse>;
      let casePromise: Promise<BulkOperationResponse>;

      await act(async () => {
        assignPromise = result.current.bulkAssign(mockBulkAssignRequest);
        statusPromise = result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest);
        casePromise = result.current.bulkCreateCase(mockBulkCreateCaseRequest);
      });

      // All should be loading
      await waitFor(() => {
        expect(result.current.isAssigning).toBe(true);
        expect(result.current.isUpdatingStatus).toBe(true);
        expect(result.current.isCreatingCase).toBe(true);
      });

      // Wait for all to complete
      await act(async () => {
        await Promise.all([assignPromise!, statusPromise!, casePromise!]);
      });

      // All should be done loading
      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
        expect(result.current.isUpdatingStatus).toBe(false);
        expect(result.current.isCreatingCase).toBe(false);
      });
    });

    it("should handle partial failures across operations", async () => {
      mockPost
        .mockResolvedValueOnce(mockBulkOperationResponse)
        .mockRejectedValueOnce(new Error("Status update failed"))
        .mockResolvedValueOnce(mockBulkOperationResponseWithCase);

      const { result } = renderHook(() => useBulkOperations());

      // First operation succeeds
      let assignResponse: BulkOperationResponse;
      await act(async () => {
        assignResponse = await result.current.bulkAssign(mockBulkAssignRequest);
      });
      expect(assignResponse.success_count).toBe(3);

      // Second operation fails
      await act(async () => {
        await expect(result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest)).rejects.toThrow(
          "Status update failed"
        );
      });

      // Third operation succeeds
      let caseResponse: BulkOperationResponse;
      await act(async () => {
        caseResponse = await result.current.bulkCreateCase(mockBulkCreateCaseRequest);
      });
      expect(caseResponse.success_count).toBe(3);
      expect(caseResponse.case_id).toBe("case-456");
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      const networkError = new Error("Network request failed");
      mockPost.mockRejectedValue(networkError);

      const { result } = renderHook(() => useBulkOperations());

      await act(async () => {
        await expect(result.current.bulkAssign(mockBulkAssignRequest)).rejects.toThrow(
          "Network request failed"
        );
      });

      // Ensure loading state is reset
      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockPost.mockRejectedValue(timeoutError);

      const { result } = renderHook(() => useBulkOperations());

      await act(async () => {
        await expect(result.current.bulkUpdateStatus(mockBulkStatusUpdateRequest)).rejects.toThrow(
          "Request timeout"
        );
      });

      await waitFor(() => {
        expect(result.current.isUpdatingStatus).toBe(false);
      });
    });

    it("should handle validation errors", async () => {
      const validationError = new Error("Invalid transaction IDs");
      mockPost.mockRejectedValue(validationError);

      const { result } = renderHook(() => useBulkOperations());

      await act(async () => {
        await expect(result.current.bulkCreateCase(mockBulkCreateCaseRequest)).rejects.toThrow(
          "Invalid transaction IDs"
        );
      });

      await waitFor(() => {
        expect(result.current.isCreatingCase).toBe(false);
      });
    });

    it("should handle non-Error exceptions", async () => {
      mockPost.mockRejectedValue("String error message");

      const { result } = renderHook(() => useBulkOperations());

      await act(async () => {
        await expect(result.current.bulkAssign(mockBulkAssignRequest)).rejects.toThrow(
          "String error message"
        );
      });

      await waitFor(() => {
        expect(result.current.isAssigning).toBe(false);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle single transaction in bulk operations", async () => {
      const singleTxnRequest: BulkAssignRequest = {
        transaction_ids: ["txn-1"],
        analyst_id: "analyst-123",
      };

      const singleResponse: BulkOperationResponse = {
        success_count: 1,
        failure_count: 0,
        results: [
          {
            transaction_id: "txn-1",
            success: true,
            error_message: null,
            error_code: null,
          },
        ],
      };

      mockPost.mockResolvedValue(singleResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkAssign(singleTxnRequest);
      });

      expect(response.success_count).toBe(1);
      expect(response.results).toHaveLength(1);
    });

    it("should handle large transaction ID arrays", async () => {
      const largeTransactionIds = Array.from({ length: 100 }, (_, i) => `txn-${i}`);

      const largeRequest: BulkAssignRequest = {
        transaction_ids: largeTransactionIds,
        analyst_id: "analyst-123",
      };

      const largeResponse: BulkOperationResponse = {
        success_count: 100,
        failure_count: 0,
        results: largeTransactionIds.map((txnId) => ({
          transaction_id: txnId,
          success: true,
          error_message: null,
          error_code: null,
        })),
      };

      mockPost.mockResolvedValue(largeResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkAssign(largeRequest);
      });

      expect(response.success_count).toBe(100);
      expect(response.results).toHaveLength(100);
    });

    it("should handle all transactions failing", async () => {
      const allFailResponse: BulkOperationResponse = {
        success_count: 0,
        failure_count: 3,
        results: [
          {
            transaction_id: "txn-1",
            success: false,
            error_message: "Invalid transaction",
            error_code: "INVALID_TXN",
          },
          {
            transaction_id: "txn-2",
            success: false,
            error_message: "Invalid transaction",
            error_code: "INVALID_TXN",
          },
          {
            transaction_id: "txn-3",
            success: false,
            error_message: "Invalid transaction",
            error_code: "INVALID_TXN",
          },
        ],
      };

      mockPost.mockResolvedValue(allFailResponse);

      const { result } = renderHook(() => useBulkOperations());

      let response: BulkOperationResponse;
      await act(async () => {
        response = await result.current.bulkAssign(mockBulkAssignRequest);
      });

      expect(response.success_count).toBe(0);
      expect(response.failure_count).toBe(3);
      expect(response.results.every((r) => !r.success)).toBe(true);
    });
  });
});
