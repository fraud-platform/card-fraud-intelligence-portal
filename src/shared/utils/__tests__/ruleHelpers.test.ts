import { describe, it, expect } from "vitest";
import { extractRuleAndVersion, extractRuleDetail, extractRuleSetDetail } from "../ruleHelpers";

// Minimal mock shapes for Rule and RuleVersion
const mockRule = { rule_id: "r1", rule_name: "Test Rule" } as any;
const mockVersion = { rule_version_id: "rv1" } as any;

describe("extractRuleAndVersion", () => {
  it("extracts rule and current version from RuleDetailResponse shape", () => {
    const data = { rule: mockRule, current_version: mockVersion } as any;
    const out = extractRuleAndVersion(data);
    expect(out.rule).toBe(mockRule);
    expect(out.currentVersion).toBe(mockVersion);
  });

  it("extracts version_details from flat shape", () => {
    const data = { ...mockRule, version_details: mockVersion } as any;
    const out = extractRuleAndVersion(data);
    expect(out.rule).toBe(data);
    expect(out.currentVersion).toBe(mockVersion);
  });

  it("returns null currentVersion when not present", () => {
    const data = { ...mockRule } as any;
    const out = extractRuleAndVersion(data);
    expect(out.rule).toEqual(data);
    expect(out.currentVersion).toBeNull();
  });
});

describe("extractRuleDetail", () => {
  it("extracts rule/currentVersion/versions from RuleDetailResponse shape", () => {
    const data = { rule: mockRule, current_version: mockVersion, versions: [mockVersion] } as any;
    const out = extractRuleDetail(data);
    expect(out.rule).toBe(mockRule);
    expect(out.currentVersion).toBe(mockVersion);
    expect(out.versions).toEqual([mockVersion]);
  });

  it("extracts from flat shape with version_details", () => {
    const data = { ...mockRule, version_details: mockVersion } as any;
    const out = extractRuleDetail(data);
    expect(out.rule).toBe(data);
    expect(out.currentVersion).toBe(mockVersion);
    expect(out.versions).toEqual([mockVersion]);
  });

  it("returns defaults when versions missing", () => {
    const data = { rule: mockRule } as any;
    const out = extractRuleDetail(data);
    expect(out.rule).toBe(mockRule);
    expect(out.currentVersion).toBeNull();
    expect(out.versions).toEqual([]);
  });
});

describe("extractRuleSetDetail", () => {
  const mockRuleset = { ruleset_id: "rs1", name: "RS" } as any;

  it("extracts ruleset and rules from detail shape", () => {
    const data = { ruleset: mockRuleset, rules: [mockVersion] } as any;
    const out = extractRuleSetDetail(data);
    expect(out.ruleset).toBe(mockRuleset);
    expect(out.rules).toEqual([mockVersion]);
  });

  it("extracts from flat shape with rules array", () => {
    const data = { ...mockRuleset, rules: [mockVersion] } as any;
    const out = extractRuleSetDetail(data);
    expect(out.ruleset).toEqual(data);
    expect(out.rules).toEqual([mockVersion]);
  });

  it("returns defaults when rules missing", () => {
    const data = { ...mockRuleset } as any;
    const out = extractRuleSetDetail(data);
    expect(out.ruleset).toEqual(data);
    expect(out.rules).toEqual([]);
  });
});
