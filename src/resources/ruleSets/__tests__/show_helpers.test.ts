import { describe, it, expect } from "vitest";
import { extractRuleSetDetail } from "../../../shared/utils/ruleHelpers";

describe("extractRuleSetDetail", () => {
  it("extracts when data has ruleset and rules", () => {
    const input = {
      ruleset: { ruleset_id: "rs1", scope_id: "S1" },
      rules: [
        {
          rule_version_id: "rv1",
          rule_id: "rule_001",
          version: 1,
          condition_tree: { and: [] },
          priority: 1,
          created_by: "u",
          created_at: "now",
          status: "APPROVED",
        },
      ],
    } as any;
    const out = extractRuleSetDetail(input);
    expect(out.ruleset.ruleset_id).toBe("rs1");
    expect(Array.isArray(out.rules)).toBe(true);
    expect(out.rules[0].rule_version_id).toBe("rv1");
  });

  it("extracts when data is a RuleSetWithRules", () => {
    const input = {
      ruleset_id: "rs2",
      rules: [
        {
          rule_version_id: "rv2",
          rule_id: "rule_002",
          version: 1,
          condition_tree: { and: [] },
          priority: 2,
          created_by: "u",
          created_at: "now",
          status: "APPROVED",
        },
      ],
    } as any;
    const out = extractRuleSetDetail(input);
    expect(out.ruleset.ruleset_id).toBe("rs2");
    expect(out.rules.length).toBe(1);
  });

  it("falls back to empty rules if none present", () => {
    const input = { ruleset_id: "rs3", scope_id: "S3" } as any;
    const out = extractRuleSetDetail(input);
    expect(out.ruleset.ruleset_id).toBe("rs3");
    expect(out.rules).toEqual([]);
  });
});
