import { describe, it, expect } from "vitest";
import "../handlers";

// Global test setup handles MSW server lifecycle

describe("MSW handlers integration", () => {
  it("auth login and me endpoints work", async () => {
    const loginRes = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "maker1", password: "x" }),
    });

    expect(loginRes.status).toBe(200);
    const loginJson = await loginRes.json();
    expect(loginJson).toHaveProperty("token");
    expect(loginJson.user).toHaveProperty("user_id");

    const meRes = await fetch("/api/v1/auth/me");
    expect(meRes.status).toBe(200);
    const meJson = await meRes.json();
    expect(meJson).toHaveProperty("user_id");
    expect(meJson.user_id).toBe(loginJson.user.user_id);
  });

  it("rule-fields and rulesets endpoints return paginated data", async () => {
    const fieldsRes = await fetch("/api/v1/rule-fields?limit=2");
    expect(fieldsRes.status).toBe(200);
    const fieldsJson = await fieldsRes.json();
    expect(fieldsJson).toHaveProperty("items");
    expect(Array.isArray(fieldsJson.items)).toBe(true);

    const rsRes = await fetch("/api/v1/rulesets?limit=3");
    expect(rsRes.status).toBe(200);
    const rsJson = await rsRes.json();
    expect(rsJson).toHaveProperty("items");
    expect(Array.isArray(rsJson.items)).toBe(true);
    expect(rsJson.items.length).toBeGreaterThan(0);

    // pick one id and fetch details
    const firstId = rsJson.items[0].ruleset_id;
    const detailRes = await fetch(`/api/v1/rulesets/${firstId}`);
    expect(detailRes.status).toBe(200);
    const detailJson = await detailRes.json();
    // handlers may return either { ruleset, rules } or RuleSetWithRules (top-level with `rules`)
    if (detailJson.ruleset) {
      expect(detailJson.ruleset.ruleset_id).toBe(firstId);
    } else {
      expect(detailJson).toHaveProperty("ruleset_id");
      expect(detailJson.ruleset_id).toBe(firstId);
    }
  });

  it("supports creating and querying rule fields and rules", async () => {
    const createFieldRes = await fetch("/api/v1/rule-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_key: "tf_x", display_name: "Test Field", data_type: "STRING" }),
    });
    expect(createFieldRes.status).toBe(201);
    const cf = await createFieldRes.json();
    expect(cf.field_key).toBe("tf_x");

    const getUnknown = await fetch("/api/v1/rule-fields/does-not-exist");
    expect(getUnknown.status).toBe(404);

    const createRuleRes = await fetch("/api/v1/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_name: "test rule", rule_type: "MONITORING" }),
    });
    expect(createRuleRes.status).toBe(201);
    const rule = await createRuleRes.json();
    expect(rule.rule_id).toBeDefined();

    const submitRes = await fetch(`/api/v1/rules/${rule.rule_id}/submit`, { method: "POST" });
    expect(submitRes.status).toBe(200);
    const updated = await submitRes.json();
    expect(updated.status).toBeDefined();
  });
});
