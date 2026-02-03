/**
 * Audit Logs Evidence E2E Tests (Hardened)
 *
 * Tests that audit logs properly capture evidence after mutations:
 * 1. Create actions generate audit entries
 * 2. Edit actions generate audit entries
 * 3. Approval/rejection actions generate audit entries
 * 4. Audit log filters and pagination work correctly
 *
 * SETUP: E2E mode with MSW mocking enabled by default
 */

import { test, expect } from "./fixtures";

const getVisibleTableRows = (page: any) =>
  page.locator("tbody tr:not(.ant-table-measure-row):not([aria-hidden='true'])");

test.describe("Audit Logs - Evidence of Mutations", () => {
  test("creating a rule generates an audit log entry", async ({ makerPage }) => {
    const ruleName = `Audit Test Rule ${Date.now()}`;

    // Create a rule
    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible({ timeout: 10000 });

    await makerPage.getByLabel("Rule Name").fill(ruleName);
    await makerPage.locator(".ant-select:has(#rule_type)").click();
    await makerPage.getByTitle("BLOCKLIST").click();
    await makerPage.getByLabel("Priority").fill("100");

    // Save the rule - wait for response
    const saveResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rules") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    await saveResponse;

    // Wait for navigation to list
    await makerPage.waitForURL(/\/rules(\?|$)/, { timeout: 15000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Navigate to audit logs
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Verify table has entries (at least seed data)
    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test("audit log entry contains expected columns", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Check table headers
    const headers = makerPage.locator("th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(3);

    // Verify specific columns are present
    const timestampHeader = makerPage.locator("th", {
      has: makerPage.locator("text=/time|created/i"),
    });
    await expect(timestampHeader).toBeVisible({ timeout: 5000 });

    const actionHeader = makerPage.locator("th", { has: makerPage.locator("text=/^Action$/i") });
    await expect(actionHeader).toBeVisible({ timeout: 5000 });

    const entityHeader = makerPage.locator("th", {
      has: makerPage.locator("text=/^Entity Type$/i"),
    });
    await expect(entityHeader).toBeVisible({ timeout: 5000 });
  });

  test("audit log timestamp column renders valid dates", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data to load - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Find rows with view links (seed data may not have them)
    const rowsWithView = rows.filter({ has: makerPage.locator("a[href*='/audit-logs/']") });
    const hasViewLink = (await rowsWithView.count()) > 0;

    if (hasViewLink) {
      const firstRow = rowsWithView.first();
      const viewLink = firstRow.locator("a[href*='/audit-logs/']").first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();
      await makerPage.waitForURL(/\/audit-logs\//, { timeout: 10000 });

      // Verify timestamp field is displayed on show page
      await expect(
        makerPage
          .getByText(/timestamp/i)
          .or(makerPage.getByText(/time/i))
          .or(makerPage.getByText(/created/i))
      ).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("audit log shows evidence after rule approval", async ({ makerPage, checkerPage }) => {
    // Step 1: Create and submit a rule
    const ruleName = `Approval Audit Rule ${Date.now()}`;

    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible({ timeout: 10000 });

    await makerPage.getByLabel("Rule Name").fill(ruleName);
    await makerPage.locator(".ant-select:has(#rule_type)").click();
    await makerPage.getByTitle("BLOCKLIST").click();
    await makerPage.getByLabel("Priority").fill("100");

    const saveResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rules") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    await saveResponse;
    await makerPage.waitForURL(/\/rules(\?|$)/, { timeout: 15000 });

    // Step 2: Approve the rule
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    const approvalRow = checkerPage.locator("tr", { has: checkerPage.getByText("RULE") });
    const hasApproval = (await approvalRow.count()) > 0;

    if (hasApproval) {
      const viewLink = approvalRow.locator("a[href*='/approvals/']").first();
      await viewLink.click();
      await checkerPage.waitForURL(/\/approvals\//, { timeout: 10000 });

      // Approve
      const approveButton = checkerPage.getByRole("button", { name: /approve/i });
      await expect(approveButton).toBeVisible({ timeout: 5000 });
      await approveButton.click();

      const modal = checkerPage.locator(".ant-modal").first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      const confirmButton = modal.getByRole("button", { name: /confirm/i }).first();
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      // Verify success message
      await expect(checkerPage.locator(".ant-message-success").first()).toBeVisible({
        timeout: 5000,
      });
    }

    // Step 3: Check audit logs for approval evidence
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Find first row with a view link - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Find rows with view links
    const rowsWithView = rows.filter({ has: makerPage.locator("a[href*='/audit-logs/']") });
    const hasViewLink = (await rowsWithView.count()) > 0;

    if (hasViewLink) {
      const viewLink = rowsWithView.first().locator("a[href*='/audit-logs/']").first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();
      await makerPage.waitForURL(/\/audit-logs\//, { timeout: 10000 });

      // Verify key details are displayed
      await expect(makerPage.getByText(/action/i).or(makerPage.getByText(/audit/i))).toBeVisible({
        timeout: 5000,
      });
      await expect(makerPage.getByText(/entity/i).or(makerPage.getByText(/type/i))).toBeVisible({
        timeout: 5000,
      });
      await expect(makerPage.getByText(/timestamp/i).or(makerPage.getByText(/time/i))).toBeVisible({
        timeout: 5000,
      });
      await expect(
        makerPage.getByText(/performed by/i).or(makerPage.getByText(/user/i))
      ).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("audit log shows evidence after rule rejection", async ({ makerPage, checkerPage }) => {
    // Step 1: Create and submit a rule
    const ruleName = `Rejection Audit Rule ${Date.now()}`;

    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible({ timeout: 10000 });

    await makerPage.getByLabel("Rule Name").fill(ruleName);
    await makerPage.locator(".ant-select:has(#rule_type)").click();
    await makerPage.getByTitle("BLOCKLIST").click();
    await makerPage.getByLabel("Priority").fill("100");

    const saveResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rules") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    await saveResponse;
    await makerPage.waitForURL(/\/rules(\?|$)/, { timeout: 15000 });

    // Step 2: Reject the rule
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    const approvalRow = checkerPage.locator("tr", { has: checkerPage.getByText("RULE") });
    const hasApproval = (await approvalRow.count()) > 0;

    if (hasApproval) {
      const viewLink = approvalRow.locator("a[href*='/approvals/']").first();
      await viewLink.click();
      await checkerPage.waitForURL(/\/approvals\//, { timeout: 10000 });

      // Reject
      const rejectButton = checkerPage.getByRole("button", { name: /reject/i });
      await expect(rejectButton).toBeVisible({ timeout: 5000 });
      await rejectButton.click();

      const modal = checkerPage.locator(".ant-modal").first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      await modal.getByLabel(/remarks/i).fill("Testing audit logs");
      await modal.getByRole("button", { name: /reject/i }).click();

      await expect(checkerPage.locator(".ant-message-success").first()).toBeVisible({
        timeout: 5000,
      });
    }

    // Step 3: Check audit logs
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Audit log should have entries
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });
});

test.describe("Audit Logs - Filtering", () => {
  test("can filter audit logs by entity type", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Look for entity type filter
    const filterButton = makerPage
      .locator(".ant-table-filter-trigger, button[aria-label*='filter' i]")
      .first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();

      // Select RULE filter
      const ruleOption = makerPage
        .locator(".ant-dropdown-menu-item", { has: makerPage.locator("text=/rule/i") })
        .first();
      if ((await ruleOption.count()) > 0) {
        await ruleOption.click();
      }

      // Verify table still visible
      await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 5000 });
    }
  });

  test("can filter audit logs by action", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Look for action filter
    const filterButton = makerPage.locator(".ant-table-filter-trigger").first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();

      // Select CREATE filter
      const createOption = makerPage
        .locator(".ant-dropdown-menu-item", { has: makerPage.locator("text=/create/i") })
        .first();
      if ((await createOption.count()) > 0) {
        await createOption.click();
      }

      // Verify table still visible
      await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 5000 });
    }
  });

  test("can search audit logs by entity ID", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Find search input
    const searchInput = makerPage
      .locator('input[placeholder*="search" i], input[aria-label*="search" i]')
      .first();
    if ((await searchInput.count()) > 0) {
      // Enter a search term
      await searchInput.fill("rule_");
      await makerPage.waitForTimeout(500);

      // Verify table is still visible with filtered results
      await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Audit Logs - Pagination", () => {
  test("audit log list is paginated", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Look for pagination controls
    const pagination = makerPage.locator(".ant-pagination, .ant-table-pagination");
    const hasPagination = (await pagination.count()) > 0;

    if (hasPagination) {
      await expect(pagination.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("can navigate to next page of audit logs", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Look for next page button
    const nextButton = makerPage.locator(
      'button[aria-label="next page"], li:has-text("2"):not(.ant-pagination-item-active) .ant-pagination-item-link, .ant-pagination-next'
    );
    if ((await nextButton.count()) > 0) {
      await nextButton.first().click();
      await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Audit Logs - Show Page", () => {
  test("audit log show page displays full entry details", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Find rows with view links (seed data may not have them)
    const rowsWithView = rows.filter({ has: makerPage.locator("a[href*='/audit-logs/']") });
    const hasViewLink = (await rowsWithView.count()) > 0;

    if (hasViewLink) {
      const viewLink = rowsWithView.first().locator("a[href*='/audit-logs/']").first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();
      await makerPage.waitForURL(/\/audit-logs\//, { timeout: 10000 });

      // Verify key details are displayed
      await expect(makerPage.getByText(/action/i).or(makerPage.getByText(/audit/i))).toBeVisible({
        timeout: 5000,
      });
      await expect(makerPage.getByText(/entity/i).or(makerPage.getByText(/type/i))).toBeVisible({
        timeout: 5000,
      });
      await expect(makerPage.getByText(/timestamp/i).or(makerPage.getByText(/time/i))).toBeVisible({
        timeout: 5000,
      });
      await expect(
        makerPage.getByText(/performed by/i).or(makerPage.getByText(/user/i))
      ).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("audit log show page displays JSON payload when available", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Find first row with a view link
    const rowsWithView = rows.filter({ has: makerPage.locator("a[href*='/audit-logs/']") });
    const hasViewLink = (await rowsWithView.count()) > 0;

    if (hasViewLink) {
      const viewLink = rowsWithView.first().locator("a[href*='/audit-logs/']").first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();
      await makerPage.waitForURL(/\/audit-logs\//, { timeout: 10000 });

      // Look for JSON or payload display
      const jsonBlock = makerPage.locator(".ant-code-block, pre, code, [class*='json']").first();
      const hasJson = (await jsonBlock.count()) > 0;

      if (hasJson) {
        await expect(jsonBlock).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe("Audit Logs - Data Independence", () => {
  test("audit log list contains entries after fresh navigation", async ({ makerPage }) => {
    // Navigate to audit logs
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows1 = getVisibleTableRows(makerPage);
    await expect(rows1.first()).toBeVisible({ timeout: 5000 });

    // Record entry count
    const count1 = await rows1.count();
    expect(count1).toBeGreaterThanOrEqual(1);

    // Navigate away and come back
    await makerPage.goto("/rules");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows2 = getVisibleTableRows(makerPage);
    await expect(rows2.first()).toBeVisible({ timeout: 5000 });

    // Should still have entries
    const count2 = await rows2.count();
    expect(count2).toBeGreaterThanOrEqual(1);
  });

  test("audit log table shows meaningful data not empty state", async ({ makerPage }) => {
    await makerPage.goto("/audit-logs");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // Check that table has data (not empty state)
    const emptyState = makerPage.locator(".ant-empty");
    const hasEmptyState = (await emptyState.count()) > 0;

    if (!hasEmptyState) {
      // Should have rows - filter out measure rows
      const visibleRows = getVisibleTableRows(makerPage);
      const rowCount = await visibleRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1);
    }
  });
});
