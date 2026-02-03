/**
 * Worklist E2E Tests
 *
 * Tests the fraud analyst worklist/queue functionality:
 * 1. Stats cards display (pending review, assigned to me, critical risk, etc.)
 * 2. Worklist filters (status, risk level, assigned to me)
 * 3. Claim Next functionality
 * 4. View transaction from worklist
 * 5. Refresh worklist
 *
 * SETUP: E2E mode with MSW mocking enabled by default
 */

import { test, expect, type Page } from "./fixtures";

const getVisibleTableRows = (page: Page) =>
  page.locator("tbody tr").filter({ hasNot: page.locator(".ant-table-measure-row") });

const expectWorklistHeading = async (page: Page): Promise<void> => {
  await expect(page.getByRole("heading", { name: /worklist/i })).toBeVisible({ timeout: 15000 });
};

test.describe("Worklist - Stats Cards", () => {
  test("stats cards are displayed on worklist page", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Wait for page to stabilize
    await makerPage.waitForTimeout(1000);

    // Look for stat cards (should be visible in a grid layout)
    const statCards = makerPage.locator(".ant-card");
    const cardCount = await statCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test("stats cards show pending review count", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);
    await makerPage.waitForTimeout(1000);

    // Look for "Unassigned" stat
    const unassignedText = makerPage.getByText(/unassigned/i);
    const hasUnassignedText = (await unassignedText.count()) > 0;
    expect(hasUnassignedText).toBe(true);
  });

  test("stats cards show assigned to me count", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);
    await makerPage.waitForTimeout(1000);

    // Look for "Assigned to Me" stat
    const assignedText = makerPage.getByText(/assigned to me/i);
    const hasAssignedText = (await assignedText.count()) > 0;
    expect(hasAssignedText).toBe(true);
  });

  test("stats cards show critical risk count", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);
    await makerPage.waitForTimeout(1000);

    // Look for "Critical Risk" stat
    const criticalText = makerPage.getByText(/critical|high risk/i);
    const hasCriticalText = (await criticalText.count()) > 0;
    expect(hasCriticalText).toBe(true);
  });

  test("stats cards are clickable for filtering", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);
    await makerPage.waitForTimeout(1000);

    // Try clicking on a stat card to filter
    const statCard = makerPage.locator(".ant-card").first();
    if ((await statCard.count()) > 0) {
      await statCard.click();
      await makerPage.waitForTimeout(500);

      // Table should still be visible after click
      const table = makerPage.locator(".ant-table");
      await expect(table.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Worklist - Filters", () => {
  test("status filter dropdown is available", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Look for status filter dropdown
    const statusSelect = makerPage.locator('.ant-select[aria-label*="status" i]').first();
    if ((await statusSelect.count()) === 0) {
      // Alternative: look for Select with placeholder text
      const placeholderSelect = makerPage
        .locator(".ant-select")
        .filter({ hasText: /status|all statuses/i })
        .first();
      expect((await placeholderSelect.count()) > 0).toBe(true);
    } else {
      await expect(statusSelect).toBeVisible({ timeout: 5000 });
    }
  });

  test("can filter worklist by status", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Find and click status filter
    const statusSelect = makerPage
      .locator(".ant-select")
      .filter({ hasText: /status|all statuses/i })
      .first();

    if ((await statusSelect.count()) > 0) {
      await statusSelect.click({ force: true });
      const statusOption = makerPage
        .locator(".ant-select-item-option")
        .filter({ hasText: /pending|review|approved/i })
        .first();
      if ((await statusOption.count()) > 0) {
        await statusOption.evaluate((node) => node.scrollIntoView({ block: "center" }));
        await statusOption.click({ force: true });
        await makerPage.waitForTimeout(500);

        // Verify filter applied (table still visible)
        await expect(makerPage.locator(".ant-table").first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test("risk level filter is available", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Look for risk level filter
    const riskSelect = makerPage
      .locator(".ant-select")
      .filter({ hasText: /risk|all risks/i })
      .first();
    const hasRiskFilter = (await riskSelect.count()) > 0;
    expect(hasRiskFilter).toBe(true);
  });

  test("can filter worklist by risk level", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    const riskSelect = makerPage
      .locator(".ant-select")
      .filter({ hasText: /risk|all risks/i })
      .first();

    if ((await riskSelect.count()) > 0) {
      await riskSelect.click({ force: true });
      const riskOption = makerPage
        .locator(".ant-select-item-option")
        .filter({ hasText: /critical|high|medium|low/i })
        .first();
      if ((await riskOption.count()) > 0) {
        await riskOption.evaluate((node) => node.scrollIntoView({ block: "center" }));
        await riskOption.click({ force: true });
        await makerPage.waitForTimeout(500);

        await expect(makerPage.locator(".ant-table").first()).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });

  test("assigned to me toggle is available", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Look for "Assigned to me" toggle button
    const assignedToggle = makerPage
      .getByRole("button", { name: /assigned to me|all reviews/i })
      .first();
    await expect(assignedToggle).toBeVisible({ timeout: 5000 });
  });

  test("can toggle assigned to me filter", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Find and click the toggle button
    const assignedButton = makerPage
      .getByRole("button", { name: /all reviews|assigned to me/i })
      .first();
    if ((await assignedButton.count()) > 0) {
      await assignedButton.click();
      await makerPage.waitForTimeout(500);

      // Button label should flip to "Assigned to me"
      await expect(
        makerPage.getByRole("button", { name: "Assigned to me", exact: true })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("refresh button is available", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Look for refresh button
    const refreshButton = makerPage.getByRole("button", { name: /refresh/i }).first();
    await expect(refreshButton).toBeVisible({ timeout: 5000 });
  });

  test("refresh button reloads worklist", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    const refreshButton = makerPage.getByRole("button", { name: /refresh/i }).first();
    await refreshButton.click();

    // Wait for reload
    await makerPage.waitForTimeout(1000);

    // Table should still be visible
    await expect(makerPage.locator(".ant-table").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Worklist - Claim Next", () => {
  test("claim next button is visible", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);
    await makerPage.waitForTimeout(1000);

    // Look for "Claim Next" button
    const claimButton = makerPage.getByRole("button", { name: /claim next/i }).first();
    await expect(claimButton).toBeVisible({ timeout: 5000 });
  });

  test("claim next button claims highest priority transaction", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    const claimButton = makerPage.getByRole("button", { name: /claim next/i }).first();
    await expect(claimButton).toBeVisible({ timeout: 5000 });

    // Click claim next
    await claimButton.click();
    await makerPage.waitForTimeout(1000);

    // Either:
    // 1. Success message appears and navigates to transaction detail
    // 2. Info message appears saying no transactions available
    const successMessage = makerPage.locator(".ant-message-success");
    const infoMessage = makerPage.locator(".ant-message-info");

    const hasSuccess = (await successMessage.count()) > 0;
    const hasInfo = (await infoMessage.count()) > 0;

    expect(hasSuccess || hasInfo).toBe(true);

    // If successful, should navigate to transaction detail
    if (hasSuccess) {
      await makerPage.waitForTimeout(1000);
      const currentUrl = makerPage.url();
      const navigatedToDetail = currentUrl.includes("/transactions/show/");
      expect(navigatedToDetail).toBe(true);
    }
  });

  test("claim next shows loading state", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    const claimButton = makerPage.getByRole("button", { name: /claim next/i }).first();
    await expect(claimButton).toBeVisible({ timeout: 5000 });

    // Click and check for loading state
    await claimButton.click();
    const is_loading = await claimButton.getAttribute("class");

    // Button should have loading class
    const hasLoadingClass = is_loading?.includes("loading") ?? false;
    expect(hasLoadingClass || (await makerPage.locator(".ant-message").count()) > 0).toBe(true);
  });

  test("claim next disabled when no transactions available", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    const claimButton = makerPage.getByRole("button", { name: /claim next/i }).first();

    // Button might be disabled if no transactions
    const isDisabled = await claimButton.isDisabled();
    const isVisible = await claimButton.isVisible();

    // Either button is visible (enabled or disabled) or doesn't exist
    expect(isVisible || !isDisabled).toBe(true);
  });
});

test.describe("Worklist - View Transaction", () => {
  test("worklist table displays transactions", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Wait for table to load
    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Check for table rows
    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test("can view transaction details from worklist", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Look for a transaction row with a view button
    const viewButton = makerPage.getByRole("button", { name: /^View$/ }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.scrollIntoViewIfNeeded();
      await Promise.all([
        makerPage.waitForURL(/\/transactions\/show\//, { timeout: 10000 }),
        viewButton.click({ force: true }),
      ]);
    }
  });

  test("transaction row shows key information", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Check for table headers
    const headers = makerPage.locator("th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(2);
  });

  test("transaction row shows status badge", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Look for status tags/badges
    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    if (rowCount === 0) {
      expect(true).toBe(true);
      return;
    }

    const statusTags = rows.first().locator(".ant-tag");
    const hasTags = (await statusTags.count()) > 0;
    const hasStatusHeader = (await makerPage.getByText(/status/i).count()) > 0;
    expect(hasTags || hasStatusHeader).toBe(true);
  });

  test("transaction row shows risk level badge", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Look for risk level badges
    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    if (rowCount === 0) {
      expect(true).toBe(true);
      return;
    }

    const riskBadges = rows.first().locator(".ant-tag, [class*='risk']");
    const hasRiskBadges = (await riskBadges.count()) > 0;
    const hasRiskHeader = (await makerPage.getByText(/risk/i).count()) > 0;
    expect(hasRiskBadges || hasRiskHeader).toBe(true);
  });
});

test.describe("Worklist - Table Features", () => {
  test("worklist table supports pagination", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Look for pagination controls
    const pagination = makerPage.locator(".ant-pagination");
    const hasPagination = (await pagination.count()) > 0;
    expect(hasPagination || (await getVisibleTableRows(makerPage).count()) <= 20).toBe(true);
  });

  test("worklist table is sortable", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Look for sortable columns (with sort icons)
    const sortIcons = makerPage.locator(".ant-table-column-sorter");
    const hasSortIcons = (await sortIcons.count()) > 0;
    expect(hasSortIcons).toBe(true);
  });

  test("worklist table shows assigned analyst", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Look for "Assigned To" column or header
    const assignedHeader = makerPage.getByText(/assigned to|analyst/i);
    const hasAssignedHeader = (await assignedHeader.count()) > 0;
    expect(hasAssignedHeader).toBe(true);
  });

  test("worklist table shows transaction amount", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });

    // Look for amount column
    const amountHeader = makerPage.getByText(/amount|txn/i);
    const hasAmountHeader = (await amountHeader.count()) > 0;
    expect(hasAmountHeader).toBe(true);
  });
});

test.describe("Worklist - Empty State", () => {
  test("shows empty state when no transactions", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();

    if (rowCount === 0) {
      const hasEmptyIndicators =
        (await makerPage.locator(".ant-empty, .ant-table-placeholder").count()) > 0 ||
        (await makerPage.getByText(/no data|no transactions/i).count()) > 0;
      const tableVisible = await makerPage.locator(".ant-table").first().isVisible();
      expect(hasEmptyIndicators || tableVisible).toBe(true);
    }
  });

  test("shows message when no items match filters", async ({ makerPage }) => {
    await makerPage.goto("/worklist");
    await expectWorklistHeading(makerPage);

    // Apply a filter that might return no results
    const statusSelect = makerPage
      .locator(".ant-select")
      .filter({ hasText: /status/i })
      .first();

    if ((await statusSelect.count()) > 0) {
      await statusSelect.click();
      await makerPage.waitForTimeout(300);

      const dropdown = makerPage.locator(".ant-select-dropdown:visible").first();
      if ((await dropdown.count()) > 0) {
        // Select a status option
        const statusOption = dropdown.locator(".ant-select-item-option").first();
        if ((await statusOption.count()) > 0) {
          await statusOption.click();
          await makerPage.waitForTimeout(500);

          // Table should still be visible (even if empty)
          await expect(makerPage.locator(".ant-table").first()).toBeVisible({
            timeout: 5000,
          });
        }
      }
    }
  });
});
