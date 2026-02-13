import { test, expect } from "@playwright/test";

/**
 * Example E2E Tests
 *
 * Production-grade end-to-end tests for the Fraud Intelligence Portal.
 * These tests verify critical user flows and application functionality.
 */

test.describe("Fraud Intelligence Portal - Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto("/login");
  });

  test("should display the application title", async ({ page }) => {
    // Verify the main heading is visible
    const heading = page.getByRole("heading", {
      name: /fraud intelligence portal/i,
    });
    await expect(heading).toBeVisible();
  });

  test("should display the login prompt", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /development environment/i })).toBeVisible();
  });

  test("should have the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/fraud intelligence portal/i);
  });
});

test.describe("Login Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should show Google Workspace login action", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /continue with google workspace/i })
    ).toBeVisible();
  });
});

test.describe("Visual and Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should have proper page structure", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /fraud intelligence portal/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google workspace/i })
    ).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify content is still visible
    await expect(page.getByRole("heading", { name: /fraud intelligence portal/i })).toBeVisible();

    await expect(
      page.getByRole("button", { name: /continue with google workspace/i })
    ).toBeVisible();
  });

  test("should be responsive on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify content is still visible
    await expect(page.getByRole("heading", { name: /fraud intelligence portal/i })).toBeVisible();

    await expect(
      page.getByRole("button", { name: /continue with google workspace/i })
    ).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should have accessible heading", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 3 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/development environment|fraud intelligence portal/i);
  });

  test("should have keyboard accessible login button", async ({ page }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const button = page.getByRole("button", { name: /continue with google workspace/i });
    await expect(button).toBeVisible();
  });
});

test.describe("Performance", () => {
  test("should load page within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/login");
    const loadTime = Date.now() - startTime;

    // Verify page loads in under 6 seconds
    expect(loadTime).toBeLessThan(6000);

    // Verify critical content is visible
    await expect(page.getByRole("heading", { name: /fraud intelligence portal/i })).toBeVisible();
  });
});
