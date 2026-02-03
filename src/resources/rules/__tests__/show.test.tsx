/**
 * Tests for RuleShow component
 */

import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleShow } from "../show";

vi.mock("@/api/httpClient", () => ({
  get: vi.fn((url: string) => {
    if (url.includes("/summary")) {
      return Promise.resolve({
        rule_id: "rule-123",
        rule_name: "Test Rule",
        rule_type: "AUTH ",
        status: "ACTIVE",
        latest_version: 2,
        latest_version_id: "rv-2",
        priority: 10,
        action: "APPROVE",
      });
    }

    return Promise.resolve({
      rule: {
        rule_id: "rule-123",
        rule_name: "Test Rule",
        rule_type: "AUTH ",
        status: "ACTIVE",
        current_version: 2,
        created_by: "analyst",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
      current_version: {
        rule_version_id: "rv-2",
        rule_id: "rule-123",
        version: 2,
        condition_tree: { and: [] },
        priority: 10,
        scope: null,
        created_by: "analyst",
        created_at: "2026-01-02T00:00:00Z",
        approved_by: "checker",
        approved_at: "2026-01-03T00:00:00Z",
        status: "ACTIVE",
      },
      versions: [
        {
          rule_version_id: "rv-2",
          rule_id: "rule-123",
          version: 2,
          condition_tree: { and: [] },
          priority: 10,
          scope: null,
          created_by: "analyst",
          created_at: "2026-01-02T00:00:00Z",
          approved_by: "checker",
          approved_at: "2026-01-03T00:00:00Z",
          status: "ACTIVE",
        },
      ],
    });
  }),
  post: vi.fn(() => Promise.resolve({ match_count: 0 })),
}));

describe("RuleShow", () => {
  it("renders the show page", async () => {
    render(<RuleShow />, { initialRoute: "/rules/show/test-id" });

    await waitFor(
      () => {
        const pageElement = document.querySelector(".ant-page-header");
        expect(pageElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleShow />, { initialRoute: "/rules/show/test-id" });
    expect(container).toBeInTheDocument();
  });
});
