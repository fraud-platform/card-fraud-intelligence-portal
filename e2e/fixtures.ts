/**
 * Playwright Test Fixtures with Auth0 Authentication
 *
 * Provides extended test fixtures with automatic authentication.
 * Use these fixtures instead of default @playwright/test fixtures.
 *
 * Usage:
 * ```ts
 * import { test, expect } from './fixtures';
 *
 * test('authenticated user can create rules', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/rules/create');
 *   // User is already logged in!
 * });
 * ```
 */

import { test as base, Page, BrowserContext } from "@playwright/test";
import {
  authenticateWithAuth0,
  createAuthenticatedPage,
  hasRole,
  getUserRoles,
  logout,
} from "./auth-helper";

type AuthFixtures = {
  authenticatedPage: Page;
  makerPage: Page;
  checkerPage: Page;
  context: BrowserContext;
};

// Helper to create authenticated page with role
async function makeAuthenticatedPage(
  context: BrowserContext,
  role: "maker" | "checker" | "admin"
): Promise<Page> {
  return createAuthenticatedPage(context, role);
}

/**
 * Extended test fixture with authentication support
 */
export const test = base.extend<AuthFixtures>({
  // Standard context (from Playwright)
  context: async ({ context }, use) => {
    await use(context);
  },

  // Authenticated page (any role)
  authenticatedPage: async ({ context }, use) => {
    const page = await makeAuthenticatedPage(context, "maker");
    await use(page);
    await page.close();
  },

  // Page authenticated as MAKER
  makerPage: async ({ context }, use) => {
    const page = await makeAuthenticatedPage(context, "maker");
    await use(page);
    await page.close();
  },

  // Page authenticated as CHECKER
  checkerPage: async ({ context }, use) => {
    const page = await makeAuthenticatedPage(context, "checker");
    await use(page);
    await page.close();
  },
});

/**
 * Re-export everything from @playwright/test
 */
export { expect } from "@playwright/test";
export type { Page, BrowserContext, Locator } from "@playwright/test";
