import { describe, it, expect } from "vitest";

import { RuleStore } from "../../mocks/data/rules";
import { RuleFieldStore } from "../../mocks/data/ruleFields";
import { RuleSetStore } from "../../mocks/data/ruleSets";
import { ApprovalStore } from "../../mocks/data/approvals";
import { AuditLogStore } from "../../mocks/data/auditLogs";

describe("Mock stores", () => {
  it("RuleStore basic operations", () => {
    const s = new RuleStore();
    const all = s.getAllRules();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);

    const r = s.getRuleById(all[0].rule_id);
    expect(r).toBeDefined();

    const withVer = s.getRuleWithVersion(all[0].rule_id);
    expect(withVer).toBeDefined();
    expect(withVer).toHaveProperty("version_details");

    const created = s.createRule({
      rule_id: "test_r",
      rule_name: "T",
      rule_type: "POSITIVE",
      status: "DRAFT",
      created_by: "me",
    });
    expect(created).toHaveProperty("created_at");
    expect(created.current_version).toBe(1);

    const updated = s.updateRule(created.rule_id, { status: "APPROVED" });
    expect(updated).toHaveProperty("status", "APPROVED");

    const v = s.createVersion({
      rule_id: created.rule_id,
      rule_version_id: "rv_test",
      condition_tree: { and: [] },
      priority: 0,
      created_by: "me",
      status: "DRAFT",
    });
    expect(v.version).toBeGreaterThanOrEqual(1);
    expect(s.getRuleWithVersion(created.rule_id)?.version_details?.rule_version_id).toBeDefined();

    expect(s.deleteRule(created.rule_id)).toBe(true);
  });

  it("RuleFieldStore metadata operations", () => {
    const s = new RuleFieldStore();
    const all = s.getAll();
    expect(all.length).toBeGreaterThan(0);

    const key = all[0].field_key;
    expect(s.getByKey(key)).toBeDefined();

    const newField = s.create({
      field_key: "NEW",
      display_name: "New",
      data_type: "STRING",
      allowed_operators: [],
      multi_value_allowed: false,
      is_sensitive: false,
      is_active: true,
      created_by: "me",
    });
    expect(newField.field_key).toBe("NEW");

    const updated = s.update("NEW", { display_name: "New Name" });
    expect(updated?.display_name).toBe("New Name");

    expect(s.getMetadata(key).length).toBeGreaterThanOrEqual(0);
    const meta = s.setMetadata("NEW", "ui", { foo: "bar" });
    expect(meta.meta_key).toBe("ui");
    expect(s.deleteMetadata("NEW", "ui")).toBe(true);

    expect(s.delete("NEW")).toBe(true);
  });

  it("RuleSetStore operations and compile", () => {
    const s = new RuleSetStore();
    const all = s.getAll();
    expect(all.length).toBeGreaterThan(0);

    const rs = all[0];
    expect(s.getById(rs.ruleset_id)).toBeDefined();

    const withRules = s.getWithRules(rs.ruleset_id);
    expect(withRules).toBeDefined();

    const created = s.create({
      ruleset_id: "rs_test",
      scope_id: "S",
      rule_type: "POSITIVE",
      version: 1,
      status: "ACTIVE",
    });
    expect(created.ruleset_id).toBe("rs_test");

    const updated = s.update("rs_test", { status: "INACTIVE" });
    expect(updated?.status).toBe("INACTIVE");

    expect(s.addRule("rs_test", "rv_001_v3")).toBe(true);
    expect(s.getRules("rs_test").length).toBeGreaterThan(0);

    const compiled = s.compile("rs_test");
    expect(compiled?.compiled_ast).toBeDefined();

    expect(s.removeRule("rs_test", "rv_001_v3")).toBe(true);
    expect(s.delete("rs_test")).toBe(true);
  });

  it("ApprovalStore lifecycle", () => {
    const s = new ApprovalStore();
    const all = s.getAll();
    expect(all.length).toBeGreaterThan(0);

    const created = s.create({
      approval_id: "appr_test",
      entity_type: "RULE",
      entity_id: "rule_001",
      action: "CREATE",
      maker: "me",
    });
    expect(created.approval_id).toBe("appr_test");

    const decided = s.decide("appr_test", { checker: "checker1", status: "APPROVED" });
    expect(decided?.status).toBe("APPROVED");

    expect(s.getByEntity("RULE", "rule_001").length).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(s.getPending())).toBe(true);
  });

  it("AuditLogStore create and queries", () => {
    const s = new AuditLogStore();
    const all = s.getAll();
    expect(all.length).toBeGreaterThan(0);

    const created = s.create({
      entity_type: "RULE",
      entity_id: "rule_001",
      action: "CREATE",
      old_value: null,
      new_value: {},
      performed_by: "me",
    });
    expect(created.audit_id).toMatch(/^audit_/);

    expect(s.getByEntity("RULE", "rule_001").length).toBeGreaterThanOrEqual(0);
    expect(s.getByUser("me").length).toBeGreaterThanOrEqual(0);
  });
});
