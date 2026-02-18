import { useState, useEffect, useCallback } from "react";
import { get } from "../api/httpClient";
import { OPS_ANALYST } from "../api/endpoints";
import type { InsightListResponse, InsightDetail } from "../types/opsAnalyst";

interface UseInsightsResult {
  insights: InsightDetail[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useOpsAnalystInsights(transactionId: string | undefined): UseInsightsResult {
  const [insights, setInsights] = useState<InsightDetail[]>([]);
  const [loading, setLoading] = useState(transactionId != null && transactionId !== "");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const fetchInsights = useCallback(() => {
    if (transactionId == null || transactionId === "") {
      return;
    }
    setLoading(true);
    setError(null);
    get<InsightListResponse>(OPS_ANALYST.INSIGHTS.LIST(transactionId))
      .then((res) => setInsights(res.insights))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load insights"))
      .finally(() => setLoading(false));
  }, [transactionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsights();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchInsights, tick]);

  return { insights, loading, error, reload: () => setTick((t) => t + 1) };
}
