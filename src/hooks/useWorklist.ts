/**
 * useWorklist Hook
 *
 * Custom hook for managing analyst worklist.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { get, post } from "../api/httpClient";
import { WORKLIST } from "../api/endpoints";
import { buildQueryParams } from "../shared/utils/url";
import { isAbortError } from "../shared/utils/abort";
import type {
  WorklistItem,
  WorklistStats,
  WorklistFilters,
  WorklistResponse,
  ClaimNextRequest,
} from "../types/worklist";

interface UseWorklistOptions {
  filters?: WorklistFilters;
  enabled?: boolean;
  refreshIntervalMs?: number;
}

interface UseWorklistReturn {
  items: WorklistItem[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching worklist items
 */
export function useWorklist({
  filters,
  enabled = true,
  refreshIntervalMs = 0,
}: UseWorklistOptions = {}): UseWorklistReturn {
  const [items, setItems] = useState<WorklistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Memoize filter object to prevent unnecessary refetches
  const stableFilters = useMemo(() => {
    return {
      status: filters?.status,
      priority_filter: filters?.priority_filter,
      risk_level_filter: filters?.risk_level_filter,
      assigned_only: filters?.assigned_only,
      limit: filters?.limit,
      cursor: filters?.cursor,
    };
  }, [
    filters?.status,
    filters?.priority_filter,
    filters?.risk_level_filter,
    filters?.assigned_only,
    filters?.limit,
    filters?.cursor,
  ]);

  const getAbortSignal = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  const fetchWorklist = useCallback(async () => {
    if (enabled === false) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const signal = getAbortSignal();

    const queryParams = buildQueryParams({
      status: stableFilters.status,
      priority_filter: stableFilters.priority_filter,
      risk_level_filter: stableFilters.risk_level_filter,
      ...(stableFilters.assigned_only === true ? { assigned_only: true } : {}),
      limit: stableFilters.limit,
      cursor: stableFilters.cursor,
    });
    const queryString = queryParams.toString();
    const url = queryString === "" ? WORKLIST.LIST : `${WORKLIST.LIST}?${queryString}`;

    let aborted = false;

    try {
      const data = await get<WorklistResponse>(url, { signal });
      aborted = signal.aborted;
      if (!aborted) {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setHasMore(data.has_more ?? false);
        setNextCursor(data.next_cursor ?? null);
      }
    } catch (err) {
      aborted = signal.aborted || isAbortError(err);
      if (!aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch worklist"));
        setItems([]);
      }
    } finally {
      if (!aborted && !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [stableFilters, enabled, getAbortSignal]);

  useEffect(() => {
    void fetchWorklist();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchWorklist]);

  useEffect(() => {
    if (enabled === false || refreshIntervalMs <= 0) return undefined;
    const intervalId = setInterval(() => {
      void fetchWorklist();
    }, refreshIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, refreshIntervalMs, fetchWorklist]);

  return {
    items,
    total,
    hasMore,
    nextCursor,
    isLoading,
    error,
    refetch: () => {
      void fetchWorklist();
    },
  };
}

interface UseWorklistStatsReturn {
  stats: WorklistStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching worklist statistics
 */
export function useWorklistStats(enabled = true, refreshIntervalMs = 0): UseWorklistStatsReturn {
  const [stats, setStats] = useState<WorklistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getAbortSignal = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  const fetchStats = useCallback(async () => {
    if (enabled === false) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const signal = getAbortSignal();

    let aborted = false;

    try {
      const data = await get<WorklistStats>(WORKLIST.STATS, { signal });
      aborted = signal.aborted;
      if (!aborted) {
        setStats(data);
      }
    } catch (err) {
      aborted = signal.aborted || isAbortError(err);
      if (!aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch stats"));
        setStats(null);
      }
    } finally {
      if (!aborted && !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [enabled, getAbortSignal]);

  useEffect(() => {
    void fetchStats();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchStats]);

  useEffect(() => {
    if (enabled === false || refreshIntervalMs <= 0) return undefined;
    const intervalId = setInterval(() => {
      void fetchStats();
    }, refreshIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, refreshIntervalMs, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: () => {
      void fetchStats();
    },
  };
}

interface UseClaimNextReturn {
  claimNext: (request?: ClaimNextRequest) => Promise<WorklistItem | null>;
  isClaiming: boolean;
}

/**
 * Hook for claiming next transaction from queue
 */
export function useClaimNext(): UseClaimNextReturn {
  const [isClaiming, setIsClaiming] = useState(false);

  const claimNext = async (request: ClaimNextRequest = {}): Promise<WorklistItem | null> => {
    setIsClaiming(true);
    try {
      const result = await post<WorklistItem>(WORKLIST.CLAIM, request);
      return result ?? null;
    } catch {
      return null;
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    claimNext,
    isClaiming,
  };
}
