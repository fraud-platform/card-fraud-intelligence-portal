import { describe, it, expect } from "vitest";
import "../handlers";

// Global test setup handles MSW server lifecycle

describe("handlers integration - rules and rulesets", () => {
  it("can list, create, version, and submit rules and create rulesets", async () => {
    // List rules
    const listRes = await fetch("/api/v1/rules");
    expect(listRes.ok).toBe(true);
    const listJson = await listRes.json();
    expect(Array.isArray(listJson.items)).toBe(true);

    // Get a specific rule
    const firstRuleId = listJson.items[0]?.rule_id;
    if (firstRuleId) {
      const getRes = await fetch(`/api/v1/rules/${firstRuleId}`);
      expect(getRes.ok).toBe(true);
      const getJson = await getRes.json();
      // handler may return either a { rule } wrapper or a flat Rule object depending on store shape
      expect(getJson.rule || getJson.rule_id).toBeDefined();
    }

    // Create a new rule
    const createRes = await fetch("/api/v1/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rule_name: "New Rule",
        rule_type: "ALLOWLIST",
        condition_tree: {},
        priority: 50,
      }),
    });
    expect(createRes.status).toBe(201);
    const createdRule = await createRes.json();
    expect(createdRule.rule_id).toBeDefined();

    // Create a new version for the rule
    const ruleId = createdRule.rule_id;
    const createVerRes = await fetch(`/api/v1/rules/${ruleId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition_tree: {}, priority: 10 }),
    });
    expect(createVerRes.status).toBe(201);
    const createdVer = await createVerRes.json();
    expect(createdVer.rule_version_id).toBeDefined();

    // List versions
    const versionsRes = await fetch(`/api/v1/rules/${ruleId}/versions`);
    expect(versionsRes.ok).toBe(true);
    const versions = await versionsRes.json();
    expect(Array.isArray(versions)).toBe(true);

    // Submit the rule (creates approval and sets status)
    const submitRes = await fetch(`/api/v1/rules/${ruleId}/submit`, { method: "POST" });
    expect(submitRes.ok).toBe(true);

    const getAfterSubmit = await fetch(`/api/v1/rules/${ruleId}`);
    const afterJson = await getAfterSubmit.json();
    // Support both wrapper and flat rule shapes
    const status = afterJson.rule?.status ?? afterJson.status;
    expect(status).toBe("PENDING_APPROVAL");

    // Create a new ruleset
    const rsRes = await fetch("/api/v1/rulesets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_type: "ALLOWLIST", name: "RS Test" }),
    });

    expect(rsRes.status).toBe(201);
    const createdRs = await rsRes.json();
    expect(createdRs.ruleset_id).toBeDefined();
  }, 15000);
});
