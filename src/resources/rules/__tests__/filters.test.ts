import { describe, it, expect } from "vitest";
import { buildRuleFilters } from "../filters";
import { RuleStatus, RuleType } from "../../../types/enums";

describe("buildRuleFilters", () => {
  it("returns empty array for empty values", () => {
    expect(buildRuleFilters({})).toEqual([]);
    expect(buildRuleFilters({ search: "" })).toEqual([]);
  });

  it("adds search filter when search is provided", () => {
    const result = buildRuleFilters({ search: "test query" });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "search", operator: "contains", value: "test query" });
  });

  it("adds rule_type filter when provided", () => {
    const result = buildRuleFilters({ rule_type: RuleType.MONITORING });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "rule_type", operator: "eq", value: RuleType.MONITORING });
  });

  it("adds status filter when provided", () => {
    const result = buildRuleFilters({ status: RuleStatus.DRAFT });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "status", operator: "eq", value: RuleStatus.DRAFT });
  });

  it("combines multiple filters", () => {
    const result = buildRuleFilters({
      search: "test",
      rule_type: RuleType.AUTH,
      status: RuleStatus.APPROVED,
    });
    expect(result).toHaveLength(3);
  });

  it("trims search whitespace", () => {
    const result = buildRuleFilters({ search: "  test  " });
    expect(result[0].value).toBe("test");
  });

  it("does not add filter for undefined search", () => {
    const result = buildRuleFilters({ search: undefined, rule_type: RuleType.BLOCKLIST });
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("rule_type");
  });

  it("does not add filter for null search", () => {
    const result = buildRuleFilters({ search: null as any, rule_type: RuleType.ALLOWLIST });
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("rule_type");
  });
});
