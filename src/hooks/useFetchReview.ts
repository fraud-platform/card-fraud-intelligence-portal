import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { get } from "../api/httpClient";
import { REVIEW } from "../api/endpoints";
import { isAbortError } from "../shared/utils/abort";
import type { TransactionReview } from "../types/review";

interface UseFetchReviewOptions {
  transactionId: string;
  enabled?: boolean;
  initialReview?: TransactionReview | null;
  skipInitialFetch?: boolean;
}

interface UseFetchReviewResult {
  review: TransactionReview | null;
  setReview: Dispatch<SetStateAction<TransactionReview | null>>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetchReview({
  transactionId,
  enabled = true,
  initialReview = null,
  skipInitialFetch = false,
}: UseFetchReviewOptions): UseFetchReviewResult {
  const [review, setReview] = useState<TransactionReview | null>(initialReview);
  const [isLoading, setIsLoading] = useState(enabled && !skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  const [hasSkippedInitialFetch, setHasSkippedInitialFetch] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const getAbortSignal = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  const fetchReview = useCallback(async () => {
    if (enabled === false || transactionId === undefined || transactionId === "") {
      setIsLoading(false);
      return;
    }

    if (skipInitialFetch && !hasSkippedInitialFetch) {
      setHasSkippedInitialFetch(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const signal = getAbortSignal();

    let aborted = false;

    try {
      const data = await get<TransactionReview>(REVIEW.GET(transactionId), { signal });
      aborted = signal.aborted;
      if (!aborted) {
        setReview(data);
      }
    } catch (err) {
      aborted = signal.aborted || isAbortError(err);
      if (!aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch review"));
        setReview(null);
      }
    } finally {
      if (!aborted && !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [transactionId, enabled, skipInitialFetch, hasSkippedInitialFetch, getAbortSignal]);

  useEffect(() => {
    void fetchReview();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchReview]);

  return {
    review,
    setReview,
    isLoading,
    error,
    refetch: () => fetchReview(),
  };
}

export default useFetchReview;
