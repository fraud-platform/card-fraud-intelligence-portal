/**
 * Tests for RuleFieldEdit component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleFieldEdit } from "../edit";

describe("RuleFieldEdit", () => {
  it("renders the edit form", async () => {
    render(<RuleFieldEdit />, { initialRoute: "/rule-fields/edit/test-id" });

    await waitFor(
      () => {
        const pageElement = document.querySelector(".ant-page-header");
        expect(pageElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleFieldEdit />, { initialRoute: "/rule-fields/edit/test-id" });
    expect(container).toBeInTheDocument();
  });
});
