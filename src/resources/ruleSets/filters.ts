import type { CrudFilters } from "@refinedev/core";
import type { RuleSetStatus, RuleType } from "../../types/enums";
import { buildFilters } from "../../shared/utils/filters";

export function buildRuleSetFilters(values: {
  search?: string;
  rule_type?: RuleType;
  status?: RuleSetStatus;
}): CrudFilters {
  return buildFilters(values, [
    { field: "search", operator: "contains" },
    { field: "rule_type" },
    { field: "status" },
  ]);
}
