/**
 * Tests for RuleEdit component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleEdit } from "../edit";

describe("RuleEdit", () => {
  it("renders the edit form", async () => {
    render(<RuleEdit />, { initialRoute: "/rules/edit/test-id" });

    await waitFor(
      () => {
        const pageElement = document.querySelector(".ant-page-header");
        expect(pageElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleEdit />, { initialRoute: "/rules/edit/test-id" });
    expect(container).toBeInTheDocument();
  });
});
