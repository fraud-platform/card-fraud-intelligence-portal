import type { CrudFilters } from "@refinedev/core";
import type { RuleStatus, RuleType } from "../../types/enums";
import { buildFilters } from "../../shared/utils/filters";

export function buildRuleFilters(values: {
  search?: string;
  rule_type?: RuleType;
  status?: RuleStatus;
}): CrudFilters {
  return buildFilters(values, [
    { field: "search", operator: "contains" },
    { field: "rule_type" },
    { field: "status" },
  ]);
}
