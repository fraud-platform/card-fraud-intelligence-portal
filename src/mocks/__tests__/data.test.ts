import { describe, it, expect } from "vitest";

import { mockRules, mockRuleVersions } from "../../mocks/data/rules";
import { mockRuleSets } from "../../mocks/data/ruleSets";
import { mockApprovals } from "../../mocks/data/approvals";
import { mockAuditLogs } from "../../mocks/data/auditLogs";
import { mockRuleFields } from "../../mocks/data/ruleFields";

import { handlers } from "../handlers";

describe("mocks data files", () => {
  it("rules data is populated", () => {
    expect(Array.isArray(mockRules)).toBe(true);
    expect(mockRules.length).toBeGreaterThan(0);
    expect(mockRuleVersions.length).toBeGreaterThan(0);
  });

  it("rulesets and approvals and audit logs are populated", () => {
    expect(mockRuleSets.length).toBeGreaterThan(0);
    expect(mockApprovals.length).toBeGreaterThan(0);
    expect(mockAuditLogs.length).toBeGreaterThan(0);
    expect(mockRuleFields.length).toBeGreaterThan(0);
  });

  it("handlers array is exported", () => {
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
  });
});
