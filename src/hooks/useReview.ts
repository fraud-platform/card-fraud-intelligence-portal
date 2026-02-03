/**
 * useReview Hook
 *
 * Custom hook for managing transaction review state and actions.
 */

import { useState, useCallback } from "react";
import { post, patch } from "../api/httpClient";
import { REVIEW } from "../api/endpoints";
import type {
  TransactionReview,
  StatusUpdateRequest,
  AssignRequest,
  ResolveRequest,
  EscalateRequest,
} from "../types/review";
import useFetchReview from "./useFetchReview";
import { withOptimisticUpdate } from "./utils/optimisticUpdate";

interface UseReviewOptions {
  transactionId: string;
  enabled?: boolean;
  initialReview?: TransactionReview | null;
  skipInitialFetch?: boolean;
}

interface UseReviewReturn {
  review: TransactionReview | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateStatus: (request: StatusUpdateRequest) => Promise<void>;
  assign: (request: AssignRequest) => Promise<void>;
  resolve: (request: ResolveRequest) => Promise<void>;
  escalate: (request: EscalateRequest) => Promise<void>;
  isUpdating: boolean;
}

/**
 * Hook for managing transaction review state
 */

export function useReview({
  transactionId,
  enabled = true,
  initialReview = null,
  skipInitialFetch = false,
}: UseReviewOptions): UseReviewReturn {
  const { review, setReview, isLoading, error, refetch } = useFetchReview({
    transactionId,
    enabled,
    initialReview,
    skipInitialFetch,
  });

  // rename refetch to local fetchReview to preserve previous API semantics
  const fetchReview = useCallback(() => refetch(), [refetch]);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(
    (request: StatusUpdateRequest): Promise<void> => {
      return withOptimisticUpdate(
        review,
        setReview,
        setIsUpdating,
        (prev, now) =>
          prev == null
            ? prev
            : {
                ...prev,
                status: request.status,
                updated_at: now,
                last_activity_at: now,
              },
        () => patch(REVIEW.STATUS(transactionId), request),
        () => refetch()
      );
    },
    [transactionId, review, refetch, setReview, setIsUpdating]
  );

  const assign = useCallback(
    (request: AssignRequest): Promise<void> => {
      return withOptimisticUpdate(
        review,
        setReview,
        setIsUpdating,
        (prev, now) =>
          prev == null
            ? prev
            : {
                ...prev,
                assigned_analyst_id: request.analyst_id,
                assigned_analyst_name: request.analyst_name ?? prev.assigned_analyst_name,
                assigned_at: now,
                updated_at: now,
                last_activity_at: now,
              },
        () => patch(REVIEW.ASSIGN(transactionId), request),
        () => refetch()
      );
    },
    [transactionId, review, refetch, setReview, setIsUpdating]
  );

  const resolve = useCallback(
    (request: ResolveRequest): Promise<void> => {
      return withOptimisticUpdate(
        review,
        setReview,
        setIsUpdating,
        (prev, now) =>
          prev == null
            ? prev
            : ({
                ...prev,
                status: "RESOLVED",
                resolution_code: request.resolution_code,
                resolution_notes: request.resolution_notes ?? prev.resolution_notes,
                analyst_decision: request.analyst_decision ?? prev.analyst_decision,
                analyst_decision_reason:
                  request.analyst_decision_reason ?? prev.analyst_decision_reason,
                resolved_at: now,
                updated_at: now,
                last_activity_at: now,
              } as TransactionReview),
        () => post(REVIEW.RESOLVE(transactionId), request),
        () => refetch()
      );
    },
    [transactionId, review, refetch, setReview, setIsUpdating]
  );

  const escalate = useCallback(
    (request: EscalateRequest): Promise<void> => {
      return withOptimisticUpdate(
        review,
        setReview,
        setIsUpdating,
        (prev, now) =>
          prev == null
            ? prev
            : ({
                ...prev,
                status: "ESCALATED",
                escalated_at: now,
                escalated_to: request.escalate_to ?? prev.escalated_to,
                escalation_reason: request.escalation_reason,
                updated_at: now,
                last_activity_at: now,
              } as TransactionReview),
        () => post(REVIEW.ESCALATE(transactionId), request),
        () => refetch()
      );
    },
    [transactionId, review, refetch, setReview, setIsUpdating]
  );

  return {
    review,
    isLoading,
    error,
    refetch: () => {
      void fetchReview();
    },
    updateStatus,
    assign,
    resolve,
    escalate,
    isUpdating,
  };
}
