import type { CrudFilters } from "@refinedev/core";
import type { TransactionFilters } from "../../types/transaction";

type DateRangeInput = [unknown, unknown] | null | undefined;

function toIsoDate(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toISOString" in value) {
    const maybeFn = (value as { toISOString?: () => string }).toISOString;
    return typeof maybeFn === "function" ? maybeFn.call(value) : null;
  }
  return null;
}

export function buildTransactionFilters(filters: TransactionFilters): CrudFilters {
  const result: CrudFilters = [];
  const dateRange = (filters as TransactionFilters & { date_range?: DateRangeInput }).date_range;

  const mapping: Array<[keyof TransactionFilters, string]> = [
    ["decision", "decision"],
    ["decision_reason", "decision_reason"],
    ["card_id", "card_id"],
    ["merchant_id", "merchant_id"],
    ["ruleset_id", "ruleset_id"],
    ["rule_id", "rule_id"],
    ["case_id", "case_id"],
    ["assigned_to_me", "assigned_to_me"],
    ["review_status", "review_status"],
    ["risk_level", "risk_level"],
    ["min_amount", "min_amount"],
    ["max_amount", "max_amount"],
    ["from_date", "from_date"],
    ["to_date", "to_date"],
    ["search", "search"],
  ];

  mapping.forEach(([key, field]) => {
    const value = filters[key];
    if (key === "assigned_to_me") {
      if (value === true) {
        result.push({ field, operator: "eq", value: "true" });
      }
      return;
    }
    if (value != null && value !== "") {
      result.push({ field, operator: "eq", value });
    }
  });

  if (Array.isArray(dateRange)) {
    const [from, to] = dateRange;
    const fromIso = toIsoDate(from);
    const toIso = toIsoDate(to);
    if (fromIso != null && fromIso !== "") {
      result.push({ field: "from_date", operator: "eq", value: fromIso });
    }
    if (toIso != null && toIso !== "") {
      result.push({ field: "to_date", operator: "eq", value: toIso });
    }
  }

  return result;
}
