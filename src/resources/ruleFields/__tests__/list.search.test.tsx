import { describe, it, expect, vi, beforeAll } from "vitest";
// server setup removed - handled globally
import RuleFieldList from "../list";
import { render, screen } from "@/test/utils";
import { realDataProvider } from "@/app/dataProvider";

// Global test setup (src/test/setup.ts) handles MSW lifecycle now.
beforeAll(() => {
  // Use real timers for MSW integration tests
  vi.useRealTimers();
});

describe("RuleFieldList search", () => {
  it("renders the component without crashing", async () => {
    render(<RuleFieldList />, { dataProvider: realDataProvider, initialRoute: "/rule-fields" });

    // Wait for table header to appear to ensure data-provider and MSW have initialized
    const header = await screen.findByText("Field Key");
    expect(header).toBeInTheDocument();
  }, 20000);
});
