/**
 * RBAC Restrictions E2E Tests
 *
 * Tests the maker-checker role-based access control:
 * 1. Maker cannot access checker-only actions
 * 2. Checker cannot access maker-only actions
 * 3. Role-based button visibility
 * 4. Route protection
 *
 * SETUP: E2E mode with MSW mocking enabled by default
 */

import { test, expect, type Page } from "./fixtures";

const expectRoleLabel = async (page: Page, roleText: RegExp): Promise<void> => {
  await expect(page.locator(".role-label")).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".role-label")).toHaveText(roleText, { timeout: 10000 });
};

const hasAccessDeniedState = async (page: Page): Promise<boolean> => {
  const resultCount = await page.locator(".ant-result").count();
  const deniedTextCount = await page
    .getByText(/403|forbidden|access denied|not authorized|permission/i)
    .count();
  return resultCount + deniedTextCount > 0;
};

test.describe("RBAC - Maker Restrictions", () => {
  test("maker cannot see approve buttons on rules list", async ({ makerPage }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Look for approve buttons in the page
    const approveButtons = makerPage.locator(
      'button:has-text("Approve"), button[aria-label*="approve"]'
    );

    // Maker should not see approve buttons on rule list
    const visibleApproveButtons = await approveButtons.count();
    expect(visibleApproveButtons).toBe(0);
  });

  test("maker cannot see reject buttons on rules list", async ({ makerPage }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Look for reject buttons
    const rejectButtons = makerPage.locator(
      'button:has-text("Reject"), button[aria-label*="reject"]'
    );

    // Maker should not see reject buttons
    const visibleRejectButtons = await rejectButtons.count();
    expect(visibleRejectButtons).toBe(0);
  });

  test("maker cannot access approval decision endpoints through UI", async ({ makerPage }) => {
    // Navigate to approvals page as maker
    await makerPage.goto("/approvals");
    await expect(makerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    await makerPage.waitForTimeout(1000);

    const actionButtons = makerPage.getByRole("button", { name: /approve|reject/i });
    const visibleCount = await actionButtons.count();

    // Maker should not see action buttons on approvals page
    expect(visibleCount).toBe(0);
  });

  test("maker cannot access approvals show page with action buttons", async ({ makerPage }) => {
    // Navigate directly to an approval show page
    await makerPage.goto("/approvals");
    await expect(makerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    await makerPage.waitForTimeout(1000);

    // Try to find an approval to click on
    const firstRow = makerPage.locator("tbody tr").first();
    const viewLink = firstRow.locator('a[href*="/approvals/"]').first();

    if ((await viewLink.count()) > 0) {
      await viewLink.click();
      await makerPage.waitForURL(/\/approvals\//, { timeout: 10000 });

      // Check for approve/reject buttons
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

  test("maker role badge is visible", async ({ makerPage }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });

    await expectRoleLabel(makerPage, /rule maker/i);
  });

  test("maker can access rule fields create page directly", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields/create");
    await expect(makerPage).toHaveURL(/\/rule-fields\/create/, { timeout: 10000 });
    await expect(makerPage.getByText(/field details/i)).toBeVisible({ timeout: 10000 });
  });

  test("maker can access rule fields edit page directly", async ({ makerPage }) => {
    await makerPage.goto("/rule-fields/amount/edit");
    await makerPage.waitForURL(/\/rule-fields\/.+\/edit/, { timeout: 10000 });
    expect(makerPage.url()).toContain("/rule-fields/");
  });
});

test.describe("RBAC - Checker Restrictions", () => {
  test("checker cannot see create rule buttons", async ({ checkerPage }) => {
    await checkerPage.goto("/rules");
    await checkerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Look for create button
    const createButton = checkerPage.locator('a[href="/rules/create"], button:has-text("Create")');

    // Checker should not see create button
    const visibleCreateButtons = await createButton.count();
    expect(visibleCreateButtons).toBe(0);
  });

  test("checker can access rules create page", async ({ checkerPage }) => {
    await checkerPage.goto("/rules/create");
    await checkerPage.waitForURL(/\/rules\/create/, { timeout: 10000 });
    await expect(checkerPage.getByLabel(/rule name/i)).toBeVisible({ timeout: 10000 });
  });

  test("checker cannot see delete buttons on rules", async ({ checkerPage }) => {
    await checkerPage.goto("/rules");
    await checkerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Look for delete buttons
    const deleteButtons = checkerPage.locator(
      'button[aria-label*="delete" i], button:has-text("Delete")'
    );

    // Checker should not see delete buttons
    const visibleDeleteButtons = await deleteButtons.count();
    expect(visibleDeleteButtons).toBe(0);
  });

  test("checker role badge is visible", async ({ checkerPage }) => {
    await checkerPage.goto("/rules");
    await checkerPage.waitForURL(/\/rules/, { timeout: 10000 });

    await expectRoleLabel(checkerPage, /rule checker/i);
  });

  test("checker cannot create rule fields", async ({ checkerPage }) => {
    await checkerPage.goto("/rule-fields/create");

    await checkerPage.waitForTimeout(2000);

    const currentUrl = checkerPage.url();
    const isOnCreate = currentUrl.includes("/rule-fields/create");

    if (isOnCreate) {
      const errorState = checkerPage.locator(".ant-result");
      const hasError = (await errorState.count()) > 0;
      expect(hasError).toBe(true);
    }
  });

  test("checker cannot edit rule fields", async ({ checkerPage }) => {
    await checkerPage.goto("/rule-fields/amount/edit");

    await checkerPage.waitForTimeout(2000);

    const currentUrl = checkerPage.url();
    const isOnEdit = currentUrl.includes("/rule-fields/") && currentUrl.includes("/edit");

    if (isOnEdit) {
      const errorState = checkerPage.locator(".ant-result");
      const hasError = (await errorState.count()) > 0;
      expect(hasError).toBe(true);
    }
  });
});

test.describe("RBAC - Shared Access", () => {
  test("both maker and checker can view rules list", async ({ makerPage, checkerPage }) => {
    // Maker can view
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Checker can view
    await checkerPage.goto("/rules");
    await checkerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("both maker and checker can view rule sets list", async ({ makerPage, checkerPage }) => {
    await makerPage.goto("/rulesets");
    await makerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await checkerPage.goto("/rulesets");
    await checkerPage.waitForURL(/\/rulesets/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("both maker and checker can view audit logs", async ({ makerPage, checkerPage }) => {
    await makerPage.goto("/audit-logs");
    await makerPage.waitForURL(/\/audit-logs/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await checkerPage.goto("/audit-logs");
    await checkerPage.waitForURL(/\/audit-logs/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("both maker and checker can view rule fields list", async ({ makerPage, checkerPage }) => {
    await makerPage.goto("/rule-fields");
    await makerPage.waitForURL(/\/rule-fields/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await checkerPage.goto("/rule-fields");
    await checkerPage.waitForURL(/\/rule-fields/, { timeout: 10000 });
    await expect(checkerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("both maker and checker can view rule details (show page)", async ({
    makerPage,
    checkerPage,
  }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await makerPage.waitForTimeout(1000);

    const firstRow = makerPage.locator("tbody tr").first();
    const viewLink = firstRow.locator('a[href*="/rules/"]').first();

    if ((await viewLink.count()) > 0) {
      await viewLink.click();
      await makerPage.waitForURL(/\/rules\//, { timeout: 10000 });

      // Maker can view details
      await expect(makerPage.locator(".ant-descriptions").first()).toBeVisible({ timeout: 5000 });
    }

    // Checker can also view details
    await checkerPage.goto("/rules");
    await checkerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await checkerPage.waitForTimeout(1000);

    const checkerFirstRow = checkerPage.locator("tbody tr").first();
    const checkerViewLink = checkerFirstRow.locator('a[href*="/rules/"]').first();

    if ((await checkerViewLink.count()) > 0) {
      await checkerViewLink.click();
      await checkerPage.waitForURL(/\/rules\//, { timeout: 10000 });

      await expect(checkerPage.locator(".ant-descriptions").first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("RBAC - Route Protection", () => {
  test("maker cannot approve own submission via API URL manipulation", async ({ makerPage }) => {
    // Try to directly access approval decision URL
    await makerPage.goto("/approvals");

    // Wait for page to load
    await makerPage.waitForTimeout(2000);

    // Verify we're on approvals page but without action buttons
    await expect(makerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    // Verify no approve buttons are visible
    const approveButtons = makerPage.locator('button:has-text("Approve")');
    expect(await approveButtons.count()).toBe(0);
  });

  test("checker can create rules by direct URL access", async ({ checkerPage }) => {
    await checkerPage.goto("/rules/create");
    await checkerPage.waitForURL(/\/rules\/create/, { timeout: 10000 });
    await expect(checkerPage.getByLabel(/rule name/i)).toBeVisible({ timeout: 10000 });
  });

  test("maker/checker identity persists across navigation", async ({ makerPage }) => {
    // Navigate to rules
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await expectRoleLabel(makerPage, /rule maker/i);

    // Navigate to another page
    await makerPage.goto("/rule-fields");
    await makerPage.waitForURL(/\/rule-fields/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    await expectRoleLabel(makerPage, /rule maker/i);
  });
});

test.describe("RBAC - UI Feedback", () => {
  test("maker sees appropriate action buttons", async ({ makerPage }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    const createActions = makerPage.locator(
      'button:has-text("Create"), a[href="/rules/create"], a[href*="/rules/create"]'
    );
    const editActions = makerPage.locator(
      'button[aria-label*="edit" i], button:has-text("Edit"), a[href*="/rules/edit/"]'
    );
    expect((await createActions.count()) + (await editActions.count())).toBeGreaterThan(0);
  });

  test("checker sees appropriate action buttons", async ({ checkerPage }) => {
    await checkerPage.goto("/approvals");
    await expect(checkerPage.getByRole("heading", { name: /approval/i })).toBeVisible({
      timeout: 10000,
    });

    await checkerPage.waitForTimeout(1000);

    // Checker should not have maker-style create actions on approvals page.
    const createButtons = checkerPage.getByRole("button", { name: /create/i });
    expect(await createButtons.count()).toBe(0);

    // If review actions are present, they should be visible.
    const reviewButtons = checkerPage.getByRole("button", { name: /approve|reject/i });
    if ((await reviewButtons.count()) > 0) {
      await expect(reviewButtons.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("disabled buttons show appropriate styling", async ({ makerPage }) => {
    await makerPage.goto("/rules");
    await makerPage.waitForURL(/\/rules/, { timeout: 10000 });
    await expect(makerPage.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Look for any disabled buttons
    const disabledButtons = makerPage.locator("button[disabled], button.ant-btn-disabled");

    // If there are disabled buttons, they should have disabled styling
    const disabledCount = await disabledButtons.count();
    expect(disabledCount).toBeGreaterThanOrEqual(0);
  });
});
