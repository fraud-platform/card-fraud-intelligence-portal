import { describe, it, expect } from "vitest";
import { buildRuleSetFilters } from "../filters";
import { RuleType, RuleSetStatus } from "../../../types/enums";

describe("buildRuleSetFilters", () => {
  it("returns contains filter for search and eq for type/status", () => {
    const filters = buildRuleSetFilters({
      search: "xx",
      rule_type: RuleType.BLOCKLIST,
      status: RuleSetStatus.DRAFT,
    } as any);
    expect(filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "search", operator: "contains", value: "xx" }),
        expect.objectContaining({ field: "rule_type", operator: "eq", value: RuleType.BLOCKLIST }),
        expect.objectContaining({ field: "status", operator: "eq", value: RuleSetStatus.DRAFT }),
      ])
    );
  });

  it("omits empty search", () => {
    const filters = buildRuleSetFilters({
      search: "",
      rule_type: undefined,
      status: undefined,
    } as any);
    expect(filters).toEqual([]);
  });
});
