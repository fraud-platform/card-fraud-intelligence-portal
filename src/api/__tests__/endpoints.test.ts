import { describe, it, expect } from "vitest";
import {
  RULES,
  RULESETS,
  RULE_FIELDS,
  RULE_VERSIONS,
  AUTH,
  APPROVALS,
  AUDIT_LOGS,
  VALIDATION,
  buildQueryString,
} from "../endpoints";

describe("endpoints constants and helpers", () => {
  it("builds rule urls correctly", () => {
    expect(RULES.GET("r1")).toBe("/api/v1/rules/r1");
    expect(RULES.VERSIONS.GET("r1", "v1")).toBe("/api/v1/rules/r1/versions/v1");
    expect(RULES.VERSIONS.LIST("r1")).toBe("/api/v1/rules/r1/versions");
    expect(RULES.VERSIONS.CREATE("r1")).toBe("/api/v1/rules/r1/versions");
  });

  it("builds ruleset urls correctly", () => {
    expect(RULESETS.GET("s1")).toBe("/api/v1/rulesets/s1");
    expect(RULESETS.RULES.REMOVE("s1", "rv1")).toBe("/api/v1/rulesets/s1/rules/rv1");
    expect(RULESETS.UPDATE("s1")).toBe("/api/v1/rulesets/s1");
    expect(RULESETS.DELETE("s1")).toBe("/api/v1/rulesets/s1");
    expect(RULESETS.SUBMIT("s1")).toBe("/api/v1/rulesets/s1/submit");
    expect(RULESETS.APPROVE("s1")).toBe("/api/v1/rulesets/s1/approve");
    expect(RULESETS.REJECT("s1")).toBe("/api/v1/rulesets/s1/reject");
    expect(RULESETS.COMPILE("s1")).toBe("/api/v1/rulesets/s1/compile");
  });

  it("builds rule field metadata urls correctly", () => {
    expect(RULE_FIELDS.METADATA.LIST("f1")).toBe("/api/v1/rule-fields/f1/metadata");
    expect(RULE_FIELDS.METADATA.SET("f1")).toBe("/api/v1/rule-fields/f1/metadata");
    expect(RULE_FIELDS.METADATA.DELETE("f1", "m1")).toBe("/api/v1/rule-fields/f1/metadata/m1");
  });

  it("builds rule version endpoints", () => {
    expect(RULE_VERSIONS.SUBMIT("rv1")).toBe("/api/v1/rule-versions/rv1/submit");
    expect(RULE_VERSIONS.APPROVE("rv1")).toBe("/api/v1/rule-versions/rv1/approve");
    expect(RULE_VERSIONS.REJECT("rv1")).toBe("/api/v1/rule-versions/rv1/reject");
  });

  it("builds approval endpoints", () => {
    expect(APPROVALS.DECIDE("a1")).toBe("/api/v1/approvals/a1/decide");
  });

  it("builds audit log endpoints", () => {
    expect(AUDIT_LOGS.GET("log1")).toBe("/api/v1/audit-log/log1");
  });

  it("exposes auth endpoints", () => {
    expect(AUTH.LOGIN).toBe("/api/v1/auth/login");
    expect(AUTH.ME).toBe("/api/v1/auth/me");
    expect(AUTH.LOGOUT).toBe("/api/v1/auth/logout");
    expect(AUTH.REFRESH).toBe("/api/v1/auth/refresh");
  });

  it("exposes validation endpoints", () => {
    expect(VALIDATION.CONDITION_TREE).toBe("/api/v1/validation/condition-tree");
  });

  it("returns empty query for undefined or empty filters", () => {
    expect(buildQueryString()).toBe("");
    expect(buildQueryString({})).toBe("");
    expect(buildQueryString({ q: "" })).toBe("");
  });

  it("converts filters to query string", () => {
    // URLSearchParams encodes spaces as + in node environment
    expect(buildQueryString({ page: 2, active: true, name: "john doe" })).toBe(
      "?page=2&active=true&name=john+doe"
    );
  });

  it("skips undefined and null filter values", () => {
    expect(buildQueryString({ a: undefined, b: null, c: "" })).toBe("");
    expect(buildQueryString({ a: 0, b: false, c: "ok" })).toBe("?a=0&b=false&c=ok");
  });
});
