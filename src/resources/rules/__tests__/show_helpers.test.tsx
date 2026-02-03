import { describe, it, expect } from "vitest";
import { extractRuleDetail } from "../../../shared/utils/ruleHelpers";
import type { Rule } from "../../../types/domain";

describe("extractRuleDetail", () => {
  it("extracts when data has rule + versions", () => {
    const rule: Rule = {
      rule_id: "r1",
      rule_name: "R",
      rule_type: "MONITORING" as any,
      status: "DRAFT" as any,
      current_version: 1,
      created_by: "u",
      created_at: "now",
    };
    const data = {
      rule,
      current_version: {
        rule_version_id: "rv1",
        rule_id: "r1",
        condition_tree: null,
        priority: 1,
        created_by: "u",
        status: "DRAFT",
        approved_by: null,
        approved_at: null,
      },
      versions: [
        {
          rule_version_id: "rv1",
          rule_id: "r1",
          condition_tree: null,
          priority: 1,
          created_by: "u",
          status: "DRAFT",
          approved_by: null,
          approved_at: null,
        },
      ],
    } as any;

    const out = extractRuleDetail(data);
    expect(out.rule).toBe(rule);
    expect(out.currentVersion).not.toBeNull();
    expect(out.versions.length).toBeGreaterThan(0);
  });

  it("handles version_details shape", () => {
    const data = {
      rule_id: "r2",
      rule_name: "R2",
      version_details: {
        rule_version_id: "rv2",
        rule_id: "r2",
        condition_tree: null,
        priority: 5,
        created_by: "u",
        status: "DRAFT",
        approved_by: null,
        approved_at: null,
      },
    } as any;

    const out = extractRuleDetail(data);
    expect(out.rule.rule_id).toBe("r2");
    expect(out.currentVersion?.rule_version_id).toBe("rv2");
    expect(out.versions.length).toBe(1);
  });

  it("falls back to empty versions when none present", () => {
    const data = { rule_id: "r3", rule_name: "R3" } as any;
    const out = extractRuleDetail(data);
    expect(out.versions).toEqual([]);
    expect(out.currentVersion).toBeNull();
  });
});
