import { useState, useEffect, useCallback } from "react";
import { get, post } from "../api/httpClient";
import { OPS_ANALYST } from "../api/endpoints";
import type {
  RecommendationDetail,
  RecommendationListResponse,
  AcknowledgeRequest,
} from "../types/opsAnalyst";

interface Filters {
  severity?: string;
  cursor?: string;
  limit?: number;
}

interface UseOpsAnalystRecommendationsResult {
  recommendations: RecommendationDetail[];
  nextCursor: string | null;
  total: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
  acknowledge: (id: string, req: AcknowledgeRequest) => Promise<void>;
}

export function useOpsAnalystRecommendations(
  filters: Filters = {}
): UseOpsAnalystRecommendationsResult {
  const [recommendations, setRecommendations] = useState<RecommendationDetail[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((): void => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.severity != null && filters.severity !== "") {
      params.set("severity", filters.severity);
    }
    if (filters.cursor != null && filters.cursor !== "") {
      params.set("cursor", filters.cursor);
    }
    if (filters.limit != null && filters.limit > 0) {
      params.set("limit", String(filters.limit));
    }
    get<RecommendationListResponse>(`${OPS_ANALYST.RECOMMENDATIONS.LIST}?${params}`)
      .then((res) => {
        setRecommendations(res.recommendations);
        setNextCursor(res.next_cursor);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [filters.severity, filters.cursor, filters.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [load]);

  const acknowledge = useCallback(
    async (id: string, req: AcknowledgeRequest): Promise<void> => {
      await post(OPS_ANALYST.RECOMMENDATIONS.ACKNOWLEDGE(id), req);
      load();
    },
    [load]
  );

  return { recommendations, nextCursor, total, loading, error, reload: load, acknowledge };
}
