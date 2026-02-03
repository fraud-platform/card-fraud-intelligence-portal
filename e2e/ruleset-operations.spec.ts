/**
 * RuleSet Operations E2E Tests
 *
 * Tests ruleset management:
 * 1. View rulesets list
 * 2. Navigate to ruleset pages
 * 3. Basic ruleset operations
 */

import { test, expect } from "./fixtures";

test.describe("RuleSet - List View", () => {
  test("can view rulesets list", async ({ makerPage }) => {
    await makerPage.goto("/rulesets");
    await makerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("rulesets list shows columns", async ({ makerPage }) => {
    await makerPage.goto("/rulesets");
    await makerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Verify table has headers
    const headerCount = await makerPage.locator("th").count();
    expect(headerCount).toBeGreaterThanOrEqual(2);
  });
});

test.describe("RuleSet - Creation", () => {
  test("maker can access ruleset creation page", async ({ makerPage }) => {
    await makerPage.goto("/rulesets/create");

    // Should see the create form
    await expect(makerPage.getByLabel(/name/i)).toBeVisible({ timeout: 10000 });
  });

  test("maker can create a ruleset", async ({ makerPage }) => {
    await makerPage.goto("/rulesets/create");
    await expect(makerPage.getByLabel(/name/i)).toBeVisible({ timeout: 10000 });

    // Fill in ruleset details
    await makerPage.getByLabel(/name/i).fill("Test Ruleset");

    // Select rule type if available
    const ruleTypeSelect = makerPage.locator(".ant-select:has(#rule_type)");
    if ((await ruleTypeSelect.count()) > 0) {
      await ruleTypeSelect.click();
      await makerPage.getByTitle("BLOCKLIST").click();
    }

    // Save ruleset
    await makerPage.getByRole("button", { name: /save/i }).click();
    await makerPage.waitForURL(/\/rulesets(\?|$)/, { timeout: 10000 });

    // WebKit needs extra time to stabilize after form submission
    await makerPage.waitForTimeout(500);
  });
});

test.describe("RuleSet - Navigation", () => {
  test("can navigate from rulesets to rules", async ({ makerPage }) => {
    await makerPage.goto("/rulesets");
    await makerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await makerPage.waitForLoadState("networkidle");

    // Navigate to rules
    await makerPage.goto("/rules");
    await makerPage.waitForLoadState("networkidle");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("can navigate from rulesets to approvals", async ({ checkerPage }) => {
    await checkerPage.goto("/rulesets");
    await checkerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await checkerPage.waitForLoadState("networkidle");

    // Navigate to approvals
    await checkerPage.goto("/approvals");
    await checkerPage.waitForLoadState("networkidle");
    await checkerPage.waitForURL(/\/approvals/, { timeout: 10000 });
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("RuleSet - Role Access", () => {
  test("maker can view rulesets", async ({ makerPage }) => {
    await makerPage.goto("/rulesets");
    await makerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("checker can view rulesets", async ({ checkerPage }) => {
    await checkerPage.goto("/rulesets");
    await checkerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });
});
