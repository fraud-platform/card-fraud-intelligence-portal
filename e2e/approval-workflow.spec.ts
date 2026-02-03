/**
 * Approval Workflow E2E Tests
 *
 * Tests the maker-checker governance flow:
 * 1. Maker creates rule and submits for approval
 * 2. Checker views pending approvals
 * 3. Checker can approve/reject rules
 */

import { test, expect } from "./fixtures";

test.describe("Approval Workflow - Maker Flow", () => {
  test("maker can create and save a rule", async ({ makerPage }) => {
    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible();

    // Fill in rule details
    await makerPage.getByLabel("Rule Name").fill("High Value Transaction Alert");
    await makerPage.locator(".ant-select:has(#rule_type)").click();
    await makerPage.getByTitle("BLOCKLIST").click();
    await makerPage.getByLabel("Priority").fill("100");

    // Save the rule - wait for response first
    const saveResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rules") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    await saveResponse;

    // Wait for navigation to list
    await makerPage.waitForURL(/\/rules(\?|$)/, { timeout: 15000 });

    // Verify redirect to list
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("maker can access rules list", async ({ makerPage }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Approval Workflow - Checker Flow", () => {
  test("checker can view approvals list", async ({ checkerPage }) => {
    await checkerPage.goto("/approvals");
    await checkerPage.waitForURL(/\/approvals/, { timeout: 10000 });

    // Should see approvals page (table or empty state)
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("checker can access rules list", async ({ checkerPage }) => {
    await checkerPage.goto("/rules");
    await checkerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Approval Workflow - Access Control", () => {
  test("maker can access rule creation", async ({ makerPage }) => {
    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible();
  });

  test("checker role is displayed correctly", async ({ checkerPage }) => {
    await checkerPage.goto("/");
    // Verify checker role badge is visible and shows friendly label
    await expect(checkerPage.locator(".role-label")).toBeVisible({ timeout: 15000 });
    await expect(checkerPage.locator(".role-label")).toHaveText(/rule/i, { timeout: 15000 });
  });

  test("maker role is displayed correctly", async ({ makerPage }) => {
    await makerPage.goto("/");
    // Verify maker role badge is visible and shows friendly label
    await expect(makerPage.locator(".role-label")).toBeVisible({ timeout: 15000 });
    await expect(makerPage.locator(".role-label")).toHaveText(/rule/i, { timeout: 15000 });
  });
});

test.describe("Approval Workflow - Navigation", () => {
  test("can navigate to rulesets", async ({ makerPage }) => {
    await makerPage.goto("/rulesets");
    await makerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("can navigate to audit logs", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await makerPage.waitForURL(/\/audit-logs/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("can navigate to rule fields", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await makerPage.waitForURL(/\/rule-fields/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });
});
