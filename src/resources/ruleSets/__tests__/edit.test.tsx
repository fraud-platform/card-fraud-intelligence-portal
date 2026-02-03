/**
 * Tests for RuleSetEdit component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleSetEdit } from "../edit";

describe("RuleSetEdit", () => {
  it("renders the edit form", async () => {
    render(<RuleSetEdit />, { initialRoute: "/rulesets/edit/test-id" });

    await waitFor(
      () => {
        const pageElement = document.querySelector(".ant-page-header");
        expect(pageElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleSetEdit />, { initialRoute: "/rulesets/edit/test-id" });
    expect(container).toBeInTheDocument();
  });
});
