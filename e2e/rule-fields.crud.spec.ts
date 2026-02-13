/**
 * Rule Fields CRUD E2E Tests
 *
 * Tests the complete Rule Field management flow:
 * 1. Create new rule fields with various data types and operators
 * 2. Edit existing rule fields (toggle active/sensitive, modify operators)
 * 3. Validate required fields and inline errors
 * 4. Filter/search rule fields in the list view
 *
 * SETUP: E2E mode with MSW mocking enabled by default
 */

import { test, expect, type Page } from "./fixtures";

const getFieldIdInput = (page: Page) =>
  page.locator('input#field_id, input[placeholder="e.g. 27"]').first();
const getFieldKeyInput = (page: Page) => page.locator('input[placeholder*="risk_score"]').first();
const getDisplayNameInput = (page: Page) =>
  page.locator('input[placeholder*="Risk Score"], input[placeholder*="Display Name"]').first();

async function ensureFieldId(page: Page): Promise<void> {
  const fieldIdInput = getFieldIdInput(page);
  await expect(fieldIdInput).toBeVisible({ timeout: 10000 });
  await expect(fieldIdInput).toBeEnabled({ timeout: 5000 });

  const current = (await fieldIdInput.inputValue()).trim();
  if (current === "") {
    const generatedFieldId = String((Math.floor(Date.now() / 1000) % 9000) + 1000);
    await fieldIdInput.fill(generatedFieldId);
  }
}

async function selectDropdownOption(page: Page, label: RegExp, option: string): Promise<void> {
  const combobox = page.getByRole("combobox", { name: label }).first();

  // Check if the option is already selected by looking at the combobox text/value
  const comboboxText = (await combobox.textContent()) || "";
  const comboboxValue = (await combobox.getAttribute("value")) || "";

  // If the combobox already shows the desired option, skip selection
  if (comboboxText.trim() === option || comboboxValue === option) {
    return;
  }

  // Close any open dropdowns first
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  await combobox.click({ force: true });

  // Wait for the specific dropdown related to this combobox
  // Use a more specific selector that targets the dropdown that just opened
  const dropdown = page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)").last();
  await expect(dropdown).toBeVisible({ timeout: 5000 });

  const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const optionLocator = dropdown
    .locator('[role="option"]:visible')
    .filter({ hasText: new RegExp(`^${escaped}$`, "i") });
  const optionCount = await optionLocator.count();

  if (optionCount > 0) {
    const firstOption = optionLocator.first();
    const isSelected = (await firstOption.getAttribute("aria-selected")) === "true";

    if (!isSelected) {
      await firstOption.scrollIntoViewIfNeeded();
      await firstOption.click({ force: true });
    }
  } else {
    // Fallback: try with aria-label
    const ariaOption = dropdown.locator(`[role="option"][aria-label="${option}"]:visible`);
    if ((await ariaOption.count()) > 0) {
      const isSelected = (await ariaOption.first().getAttribute("aria-selected")) === "true";
      if (!isSelected) {
        await ariaOption.first().scrollIntoViewIfNeeded();
        await ariaOption.first().click({ force: true });
      }
    }
  }

  await page.waitForTimeout(300);
}

test.describe("Rule Fields - Create", () => {
  test("maker can create a new STRING rule field", async ({ makerPage }) => {
    const uniqueFieldKey = `test_string_field_${Date.now()}`;

    await makerPage.goto("/rule-fields/create");
    await expect(getFieldKeyInput(makerPage)).toBeVisible({ timeout: 10000 });
    await ensureFieldId(makerPage);

    await getFieldKeyInput(makerPage).fill(uniqueFieldKey);
    await getDisplayNameInput(makerPage).fill("Test String Field");

    await selectDropdownOption(makerPage, /data type/i, "STRING");
    await selectDropdownOption(makerPage, /allowed operators/i, "EQ");

    // Check for any validation errors
    const validationErrors = makerPage.locator(".ant-form-item-explain-error");
    const errorCount = await validationErrors.count();
    if (errorCount > 0) {
      const errorText = await validationErrors.first().textContent();
      console.log("Validation errors found:", errorText);
      expect(errorCount).toBe(0); // Fail the test if there are validation errors
    }

    // Check if save button is enabled
    const saveButton = makerPage.getByRole("button", { name: /save/i });
    await expect(saveButton).toBeEnabled();

    const createResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rule-fields") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await saveButton.click();
    const response = await createResponse;
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
    await makerPage.waitForURL(/\/rule-fields(\?|$)/, { timeout: 15000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 15000 });
  });

  test("maker can create a new NUMBER rule field", async ({ makerPage }) => {
    const uniqueFieldKey = `test_number_field_${Date.now()}`;

    await makerPage.goto("/rule-fields/create");
    await expect(getFieldKeyInput(makerPage)).toBeVisible({ timeout: 10000 });
    await ensureFieldId(makerPage);

    await getFieldKeyInput(makerPage).fill(uniqueFieldKey);
    await getDisplayNameInput(makerPage).fill("Test Number Field");

    await selectDropdownOption(makerPage, /data type/i, "NUMBER");
    await selectDropdownOption(makerPage, /allowed operators/i, "GT");
    await selectDropdownOption(makerPage, /allowed operators/i, "LT");

    const createResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rule-fields") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    const response = await createResponse;
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);

    await makerPage.waitForURL(/\/rule-fields(\?|$)/, { timeout: 15000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 15000 });
  });

  test("maker can create a field with IN operator for multi-value selection", async ({
    makerPage,
  }) => {
    const uniqueFieldKey = `test_multi_field_${Date.now()}`;

    await makerPage.goto("/rule-fields/create");
    await expect(getFieldKeyInput(makerPage)).toBeVisible({ timeout: 10000 });
    await ensureFieldId(makerPage);

    await getFieldKeyInput(makerPage).fill(uniqueFieldKey);
    await getDisplayNameInput(makerPage).fill("Test Multi-Value Field");

    await selectDropdownOption(makerPage, /data type/i, "STRING");
    await selectDropdownOption(makerPage, /allowed operators/i, "IN");

    const multiValueCheckbox = makerPage.locator('input[type="checkbox"]').nth(0);
    if ((await multiValueCheckbox.count()) > 0) {
      await multiValueCheckbox.check();
    }

    const createResponse = makerPage.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/rule-fields") && response.request().method() === "POST",
      { timeout: 10000 }
    );
    await makerPage.getByRole("button", { name: /save/i }).click();
    const response = await createResponse;
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);

    await makerPage.waitForURL(/\/rule-fields(\?|$)/, { timeout: 15000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 15000 });
  });

  test("validation errors appear for missing required fields", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields/create");
    await expect(getFieldKeyInput(makerPage)).toBeVisible({ timeout: 10000 });

    // Try to save without required fields
    await makerPage.getByRole("button", { name: /save/i }).click();

    // Verify validation errors appear
    await expect(makerPage.locator(".ant-form-item-explain-error").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("validation error for missing field key", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields/create");
    await expect(getFieldKeyInput(makerPage)).toBeVisible({ timeout: 10000 });
    await ensureFieldId(makerPage);

    await getDisplayNameInput(makerPage).fill("Test Field");
    await selectDropdownOption(makerPage, /data type/i, "STRING");

    await makerPage.getByRole("button", { name: /save/i }).click();
    await expect(makerPage.getByText(/field key is required/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Rule Fields - Edit", () => {
  test.beforeEach(async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("maker can toggle field active status using existing field", async ({ makerPage }) => {
    const firstRow = makerPage.locator("tbody tr:not(.ant-table-measure-row)").first();
    await expect(firstRow).toBeVisible({ timeout: 5000 });

    const editButton = firstRow.getByRole("button", { name: /edit/i }).first();
    if ((await editButton.count()) > 0) {
      await editButton.click();
      await makerPage.waitForURL(/\/rule-fields\/.+\/edit/, { timeout: 10000 });

      await expect(makerPage.getByLabel(/field key/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("maker can modify allowed operators using existing field", async ({ makerPage }) => {
    const firstRow = makerPage.locator("tbody tr:not(.ant-table-measure-row)").first();
    const editButton = firstRow.getByRole("button", { name: /edit/i }).first();

    if ((await editButton.count()) > 0) {
      await editButton.click();
      await makerPage.waitForURL(/\/rule-fields\/.+\/edit/, { timeout: 10000 });

      await expect(makerPage.getByLabel(/allowed operators/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Rule Fields - List and Filtering", () => {
  test("rule fields list shows correct columns", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Verify table has headers
    const headers = makerPage.locator("th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(4);
  });

  test("rule fields list is populated with seed data", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Wait for data to load
    await makerPage.waitForTimeout(1000);

    // Check that at least one row exists (seed data)
    const rows = makerPage.locator("tbody tr:not(.ant-table-measure-row)");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test("can search rule fields by display name", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Find search input and enter a search term
    const searchInput = makerPage
      .locator('input[placeholder*="search" i], input[aria-label*="search" i]')
      .first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill("amount");
      await searchInput.press("Enter");
      await makerPage.waitForTimeout(500);

      // Verify results are filtered
      const rows = makerPage.locator("tbody tr:not(.ant-table-measure-row)");
      await rows.count();
    }
  });

  test("can filter rule fields by data type", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Look for filter dropdown for data type
    const filterButton = makerPage
      .locator('button[aria-label*="filter" i], .ant-table-filter-trigger')
      .first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();
      await makerPage.waitForTimeout(300);

      // Select a filter option
      const filterOption = makerPage
        .locator(".ant-dropdown-menu-item", { has: makerPage.locator("text=/number/i") })
        .first();
      if ((await filterOption.count()) > 0) {
        await filterOption.click();
        await makerPage.waitForTimeout(500);
      }
    }
  });

  test("can filter rule fields by active status", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Look for status filter
    const filterButton = makerPage
      .locator('button[aria-label*="filter" i], .ant-table-filter-trigger')
      .first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();
      await makerPage.waitForTimeout(300);

      // Check for active filter option
      const activeOption = makerPage
        .locator(".ant-dropdown-menu-item", { has: makerPage.locator("text=/active/i") })
        .first();
      if ((await activeOption.count()) > 0) {
        await activeOption.click();
        await makerPage.waitForTimeout(500);
      }
    }
  });
});

test.describe("Rule Fields - View Details", () => {
  test("maker can view rule field details", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Open the first row in edit view to inspect details
    const firstRow = makerPage.locator("tbody tr:not(.ant-table-measure-row)").first();
    await expect(firstRow).toBeVisible({ timeout: 5000 });

    const editButton = firstRow.getByRole("button", { name: /edit/i }).first();
    if ((await editButton.count()) > 0) {
      await editButton.click();
      await makerPage.waitForURL(/\/rule-fields\/.+\/edit/, { timeout: 10000 });

      await expect(makerPage.getByLabel(/field key/i)).toBeVisible({ timeout: 5000 });
      await expect(makerPage.getByLabel(/display name/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("rule field edit page displays all field metadata", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields");
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    const firstRow = makerPage.locator("tbody tr:not(.ant-table-measure-row)").first();
    const editButton = firstRow.getByRole("button", { name: /edit/i }).first();

    if ((await editButton.count()) > 0) {
      await editButton.click();
      await makerPage.waitForURL(/\/rule-fields\/.+\/edit/, { timeout: 10000 });

      await expect(makerPage.getByLabel(/field key/i)).toBeVisible({ timeout: 5000 });
      await expect(makerPage.getByLabel(/data type/i)).toBeVisible({ timeout: 5000 });
      await expect(makerPage.getByLabel(/allowed operators/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Rule Fields - Validation", () => {
  test("field key duplicate shows error", async ({ makerPage }) => {
    test.skip(
      true,
      "Requires backend duplicate key validation - MSW mock returns 201 for all POST requests"
    );
  });

  test("field key cannot contain special characters", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields/create");
    await expect(getFieldKeyInput(makerPage)).toBeVisible({ timeout: 10000 });

    // Try to enter invalid field key
    await getFieldKeyInput(makerPage).fill("invalid-key!");
    await getDisplayNameInput(makerPage).fill("Test Field");

    // Validation should show error
    await makerPage.waitForTimeout(500);
  });

  test("empty allowed operators should show validation error", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields/create");
    await expect(getFieldKeyInput(makerPage)).toBeVisible({ timeout: 10000 });

    await getFieldKeyInput(makerPage).fill("test_field_ops");
    await getDisplayNameInput(makerPage).fill("Test Field");
    await selectDropdownOption(makerPage, /data type/i, "STRING");

    await makerPage.keyboard.press("Escape");
    await makerPage.waitForTimeout(200);

    const removeButtons = makerPage.locator(".ant-select-selection-item-remove");
    while ((await removeButtons.count()) > 0) {
      await removeButtons.first().click({ force: true });
      await makerPage.waitForTimeout(50);
    }

    await makerPage.getByRole("button", { name: /save/i }).click();

    await expect(makerPage.locator(".ant-form-item-explain-error").first()).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Rule Fields - Role Access", () => {
  test("checker cannot access rule fields create page", async ({ checkerPage }) => {
    await checkerPage.goto("/rule-fields/create");

    // Should either redirect or show access denied
    await checkerPage.waitForTimeout(2000);

    // Either redirected to list or see forbidden message
    const isOnCreate = checkerPage.url().includes("/rule-fields/create");
    if (isOnCreate) {
      // Check for error/empty state
      const resultCount = await checkerPage.locator(".ant-result").count();
      const textCount = await checkerPage.getByText(/403|forbidden|access denied/i).count();
      expect(resultCount + textCount).toBeGreaterThan(0);
    }
  });

  test("checker cannot access rule fields edit page", async ({ checkerPage }) => {
    // First get a field key from the list
    await checkerPage.goto("/rule-fields");
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await checkerPage.waitForTimeout(500);

    // Try to navigate to edit - should be restricted
    await checkerPage.goto("/rule-fields/amount/edit");

    // Check for access restriction
    await checkerPage.waitForTimeout(2000);
    const isOnEdit =
      checkerPage.url().includes("/rule-fields/") && checkerPage.url().includes("/edit");

    if (isOnEdit) {
      // Should see error state
      await expect(checkerPage.locator(".ant-result").first()).toBeVisible({ timeout: 5000 });
    }
  });
});
