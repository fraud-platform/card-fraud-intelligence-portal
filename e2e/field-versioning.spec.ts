/**
 * Field Versioning E2E Tests
 *
 * Validates field registry list loads and versioning elements are visible.
 */

import { test, expect } from "./fixtures";

test.describe("Field Versioning", () => {
  test("rule fields list loads with version info", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 15000 });

    // Column headers should include Version or Status
    const versionHeader = makerPage.getByText(/version/i).first();
    const statusHeader = makerPage.getByText(/status/i).first();

    const hasVersionHeader = (await versionHeader.count()) > 0;
    const hasStatusHeader = (await statusHeader.count()) > 0;

    expect(hasVersionHeader || hasStatusHeader).toBe(true);
  });

  test("field detail view is reachable", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 15000 });

    const firstRow = makerPage.locator("tbody tr").first();
    if ((await firstRow.count()) > 0) {
      const showLink = firstRow.locator('a[href*="/rule-fields"]').first();
      if ((await showLink.count()) > 0) {
        await showLink.click();
        await makerPage.waitForURL(/\/rule-fields\//, { timeout: 10000 });

        await expect(makerPage.getByText(/overview|versions|activity/i).first()).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });
});
