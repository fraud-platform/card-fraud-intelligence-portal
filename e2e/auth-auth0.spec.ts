/**
 * Authentication E2E Tests
 *
 * Tests authentication flow with dev mode sessionStorage auth.
 * In E2E mode, Auth0 is disabled and dev mode auth is used.
 */

import { test, expect } from "./fixtures";

test.describe("Authentication - Dev Mode", () => {
  test("authenticated page shows role badge", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/");

    // Should show role badge (friendly label). Use class selector to be resilient to UI text changes
    await expect(authenticatedPage.locator(".role-label")).toBeVisible({ timeout: 15000 });
    // Also assert label text contains a known friendly term
    await expect(authenticatedPage.locator(".role-label")).toHaveText(/rule/i, { timeout: 15000 });
  });

  test("maker user can access rule creation", async ({ makerPage }) => {
    await makerPage.goto("/rules/create");

    // Should be able to access create page
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible({ timeout: 10000 });
  });

  test("checker user can access approvals", async ({ checkerPage }) => {
    await checkerPage.goto("/approvals");

    // Should be able to access approvals page
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("maker role is displayed correctly", async ({ makerPage }) => {
    await makerPage.goto("/");

    await expect(makerPage.locator(".role-label")).toBeVisible({ timeout: 10000 });
    await expect(makerPage.locator(".role-label")).toHaveText(/rule maker/i, { timeout: 10000 });
  });

  test("checker role is displayed correctly", async ({ checkerPage }) => {
    await checkerPage.goto("/");

    await expect(checkerPage.locator(".role-label")).toBeVisible({ timeout: 10000 });
    await expect(checkerPage.locator(".role-label")).toHaveText(/rule checker/i, {
      timeout: 10000,
    });
  });
});

test.describe("Authentication - Session", () => {
  test("session persists across navigation", async ({ makerPage }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Navigate to another page
    await makerPage.goto("/rulesets");
    await makerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await expect(makerPage.locator(".role-label")).toBeVisible({ timeout: 10000 });
    await expect(makerPage.locator(".role-label")).toHaveText(/rule maker/i, { timeout: 10000 });
  });
});
