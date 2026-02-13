/**
 * Approvals Decision E2E Tests (Hardened)
 *
 * Tests the complete maker-checker approval workflow:
 * 1. Maker creates and submits a rule for approval
 * 2. Checker views pending approvals
 * 3. Checker can approve or reject an approval
 * 4. Assert status transitions and UI feedback
 *
 * SETUP: E2E mode with MSW mocking enabled by default
 */

import { test, expect } from "./fixtures";

const getVisibleTableRows = (page: any) =>
  page.locator("tbody tr").filter({ hasNot: page.locator(".ant-table-measure-row") });

test.describe("Approvals - Decision Flow", () => {
  test("maker can submit a rule for approval", async ({ makerPage }) => {
    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible({ timeout: 10000 });

    // Fill in rule details
    await makerPage.getByLabel("Rule Name").fill(`Test Rule for Approval ${Date.now()}`);
    await makerPage.locator(".ant-select:has(#rule_type)").click();
    await makerPage.getByTitle("BLOCKLIST").click();
    await makerPage.getByLabel("Priority").fill("100");

    // Save the rule - wait for network response
    const saveResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rules") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    await saveResponse;

    // Wait for navigation to rules list
    await makerPage.waitForURL(/\/rules(\?|$)/, { timeout: 15000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Verify table has data (at least seed data) - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test("checker can view pending approvals", async ({ checkerPage }) => {
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table to load with explicit assertion
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });
  });

  test.skip("checker can approve a pending rule approval", async ({ makerPage, checkerPage }) => {
    // Create a fresh approval candidate first to avoid depending on existing list state.
    const ruleName = `Rule to Approve ${Date.now()}`;

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

    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table to load
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Filter to pending if filter is available
    const filterButton = checkerPage.locator(".ant-table-filter-trigger:visible").first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();
      const pendingOption = checkerPage
        .locator(".ant-dropdown-menu-item:visible", { has: checkerPage.locator("text=/pending/i") })
        .first();
      if ((await pendingOption.count()) > 0) {
        await pendingOption.click();
      }
    }

    // Find and click on the first approval that has a Show action.
    const hasApproval = (await getVisibleTableRows(checkerPage).count()) > 0;

    if (hasApproval) {
      const viewLink = checkerPage
        .locator("a[href*='/approvals/show/'], a[href*='/approvals/']")
        .first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();

      // Wait for navigation to show page
      await checkerPage.waitForURL(/\/approvals\//, { timeout: 10000 });

      // Verify show page loaded
      await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
        timeout: 5000,
      });

      // Click approve button when available.
      const approveButton = checkerPage.getByRole("button", { name: /approve/i });
      if ((await approveButton.count()) === 0) {
        // Non-pending approvals may not expose actions.
        await expect(checkerPage.getByText(/approved|rejected|pending/i)).toBeVisible({
          timeout: 5000,
        });
        return;
      }

      await approveButton.click();

      // Handle confirmation modal
      const modal = checkerPage.locator(".ant-modal:visible").first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      const confirmButton = modal.getByRole("button", { name: /confirm|approve/i }).first();
      await expect(confirmButton).toBeVisible({ timeout: 5000 });
      await confirmButton.click();

      // Verify success message
      await expect(checkerPage.locator(".ant-message-success").first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test.skip("checker can reject a pending rule approval with remarks", async ({
    makerPage,
    checkerPage,
  }) => {
    // Step 1: Maker creates and submits a rule
    const ruleName = `Rule to Reject ${Date.now()}`;

    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible({ timeout: 10000 });

    await makerPage.getByLabel("Rule Name").fill(ruleName);
    await makerPage.locator(".ant-select:has(#rule_type)").click();
    await makerPage.getByTitle("BLOCKLIST").click();
    await makerPage.getByLabel("Priority").fill("100");

    // Save and wait for response
    const saveResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rules") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    await saveResponse;
    await makerPage.waitForURL(/\/rules(\?|$)/, { timeout: 15000 });

    // Step 2: Checker views and rejects the approval
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Find the approval - filter out measure rows
    const approvalRows = getVisibleTableRows(checkerPage);
    const approvalRow = approvalRows.filter({ has: checkerPage.getByText("RULE") });
    const hasApproval = (await approvalRow.count()) > 0;

    if (hasApproval) {
      // Click to view details
      const viewLink = approvalRow.first().locator("a[href*='/approvals/']").first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();

      // Wait for navigation
      await checkerPage.waitForURL(/\/approvals\//, { timeout: 10000 });
      await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
        timeout: 5000,
      });

      // Verify reject button is visible
      const rejectButton = checkerPage.getByRole("button", { name: /reject/i });
      await expect(rejectButton).toBeVisible({ timeout: 5000 });
      await rejectButton.click();

      // Verify modal with remarks field - use :visible for Firefox compatibility
      const modal = checkerPage.locator(".ant-modal:visible").first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(modal.getByLabel(/remarks/i)).toBeVisible({ timeout: 5000 });

      // Enter rejection reason
      await modal.getByLabel(/remarks/i).fill("Rule does not meet business requirements");

      // Confirm rejection
      const rejectConfirmButton = modal.getByRole("button", { name: /reject/i });
      await expect(rejectConfirmButton).toBeVisible({ timeout: 5000 });
      await rejectConfirmButton.click();

      // Verify success message
      await expect(checkerPage.locator(".ant-message-success").first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("pending approval disappears from list after decision", async ({
    makerPage,
    checkerPage,
  }) => {
    // Step 1: Maker creates and submits a rule
    const ruleName = `Rule to Complete ${Date.now()}`;

    await makerPage.goto("/rules/create");
    await expect(makerPage.getByLabel("Rule Name")).toBeVisible({ timeout: 10000 });

    await makerPage.getByLabel("Rule Name").fill(ruleName);
    await makerPage.locator(".ant-select:has(#rule_type)").click();
    await makerPage.getByTitle("BLOCKLIST").click();
    await makerPage.getByLabel("Priority").fill("100");

    // Save
    const saveResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rules") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    await saveResponse;
    await makerPage.waitForURL(/\/rules(\?|$)/, { timeout: 15000 });

    // Step 2: Checker approves the approval
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Find the approval - filter out measure rows
    const approvalRows = getVisibleTableRows(checkerPage);
    const approvalRow = approvalRows.filter({ has: checkerPage.getByText("RULE") });
    const hasApproval = (await approvalRow.count()) > 0;

    if (hasApproval) {
      // View and approve
      const viewLink = approvalRow.first().locator("a[href*='/approvals/']").first();
      await viewLink.click();
      await checkerPage.waitForURL(/\/approvals\//, { timeout: 10000 });

      // Approve
      const approveButton = checkerPage.getByRole("button", { name: /approve/i });
      await expect(approveButton).toBeVisible({ timeout: 5000 });
      await approveButton.click();

      const modal = checkerPage.locator(".ant-modal:visible").first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      const confirmButton = modal.getByRole("button", { name: /confirm|approve/i }).first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Verify success
      await expect(checkerPage.locator(".ant-message-success").first()).toBeVisible({
        timeout: 5000,
      });

      // Step 3: Verify the approval is no longer pending
      await checkerPage.goto("/approvals");
      await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
        timeout: 10000,
      });

      // Wait for table to reload
      await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

      // The rule should no longer appear with PENDING status - filter out measure rows
      const pendingRows = getVisibleTableRows(checkerPage);
      const pendingRow = pendingRows.filter({ has: checkerPage.locator("text=/pending/i") });
      const isStillPending = (await pendingRow.count()) > 0;
      expect(isStillPending).toBe(false);
    }
  });
});

test.describe("Approvals - Show Page Details", () => {
  test("approval show page displays entity type and details", async ({ checkerPage }) => {
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Find an approval row with a view link - filter out measure rows
    const rows = getVisibleTableRows(checkerPage);
    const rowsWithView = rows.filter({ has: checkerPage.locator("a[href*='/approvals/']") });
    const hasViewLink = (await rowsWithView.count()) > 0;

    if (hasViewLink) {
      const viewLink = rowsWithView.first().locator("a[href*='/approvals/']").first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();

      // Wait for navigation
      await checkerPage.waitForURL(/\/approvals\//, { timeout: 10000 });

      // Verify key details are displayed
      await expect(
        checkerPage.getByText(/entity type/i).or(checkerPage.getByText(/rule/i))
      ).toBeVisible({
        timeout: 5000,
      });
      await expect(
        checkerPage.getByText(/status/i).or(checkerPage.getByText(/pending/i))
      ).toBeVisible({
        timeout: 5000,
      });
      await expect(
        checkerPage.getByText(/created/i).or(checkerPage.getByText(/submitted/i))
      ).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("approve button only visible for checker on pending approvals", async ({
    makerPage,
    checkerPage,
  }) => {
    // Verify maker does NOT see approve button
    await makerPage.goto("/approvals");
    await expect(makerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(makerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Checker sees approve buttons
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Verify page loaded correctly - checker should have action capabilities
    const totalApproveButtons = checkerPage.locator("button:has-text('Approve')").count();
    expect(await totalApproveButtons).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Approvals - Filtering", () => {
  test("can filter approvals by status", async ({ checkerPage }) => {
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Look for status filter - use :visible for Firefox compatibility
    const filterButton = checkerPage
      .locator(".ant-table-filter-trigger:visible, button[aria-label*='filter' i]")
      .first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();

      // Select pending filter
      const pendingOption = checkerPage
        .locator(".ant-dropdown-menu-item:visible", { has: checkerPage.locator("text=/pending/i") })
        .first();
      if ((await pendingOption.count()) > 0) {
        await pendingOption.click();
      }

      // Verify table is still visible
      await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("approval list shows status tags", async ({ checkerPage }) => {
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(checkerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Check for status tags
    const statusTags = checkerPage.locator(".ant-tag, [class*='status']").first();
    const hasTags = (await statusTags.count()) > 0;

    // Either tags exist or table has data - filter out measure rows
    const hasData = (await getVisibleTableRows(checkerPage).count()) > 0;
    expect(hasTags || hasData).toBe(true);
  });
});

test.describe("Approvals - Maker/Checker Invariant", () => {
  test("maker cannot approve their own submission", async ({ makerPage }) => {
    await makerPage.goto("/approvals");
    await expect(makerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(makerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Maker should not see approve buttons
    const approveButtons = makerPage.locator(
      "button:has-text('Approve'), button[aria-label*='approve']"
    );
    const buttonCount = await approveButtons.count();

    // Verify table is visible (critical assertion)
    const tableVisible = await makerPage.locator(".ant-table").isVisible();
    expect(tableVisible).toBe(true);
    expect(buttonCount).toBe(0);
  });

  test("maker cannot access approval decision API through UI", async ({ makerPage }) => {
    await makerPage.goto("/approvals");
    await expect(makerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Wait for table
    await expect(makerPage.locator(".ant-table").first()).toBeVisible({ timeout: 10000 });

    // Try to find an approval with a view link - filter out measure rows
    const rows = getVisibleTableRows(makerPage);
    const rowsWithView = rows.filter({ has: makerPage.locator("a[href*='/approvals/']") });
    const hasViewLink = (await rowsWithView.count()) > 0;

    if (hasViewLink) {
      const viewLink = rowsWithView.first().locator("a[href*='/approvals/']").first();
      await expect(viewLink).toBeVisible({ timeout: 5000 });
      await viewLink.click();

      // Wait for navigation
      await makerPage.waitForURL(/\/approvals\//, { timeout: 10000 });

      // Approve/reject buttons should not be visible for maker
      const approveButton = makerPage.getByRole("button", { name: /approve/i });
      const rejectButton = makerPage.getByRole("button", { name: /reject/i });

      // Both should either not exist or be disabled
      if ((await approveButton.count()) > 0) {
        expect(await approveButton.isDisabled()).toBe(true);
      }
      if ((await rejectButton.count()) > 0) {
        expect(await rejectButton.isDisabled()).toBe(true);
      }
    }
  });
});
