/**
 * Tests for RuleSetShow component
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, waitFor, screen } from "@/test/utils";
import { Routes, Route } from "react-router";
import { RuleSetShow } from "../show";
import * as httpClient from "../../../api/httpClient";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("RuleSetShow", () => {
  it("renders the show page loading and then details from API", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValue({
      ruleset: {
        ruleset_id: "rs_test",
        scope_id: "SCOPE",
        rule_type: "POSITIVE",
        version: 1,
        status: "ACTIVE",
        created_at: "now",
      },
      rules: [
        {
          rule_version_id: "rv_test",
          rule_id: "rule_001",
          rule_name: "R1",
          version: 1,
          condition_tree: { and: [] },
          priority: 1,
          created_by: "u",
          created_at: "now",
          status: "APPROVED",
        },
      ],
    } as any);

    render(
      <Routes>
        <Route path="/rulesets/show/:id" element={<RuleSetShow />} />
      </Routes>,
      { initialRoute: "/rulesets/show/rs_test" }
    );

    // ensure our mocked API call was invoked
    await waitFor(
      () => {
        expect(httpClient.get).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Check for rendered details - use stable labels rather than header which can vary
    await waitFor(
      () => {
        expect(screen.getByText("RuleSet ID")).toBeInTheDocument();
        expect(screen.getByText("rs_test")).toBeInTheDocument();
        expect(screen.getByText("R1")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(
      <Routes>
        <Route path="/rulesets/show/:id" element={<RuleSetShow />} />
      </Routes>,
      { initialRoute: "/rulesets/show/test-id" }
    );

    expect(container).toBeInTheDocument();
  });
});
