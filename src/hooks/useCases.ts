/**
 * useCases Hook
 *
 * Custom hook for managing transaction cases.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { get, post, patch, del } from "../api/httpClient";
import { CASES } from "../api/endpoints";
import { buildQueryParams } from "../shared/utils/url";
import { isAbortError } from "../shared/utils/abort";
import type {
  TransactionCase,
  CaseCreateRequest,
  CaseUpdateRequest,
  CaseResolveRequest,
  CaseActivity,
  CasesListResponse,
  CaseActivityResponse,
} from "../types/case";

interface UseCasesListOptions {
  filters?: {
    case_status?: string;
    case_type?: string;
    assigned_analyst_id?: string;
    risk_level?: string;
  };
  limit?: number;
  cursor?: string;
  enabled?: boolean;
}

interface UseCasesListReturn {
  cases: TransactionCase[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for listing cases
 */
export function useCasesList({
  filters,
  limit = 50,
  cursor,
  enabled = true,
}: UseCasesListOptions = {}): UseCasesListReturn {
  const [cases, setCases] = useState<TransactionCase[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getAbortSignal = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  // Memoize filter object to prevent unnecessary refetches
  const stableFilters = useMemo(() => {
    return {
      case_status: filters?.case_status,
      case_type: filters?.case_type,
      assigned_analyst_id: filters?.assigned_analyst_id,
      risk_level: filters?.risk_level,
      limit,
      cursor,
    };
  }, [
    filters?.case_status,
    filters?.case_type,
    filters?.assigned_analyst_id,
    filters?.risk_level,
    limit,
    cursor,
  ]);

  const fetchCases = useCallback(async () => {
    if (enabled === false) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const signal = getAbortSignal();

    const queryParams = buildQueryParams(stableFilters);
    const url = `${CASES.LIST}?${queryParams.toString()}`;

    let aborted = false;

    try {
      const data = await get<CasesListResponse>(url, { signal });
      aborted = signal.aborted;
      if (!aborted) {
        setCases(data.items ?? []);
        setTotal(data.total ?? 0);
        setHasMore(data.has_more ?? false);
        setNextCursor(data.next_cursor ?? null);
      }
    } catch (err) {
      aborted = signal.aborted || isAbortError(err);
      if (!aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch cases"));
        setCases([]);
      }
    } finally {
      if (!aborted && !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [stableFilters, enabled, getAbortSignal]);

  useEffect(() => {
    void fetchCases();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchCases]);

  return {
    cases,
    total,
    hasMore,
    nextCursor,
    isLoading,
    error,
    refetch: () => {
      void fetchCases();
    },
  };
}

interface UseCaseOptions {
  caseId: string;
  enabled?: boolean;
}

interface UseCaseReturn {
  case_: TransactionCase | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  update: (request: CaseUpdateRequest) => Promise<void>;
  resolve: (request: CaseResolveRequest) => Promise<void>;
  addTransaction: (transactionId: string) => Promise<void>;
  removeTransaction: (transactionId: string) => Promise<void>;
  isUpdating: boolean;
}

/**
 * Hook for managing a single case
 */
export function useCase({ caseId, enabled = true }: UseCaseOptions): UseCaseReturn {
  const [caseState, setCaseState] = useState<TransactionCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const getAbortSignal = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  const fetchCase = useCallback(async () => {
    if (enabled === false || caseId === undefined || caseId === "") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const signal = getAbortSignal();

    let aborted = false;

    try {
      const data = await get<TransactionCase>(CASES.GET(caseId), { signal });
      aborted = signal.aborted;
      if (!aborted) {
        setCaseState(data);
      }
    } catch (err) {
      aborted = signal.aborted || isAbortError(err);
      if (!aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch case"));
        setCaseState(null);
      }
    } finally {
      if (!aborted && !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [caseId, enabled, getAbortSignal]);

  useEffect(() => {
    void fetchCase();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchCase]);

  const update = useCallback(
    async (request: CaseUpdateRequest): Promise<void> => {
      setIsUpdating(true);
      try {
        await patch(CASES.UPDATE(caseId), request);
        await fetchCase();
      } finally {
        setIsUpdating(false);
      }
    },
    [caseId, fetchCase]
  );

  const resolve = useCallback(
    async (request: CaseResolveRequest): Promise<void> => {
      setIsUpdating(true);
      try {
        const queryParams = buildQueryParams({
          resolution_summary: request.resolution_summary,
        });
        const url = `${CASES.RESOLVE(caseId)}?${queryParams.toString()}`;
        await post(url);
        await fetchCase();
      } finally {
        setIsUpdating(false);
      }
    },
    [caseId, fetchCase]
  );

  const addTransaction = useCallback(
    async (transactionId: string): Promise<void> => {
      setIsUpdating(true);
      try {
        await post(CASES.TRANSACTIONS.ADD(caseId), { transaction_id: transactionId });
        await fetchCase();
      } finally {
        setIsUpdating(false);
      }
    },
    [caseId, fetchCase]
  );

  const removeTransaction = useCallback(
    async (transactionId: string): Promise<void> => {
      setIsUpdating(true);
      try {
        await del(CASES.TRANSACTIONS.REMOVE(caseId, transactionId));
        await fetchCase();
      } finally {
        setIsUpdating(false);
      }
    },
    [caseId, fetchCase]
  );

  return {
    case_: caseState,
    isLoading,
    error,
    refetch: () => {
      void fetchCase();
    },
    update,
    resolve,
    addTransaction,
    removeTransaction,
    isUpdating,
  };
}

interface UseCaseActivityOptions {
  caseId: string;
  limit?: number;
  enabled?: boolean;
}

interface UseCaseActivityReturn {
  activities: CaseActivity[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching case activity log
 */
export function useCaseActivity({
  caseId,
  limit = 50,
  enabled = true,
}: UseCaseActivityOptions): UseCaseActivityReturn {
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getAbortSignal = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  const fetchActivity = useCallback(async () => {
    if (enabled === false || caseId === undefined || caseId === "") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const signal = getAbortSignal();

    const url = `${CASES.ACTIVITY(caseId)}?limit=${limit}`;

    let aborted = false;

    try {
      const data = await get<CaseActivityResponse>(url, { signal });
      aborted = signal.aborted;
      if (!aborted) {
        setActivities(data.items ?? []);
        setTotal(data.total ?? 0);
        setHasMore(data.has_more ?? false);
      }
    } catch (err) {
      aborted = signal.aborted || isAbortError(err);
      if (!aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch activity"));
        setActivities([]);
      }
    } finally {
      if (!aborted && !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [caseId, limit, enabled, getAbortSignal]);

  useEffect(() => {
    void fetchActivity();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchActivity]);

  return {
    activities,
    total,
    hasMore,
    isLoading,
    error,
    refetch: () => {
      void fetchActivity();
    },
  };
}

interface UseCreateCaseReturn {
  createCase: (request: CaseCreateRequest) => Promise<TransactionCase>;
  isCreating: boolean;
}

/**
 * Hook for creating a new case
 */
export function useCreateCase(): UseCreateCaseReturn {
  const [isCreating, setIsCreating] = useState(false);

  const createCase = useCallback(async (request: CaseCreateRequest): Promise<TransactionCase> => {
    setIsCreating(true);
    try {
      const result = await post<TransactionCase>(CASES.CREATE, request);
      return result;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createCase,
    isCreating,
  };
}
