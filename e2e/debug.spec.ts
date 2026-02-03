import { test, expect } from "./fixtures";

test("debug: page loads", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/");
  console.log("Page loaded, URL:", authenticatedPage.url());
  expect(await authenticatedPage.title()).toBeTruthy();
});

test("debug: can access rules list", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/rules");
  console.log("Rules page URL:", authenticatedPage.url());

  // Wait a bit
  await authenticatedPage.waitForTimeout(2000);

  // Check if we're still on rules page
  const currentUrl = authenticatedPage.url();
  console.log("Current URL after wait:", currentUrl);
});
