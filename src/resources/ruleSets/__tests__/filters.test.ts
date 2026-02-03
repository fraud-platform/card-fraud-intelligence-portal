import { describe, it, expect } from "vitest";
import { buildRuleSetFilters } from "../filters";
import { RuleSetStatus, RuleType } from "../../../types/enums";

describe("buildRuleSetFilters", () => {
  it("returns empty array for empty values", () => {
    expect(buildRuleSetFilters({})).toEqual([]);
    expect(buildRuleSetFilters({ search: "" })).toEqual([]);
  });

  it("adds search filter when search is provided", () => {
    const result = buildRuleSetFilters({ search: "test query" });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "search", operator: "contains", value: "test query" });
  });

  it("adds rule_type filter when provided", () => {
    const result = buildRuleSetFilters({ rule_type: RuleType.MONITORING });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "rule_type", operator: "eq", value: RuleType.MONITORING });
  });

  it("adds status filter when provided", () => {
    const result = buildRuleSetFilters({ status: RuleSetStatus.DRAFT });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ field: "status", operator: "eq", value: RuleSetStatus.DRAFT });
  });

  it("combines multiple filters", () => {
    const result = buildRuleSetFilters({
      search: "test",
      rule_type: RuleType.AUTH,
      status: RuleSetStatus.ACTIVE,
    });
    expect(result).toHaveLength(3);
  });

  it("trims search whitespace", () => {
    const result = buildRuleSetFilters({ search: "  test  " });
    expect(result[0].value).toBe("test");
  });

  it("does not add filter for undefined rule_type", () => {
    const result = buildRuleSetFilters({ rule_type: undefined, status: RuleSetStatus.APPROVED });
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("status");
  });

  it("does not add filter for undefined status", () => {
    const result = buildRuleSetFilters({ status: undefined, rule_type: RuleType.BLOCKLIST });
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("rule_type");
  });
});
