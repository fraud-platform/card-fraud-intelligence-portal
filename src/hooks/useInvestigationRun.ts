import { useState, useCallback } from "react";
import { post } from "../api/httpClient";
import { OPS_ANALYST } from "../api/endpoints";
import type { RunInvestigationRequest, RunResponse } from "../types/opsAnalyst";

interface UseInvestigationRunResult {
  run: (req: RunInvestigationRequest) => Promise<RunResponse>;
  loading: boolean;
  error: string | null;
  lastResult: RunResponse | null;
}

export function useInvestigationRun(): UseInvestigationRunResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RunResponse | null>(null);

  const run = useCallback(async (req: RunInvestigationRequest): Promise<RunResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await post<RunResponse>(OPS_ANALYST.INVESTIGATIONS.RUN, req);
      setLastResult(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Investigation failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error, lastResult };
}
