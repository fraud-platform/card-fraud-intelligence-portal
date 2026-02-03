/**
 * useBulkOperations Hook
 *
 * Custom hook for bulk operations on transactions.
 */

import { useState, useCallback } from "react";
import { post } from "../api/httpClient";
import { BULK } from "../api/endpoints";
import type {
  BulkAssignRequest,
  BulkStatusUpdateRequest,
  BulkCreateCaseRequest,
  BulkOperationResponse,
} from "../types/bulk";

interface UseBulkOperationsReturn {
  bulkAssign: (request: BulkAssignRequest) => Promise<BulkOperationResponse>;
  bulkUpdateStatus: (request: BulkStatusUpdateRequest) => Promise<BulkOperationResponse>;
  bulkCreateCase: (request: BulkCreateCaseRequest) => Promise<BulkOperationResponse>;
  isAssigning: boolean;
  isUpdatingStatus: boolean;
  isCreatingCase: boolean;
}

/**
 * Hook for bulk operations on transactions
 */
export function useBulkOperations(): UseBulkOperationsReturn {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  const bulkAssign = useCallback(
    async (request: BulkAssignRequest): Promise<BulkOperationResponse> => {
      setIsAssigning(true);
      try {
        return await post<BulkOperationResponse>(BULK.ASSIGN, request);
      } finally {
        setIsAssigning(false);
      }
    },
    []
  );

  const bulkUpdateStatus = useCallback(
    async (request: BulkStatusUpdateRequest): Promise<BulkOperationResponse> => {
      setIsUpdatingStatus(true);
      try {
        return await post<BulkOperationResponse>(BULK.STATUS, request);
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    []
  );

  const bulkCreateCase = useCallback(
    async (request: BulkCreateCaseRequest): Promise<BulkOperationResponse> => {
      setIsCreatingCase(true);
      try {
        return await post<BulkOperationResponse>(BULK.CREATE_CASE, request);
      } finally {
        setIsCreatingCase(false);
      }
    },
    []
  );

  return {
    bulkAssign,
    bulkUpdateStatus,
    bulkCreateCase,
    isAssigning,
    isUpdatingStatus,
    isCreatingCase,
  };
}
