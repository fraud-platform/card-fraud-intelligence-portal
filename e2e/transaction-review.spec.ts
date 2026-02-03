/**
 * Transaction Review E2E Tests
 *
 * Validates review flow UI is reachable and renders key tabs/actions.
 */

import { test, expect } from "./fixtures";

test.describe("Transaction Review", () => {
  test("transaction detail loads with review tabs", async ({ makerPage }) => {
    await makerPage.goto("/transactions");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 15000 });

    const transactionRow = makerPage.locator("tbody tr").first();
    if ((await transactionRow.count()) > 0) {
      const viewLink = transactionRow.locator('a[href*="/transactions/"]').first();
      if ((await viewLink.count()) > 0) {
        await viewLink.click();
        await makerPage.waitForURL(/\/transactions\//, { timeout: 10000 });

        await expect(makerPage.getByRole("tab", { name: /details/i })).toBeVisible({
          timeout: 10000,
        });
        await expect(makerPage.getByRole("tab", { name: /rule matches/i })).toBeVisible({
          timeout: 10000,
        });
        await expect(makerPage.getByRole("tab", { name: /notes/i })).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });

  test("review sidebar actions are visible", async ({ makerPage }) => {
    await makerPage.goto("/transactions");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 15000 });

    const transactionRow = makerPage.locator("tbody tr").first();
    if ((await transactionRow.count()) > 0) {
      const viewLink = transactionRow.locator('a[href*="/transactions/"]').first();
      if ((await viewLink.count()) > 0) {
        await viewLink.click();
        await makerPage.waitForURL(/\/transactions\//, { timeout: 10000 });

        const sidebar = makerPage.locator(".ant-card").filter({ hasText: /review|status/i });
        await expect(sidebar.first()).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
