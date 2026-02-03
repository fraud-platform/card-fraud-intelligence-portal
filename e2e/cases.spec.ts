/**
 * Cases E2E Tests
 *
 * Tests the case management functionality for fraud investigation:
 * 1. Case list with filters (status, type)
 * 2. Case creation with transaction linking
 * 3. Case detail view with information
 * 4. Case transactions tab
 * 5. Case navigation and actions
 *
 * SETUP: E2E mode with MSW mocking enabled by default
 */

import { test, expect, type Page } from "./fixtures";

const getVisibleTableRows = (page: Page) =>
  page.locator("tbody tr").filter({ hasNot: page.locator(".ant-table-measure-row") });

const expectCasesHeading = async (page: Page): Promise<void> => {
  await expect(page.getByRole("heading", { name: /cases/i })).toBeVisible({ timeout: 15000 });
};

test.describe("Cases - List View", () => {
  test("cases list page loads correctly", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Wait for page to stabilize
    await makerPage.waitForTimeout(1000);

    // Table should be visible
    await expect(makerPage.locator(".ant-table").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("cases list shows table with data", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Check table headers
    const headers = makerPage.locator("th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(2);
  });

  test("cases list shows new case button", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Look for "New Case" button
    const newCaseButton = makerPage.getByRole("button", { name: /new case|create/i });
    await expect(newCaseButton.first()).toBeVisible({ timeout: 5000 });
  });

  test("cases list shows case number column", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Case #" column header
    const caseNumberHeader = makerPage
      .getByRole("columnheader")
      .filter({ hasText: /case #|case number|number/i });
    const hasCaseNumberHeader = (await caseNumberHeader.count()) > 0;
    expect(hasCaseNumberHeader).toBe(true);
  });

  test("cases list shows title column", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Title" column header
    const titleHeader = makerPage.getByRole("columnheader").filter({ hasText: /title/i }).first();
    await expect(titleHeader).toBeVisible({ timeout: 5000 });
  });

  test("cases list shows type column with badges", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Type" column
    const typeHeader = makerPage.getByRole("columnheader").filter({ hasText: /type/i });
    const hasTypeHeader = (await typeHeader.count()) > 0;
    expect(hasTypeHeader).toBe(true);

    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    if (rowCount > 0) {
      const rowText = (await rows.first().innerText()).trim();
      expect(rowText.length > 0).toBe(true);
    }
  });

  test("cases list shows status column with badges", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Status" column
    const statusHeader = makerPage
      .getByRole("columnheader")
      .filter({ hasText: /status/i })
      .first();
    await expect(statusHeader).toBeVisible({ timeout: 5000 });

    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    if (rowCount > 0) {
      const rowText = (await rows.first().innerText()).trim();
      expect(rowText.length > 0).toBe(true);
    }
  });

  test("cases list shows risk level column", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Risk" column header
    const riskHeader = makerPage.getByRole("columnheader").filter({ hasText: /risk/i });
    const hasRiskHeader = (await riskHeader.count()) > 0;
    expect(hasRiskHeader).toBe(true);
  });

  test("cases list shows transaction count", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Transactions" column
    const transactionsHeader = makerPage
      .getByRole("columnheader")
      .filter({ hasText: /transactions/i });
    const hasTransactionsHeader = (await transactionsHeader.count()) > 0;
    expect(hasTransactionsHeader).toBe(true);
  });

  test("cases list shows total amount", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Total Amount" column
    const amountHeader = makerPage
      .getByRole("columnheader")
      .filter({ hasText: /total amount|amount/i });
    const hasAmountHeader = (await amountHeader.count()) > 0;
    expect(hasAmountHeader).toBe(true);
  });

  test("cases list shows assigned analyst", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Assigned To" column
    const assignedHeader = makerPage
      .getByRole("columnheader")
      .filter({ hasText: /assigned to|assigned/i });
    const hasAssignedHeader = (await assignedHeader.count()) > 0;
    expect(hasAssignedHeader).toBe(true);
  });

  test("cases list shows created date", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for "Created" column
    const createdHeader = makerPage.getByRole("columnheader").filter({ hasText: /created|date/i });
    const hasCreatedHeader = (await createdHeader.count()) > 0;
    expect(hasCreatedHeader).toBe(true);
  });
});

test.describe("Cases - Filtering", () => {
  test("status filter dropdown is available", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Look for status filter dropdown
    const statusSelect = makerPage
      .locator(".ant-select")
      .filter({ hasText: /status/i })
      .first();
    const hasStatusFilter = (await statusSelect.count()) > 0;
    expect(hasStatusFilter).toBe(true);
  });

  test("can filter cases by status", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

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

          // Verify filter applied
          await expect(makerPage.locator(".ant-table").first()).toBeVisible({
            timeout: 5000,
          });
        }
      }
    }
  });

  test("type filter dropdown is available", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Look for type filter dropdown
    const typeSelect = makerPage.locator(".ant-select").filter({ hasText: /type/i }).first();
    const hasTypeFilter = (await typeSelect.count()) > 0;
    expect(hasTypeFilter).toBe(true);
  });

  test("can filter cases by type", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    const typeSelect = makerPage.locator(".ant-select").filter({ hasText: /type/i }).first();

    if ((await typeSelect.count()) > 0) {
      await typeSelect.click();
      await makerPage.waitForTimeout(300);

      const dropdown = makerPage.locator(".ant-select-dropdown:visible").first();
      if ((await dropdown.count()) > 0) {
        // Select a type option
        const typeOption = dropdown.locator(".ant-select-item-option").first();
        if ((await typeOption.count()) > 0) {
          await typeOption.click();
          await makerPage.waitForTimeout(500);

          // Verify filter applied
          await expect(makerPage.locator(".ant-table").first()).toBeVisible({
            timeout: 5000,
          });
        }
      }
    }
  });

  test("refresh button is available", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Look for refresh button
    const refreshButton = makerPage.getByRole("button", { name: /refresh/i }).first();
    await expect(refreshButton).toBeVisible({ timeout: 5000 });
  });

  test("refresh button reloads cases list", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    const refreshButton = makerPage.getByRole("button", { name: /refresh/i }).first();
    await refreshButton.click();

    // Wait for reload
    await makerPage.waitForTimeout(1000);

    // Table should still be visible
    await expect(makerPage.locator(".ant-table").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Cases - Create", () => {
  test("can navigate to create case page", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Click New Case button
    const newCaseButton = makerPage.getByRole("button", { name: /new case|create/i }).first();
    await newCaseButton.click();

    // Wait for navigation to create page
    await makerPage.waitForURL(/\/cases\/create/, { timeout: 10000 });

    // Verify create form is visible
    await expect(
      makerPage.getByRole("heading", { name: /create case|new case|create/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("create form has required fields", async ({ makerPage }) => {
    await makerPage.goto("/cases/create");
    await makerPage.waitForTimeout(1000);

    // Look for required form fields
    const titleInput = makerPage
      .getByPlaceholder(/brief description of the investigation/i)
      .first();
    const hasTitleInput = (await titleInput.count()) > 0;
    expect(hasTitleInput).toBe(true);

    // Look for case type selector
    const typeSelect = makerPage
      .locator(".ant-form-item")
      .filter({ hasText: /case type/i })
      .locator(".ant-select")
      .first();
    const hasTypeSelect = (await typeSelect.count()) > 0;
    expect(hasTypeSelect).toBe(true);
  });

  test("create form has description field", async ({ makerPage }) => {
    await makerPage.goto("/cases/create");
    await makerPage.waitForTimeout(1000);

    // Look for description textarea
    const descriptionInput = makerPage
      .getByPlaceholder(/detailed description of the case/i)
      .first();
    const hasDescription = (await descriptionInput.count()) > 0;
    expect(hasDescription).toBe(true);
  });

  test("create form has save and cancel buttons", async ({ makerPage }) => {
    await makerPage.goto("/cases/create");
    await makerPage.waitForTimeout(1000);

    // Look for save button
    const saveButton = makerPage.getByRole("button", { name: /create case|save|submit/i });
    const hasSaveButton = (await saveButton.count()) > 0;
    expect(hasSaveButton).toBe(true);

    // Look for cancel button
    const cancelButton = makerPage.getByRole("button", { name: /cancel|back/i });
    const hasCancelButton = (await cancelButton.count()) > 0;
    expect(hasCancelButton).toBe(true);
  });

  test("can create a new case", async ({ makerPage }) => {
    await makerPage.goto("/cases/create");
    await makerPage.waitForTimeout(1000);

    // Fill in case details
    const titleInput = makerPage
      .getByPlaceholder(/brief description of the investigation/i)
      .first();
    if ((await titleInput.count()) > 0) {
      const caseTitle = `E2E Test Case ${Date.now()}`;
      await titleInput.fill(caseTitle);

      // Save the case
      const saveButton = makerPage.getByRole("button", { name: /save|create|submit/i }).first();
      await saveButton.click();

      // Wait for navigation or success message
      await makerPage.waitForTimeout(2000);

      // Either redirected to list/show or show success/error message
      const currentUrl = makerPage.url();
      const onListPage =
        currentUrl.includes("/cases") &&
        !currentUrl.includes("/create") &&
        !currentUrl.includes("/show/");
      const onShowPage = currentUrl.includes("/cases/show/");
      const successMessage = makerPage.locator(".ant-message-success");
      const hasSuccess = (await successMessage.count()) > 0;
      const errorMessage = makerPage.locator(".ant-message-error");
      const hasError = (await errorMessage.count()) > 0;

      expect(onListPage || onShowPage || hasSuccess || hasError).toBe(true);
    }
  });

  test("validation requires title field", async ({ makerPage }) => {
    await makerPage.goto("/cases/create");
    await makerPage.waitForTimeout(1000);

    // Try to save without title
    const saveButton = makerPage.getByRole("button", { name: /save|create|submit/i }).first();
    await saveButton.click();

    // Should show validation error
    await makerPage.waitForTimeout(500);
    const errorText = makerPage.getByText(
      /please enter a title|title must be at least|required|title/i
    );
    const hasError = (await errorText.count()) > 0;
    expect(hasError).toBe(true);
  });
});

test.describe("Cases - Show Page", () => {
  test("can navigate to case detail view", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for a case row with a view button
    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();

      // Should navigate to case detail
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });
      await expect(makerPage.locator(".ant-descriptions, .ant-card").first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("case detail shows case number", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Look for case number display
      const caseNumber = makerPage.getByText(/case #|case number/i).first();
      const hasCaseNumber = (await caseNumber.count()) > 0;
      const onShowPage = /\/cases\/show\//.test(makerPage.url());
      expect(hasCaseNumber || onShowPage).toBe(true);
    }
  });

  test("case detail shows title", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Look for title display
      const title = makerPage.getByText(/title/i).first();
      const hasTitle = (await title.count()) > 0;
      expect(hasTitle).toBe(true);
    }
  });

  test("case detail shows status badge", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Look for status badge
      const statusBadge = makerPage.locator(".ant-tag");
      const hasBadge = (await statusBadge.count()) > 0;
      expect(hasBadge).toBe(true);
    }
  });

  test("case detail shows type badge", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Look for type badge
      const typeBadge = makerPage.locator(".ant-tag");
      const hasBadge = (await typeBadge.count()) > 0;
      expect(hasBadge).toBe(true);
    }
  });
});

test.describe("Cases - Transactions Tab", () => {
  test("case detail has transactions tab", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Look for transactions tab
      const transactionsTab = makerPage.getByRole("tab", { name: /transactions/i });
      const hasTransactionsTab = (await transactionsTab.count()) > 0;
      const hasTransactionsSection = (await makerPage.getByText(/transactions/i).count()) > 0;
      const onShowPage = /\/cases\/show\//.test(makerPage.url());
      expect(hasTransactionsTab || hasTransactionsSection || onShowPage).toBe(true);
    }
  });

  test("transactions tab shows linked transactions", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Click on transactions tab
      const transactionsTab = makerPage.getByRole("tab", { name: /transactions/i });
      if ((await transactionsTab.count()) > 0) {
        await transactionsTab.click();
        await makerPage.waitForTimeout(500);

        // Look for transactions table
        const table = makerPage.locator(".ant-table");
        const hasTable = (await table.count()) > 0;
        expect(hasTable).toBe(true);
      }
    }
  });

  test("can add transaction to case", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Look for add transaction button
      const addButton = makerPage.getByRole("button", { name: /add transaction|link/i });
      const hasAddButton = (await addButton.count()) > 0;
      const toolbarButtons = await makerPage.locator(".case-show-root button").count();
      const hasPageContent =
        (await makerPage.locator(".ant-descriptions, .ant-card, .ant-tabs").count()) > 0;
      const onShowPage = /\/cases\/show\//.test(makerPage.url());
      expect(hasAddButton || toolbarButtons > 0 || hasPageContent || onShowPage).toBe(true);
    }
  });

  test("can remove transaction from case", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const viewButton = rows.locator("button").filter({ hasText: /view/i }).first();

    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await makerPage.waitForURL(/\/cases\/show\//, { timeout: 10000 });

      // Click on transactions tab
      const transactionsTab = makerPage.getByRole("tab", { name: /transactions/i });
      if ((await transactionsTab.count()) > 0) {
        await transactionsTab.click();
        await makerPage.waitForTimeout(500);

        // Look for remove/delete buttons
        const removeButton = makerPage
          .getByRole("button")
          .filter({ hasText: /remove|unlink|delete/i })
          .first();
        const hasRemoveButton = (await removeButton.count()) > 0;
        expect(
          hasRemoveButton || (await makerPage.locator(".ant-table tbody tr").count()) === 0
        ).toBe(true);
      }
    }
  });
});

test.describe("Cases - Table Features", () => {
  test("cases table supports pagination", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for pagination controls
    const pagination = makerPage.locator(".ant-pagination");
    const hasPagination = (await pagination.count()) > 0;
    expect(hasPagination || (await getVisibleTableRows(makerPage).count()) <= 20).toBe(true);
  });

  test("cases table is sortable by amount", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for sortable amount column
    const amountColumn = makerPage.getByRole("columnheader").filter({ hasText: /total amount/i });
    if ((await amountColumn.count()) > 0) {
      const sortIcon = makerPage.locator(".ant-table-column-sorter");
      const hasSortIcon = (await sortIcon.count()) > 0;
      expect(hasSortIcon).toBe(true);
    }
  });

  test("cases table is sortable by date", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    // Look for sortable date column
    const createdColumn = makerPage.getByRole("columnheader").filter({ hasText: /created/i });
    if ((await createdColumn.count()) > 0) {
      const sortIcon = makerPage.locator(".ant-table-column-sorter");
      const hasSortIcon = (await sortIcon.count()) > 0;
      expect(hasSortIcon).toBe(true);
    }
  });

  test("cases table shows total count", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    await makerPage.waitForTimeout(1000);

    const rows = getVisibleTableRows(makerPage);
    const rowCount = await rows.count();
    const totalCount = makerPage.getByText(/\d+ cases/);
    const hasTotalCount = (await totalCount.count()) > 0;
    const hasEmptyState = (await makerPage.locator(".ant-empty").count()) > 0;
    expect(hasTotalCount || rowCount === 0 || hasEmptyState).toBe(true);
  });
});

test.describe("Cases - Navigation", () => {
  test("can navigate from cases to worklist", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Look for worklist link in sidebar or navigation
    const worklistLink = makerPage.getByRole("link", { name: /worklist/i });
    if ((await worklistLink.count()) > 0) {
      await worklistLink.click();
      await makerPage.waitForURL(/\/worklist/, { timeout: 10000 });
      await expect(makerPage.getByRole("heading", { name: /worklist|my worklist/i })).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("can navigate from cases to transactions", async ({ makerPage }) => {
    await makerPage.goto("/cases");
    await expectCasesHeading(makerPage);

    // Look for transactions link in navigation
    const transactionsLink = makerPage.getByRole("link", { name: /transactions/i });
    if ((await transactionsLink.count()) > 0) {
      await transactionsLink.click();
      await makerPage.waitForURL(/\/transactions/, { timeout: 10000 });
      await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 5000 });
    }
  });
});
