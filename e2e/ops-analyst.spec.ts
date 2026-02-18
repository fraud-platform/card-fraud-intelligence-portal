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
    await filter.click();
    await expect(analystPage.getByText("HIGH")).toBeVisible();
  });
});
