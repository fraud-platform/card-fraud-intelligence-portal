import { test, expect } from "./fixtures";

test.describe("Ops Analyst - Recommendation Queue", () => {
  test("shows recommendation queue page", async ({ analystPage }) => {
    await analystPage.goto("/ops-analyst/recommendations");
    await expect(analystPage.getByRole("heading", { name: "AI Recommendations" })).toBeVisible();

    // Check for stats
    await expect(analystPage.locator(".ant-statistic-content-value")).toBeVisible();
  });

  test("can filter recommendations", async ({ analystPage }) => {
    await analystPage.goto("/ops-analyst/recommendations");

    // Check filter exists
    await expect(analystPage.getByText("Filter by severity")).toBeVisible();

    // Interact with filter (mock response is usually simulated via MSW in real app, but here we just check UI presence)
    const filter = analystPage.locator(".ant-select").first();
    await expect(filter).toBeVisible();
    await filter.click();

    const dropdown = analystPage.locator(".ant-select-dropdown").last();
    await expect(dropdown).toBeVisible();
    const options = dropdown.locator(".ant-select-item-option-content");
    await expect(options.first()).toBeVisible();
    await expect(dropdown).toContainText("HIGH");
  });
});
