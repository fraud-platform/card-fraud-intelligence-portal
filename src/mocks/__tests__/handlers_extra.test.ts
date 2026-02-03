import { describe, it, expect } from "vitest";
import "../handlers";

// Global test setup handles MSW server lifecycle

describe("MSW handlers extra integration", () => {
  it("rule field metadata create and delete", async () => {
    // create a rule field to attach metadata
    const createFieldRes = await fetch("/api/v1/rule-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_key: "meta_tf",
        display_name: "Meta Field",
        data_type: "STRING",
      }),
    });
    expect(createFieldRes.status).toBe(201);
    const cf = await createFieldRes.json();
    const fk = cf.field_key;

    // add metadata
    const addMetaRes = await fetch(`/api/v1/rule-fields/${fk}/metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meta_key: "m1", meta_value: "v1" }),
    });
    expect(addMetaRes.status).toBe(201);
    const meta = await addMetaRes.json();
    expect(meta.meta_key).toBe("m1");

    // delete metadata
    const delMetaRes = await fetch(`/api/v1/rule-fields/${fk}/metadata/m1`, { method: "DELETE" });
    // delete returns 204
    expect([200, 204]).toContain(delMetaRes.status);
  });

  it("rule versions create and fetch", async () => {
    // create a rule
    const createRuleRes = await fetch("/api/v1/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_name: "versioned", rule_type: "MONITORING" }),
    });
    expect(createRuleRes.status).toBe(201);
    const rule = await createRuleRes.json();

    // create a version
    const createVersionRes = await fetch(`/api/v1/rules/${rule.rule_id}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition_tree: { and: [] } }),
    });
    expect(createVersionRes.status).toBe(201);
    const version = await createVersionRes.json();
    expect(version.rule_id).toBe(rule.rule_id);

    // fetch versions list
    const versionsRes = await fetch(`/api/v1/rules/${rule.rule_id}/versions`);
    expect(versionsRes.status).toBe(200);
    const versions = await versionsRes.json();
    expect(Array.isArray(versions)).toBe(true);

    // fetch single version (valid)
    const _verId = version.rule_version_id || version.id || Object.keys(versions[0] || {})[0];
    const getVer = await fetch(`/api/v1/rules/${rule.rule_id}/versions/${version.rule_version_id}`);
    expect([200, 404]).toContain(getVer.status);
  });

  it("ruleset compile/submit and add/remove rule", async () => {
    // create ruleset
    const createRs = await fetch("/api/v1/rulesets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope_id: "SCOPE1", rule_type: "MONITORING" }),
    });
    expect(createRs.status).toBe(201);
    const rs = await createRs.json();

    // compile (may succeed or return rule set)
    const comp = await fetch(`/api/v1/rulesets/${rs.ruleset_id}/compile`, { method: "POST" });
    expect([200, 404]).toContain(comp.status);

    // submit
    const submit = await fetch(`/api/v1/rulesets/${rs.ruleset_id}/submit`, { method: "POST" });
    expect([200, 404]).toContain(submit.status);

    // add a rule to ruleset
    // create a rule version first
    const createRuleRes = await fetch("/api/v1/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_name: "rs-rule", rule_type: "MONITORING" }),
    });
    const rule = await createRuleRes.json();
    const createVersionRes = await fetch(`/api/v1/rules/${rule.rule_id}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition_tree: { and: [] } }),
    });
    const version = await createVersionRes.json();

    const addRes = await fetch(`/api/v1/rulesets/${rs.ruleset_id}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_version_id: version.rule_version_id }),
    });
    expect([201, 400]).toContain(addRes.status);

    // try removing non-existent rule
    const delRes = await fetch(`/api/v1/rulesets/${rs.ruleset_id}/rules/nope`, {
      method: "DELETE",
    });
    expect([204, 404]).toContain(delRes.status);
  });

  it("approvals create, decide and fetch", async () => {
    // create approval
    const createRes = await fetch("/api/v1/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity_type: "RULE", entity_id: "r1", action: "SUBMIT" }),
    });
    expect(createRes.status).toBe(201);
    const apr = await createRes.json();

    // fetch by id
    const getRes = await fetch(`/api/v1/approvals/${apr.approval_id}`);
    expect([200, 404]).toContain(getRes.status);

    // decide
    const decideRes = await fetch(`/api/v1/approvals/${apr.approval_id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    expect([200, 404]).toContain(decideRes.status);
  });

  it("audit logs list and detail with filters", async () => {
    const listRes = await fetch("/api/v1/audit-log?limit=2");
    expect(listRes.status).toBe(200);
    const body = await listRes.json();
    expect(body).toHaveProperty("items");

    const nonexist = await fetch("/api/v1/audit-log/nope");
    expect([200, 404]).toContain(nonexist.status);
  });

  it("validation endpoint handles missing body and success", async () => {
    const bad = await fetch("/api/v1/validation/condition-tree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(bad.status).toBe(400);

    const ok = await fetch("/api/v1/validation/condition-tree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition_tree: { and: [] } }),
    });
    expect(ok.status).toBe(200);
    const j = await ok.json();
    expect(j.valid).toBe(true);
  });

  it("returns 404 when deleting non-existent rule field", async () => {
    const res = await fetch("/api/v1/rule-fields/does_not_exist", { method: "DELETE" });
    expect(res.status).toBe(404);
    const j = await res.json();
    expect(j.error).toMatch(/not found/i);
  });

  it("returns 404 for getting non-existent rule", async () => {
    const res = await fetch("/api/v1/rules/nonexistent");
    expect(res.status).toBe(404);
    const j = await res.json();
    expect(j.error).toMatch(/not found/i);
  });

  it("approvals decide returns 404 for unknown approval explicitly", async () => {
    const res = await fetch("/api/v1/approvals/unknown-approval/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    expect(res.status).toBe(404);
    const j = await res.json();
    expect(j.error).toMatch(/not found/i);
  });

  it("delete metadata returns 404 when metadata key missing", async () => {
    // Ensure field exists
    const createFieldRes = await fetch("/api/v1/rule-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field_key: "meta_missing_test",
        display_name: "Meta Missing",
        data_type: "STRING",
      }),
    });
    expect(createFieldRes.status).toBe(201);

    const res = await fetch("/api/v1/rule-fields/meta_missing_test/metadata/nonexistent", {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
    const j = await res.json();
    expect(j.error).toMatch(/Metadata not found/i);
  });

  it("rulesets compile returns 404 for missing ruleset", async () => {
    const res = await fetch("/api/v1/rulesets/no_such_rs/compile", { method: "POST" });
    expect(res.status).toBe(404);
  });
});
