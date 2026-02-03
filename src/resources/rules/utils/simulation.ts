import type { RuleSimulateRequest } from "../../../api/types";

export function parseSimulationQuery(simulationQuery: string): {
  error?: string;
  query?: Record<string, unknown>;
} {
  if (simulationQuery.trim() === "") return { query: {} };

  try {
    const parsed: unknown = JSON.parse(simulationQuery);
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: "Query must be a JSON object." };
    }
    return { query: parsed as Record<string, unknown> };
  } catch {
    return { error: "Query must be valid JSON." };
  }
}

export function buildSimulationPayload(
  rule_type: string,
  condition_tree: unknown,
  scope: Record<string, unknown> | undefined | null,
  query: Record<string, unknown>
): RuleSimulateRequest {
  const payload: RuleSimulateRequest = {
    rule_type,
    // We accept unknown condition_tree from UI and cast it to PersistedConditionTree here.
    // This is intentional: validation is performed upstream when constructing the payload.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    condition_tree: condition_tree as any,
    query,
  };

  if (scope != null && Object.keys(scope).length > 0) {
    payload.scope = scope;
  }

  return payload;
}

export default {
  parseSimulationQuery,
  buildSimulationPayload,
};
