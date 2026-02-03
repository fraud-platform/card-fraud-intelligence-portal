/**
 * Tests for RuleSetCreate component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleSetCreate } from "../create";

describe("RuleSetCreate", () => {
  it("renders the create form", async () => {
    render(<RuleSetCreate />);

    await waitFor(
      () => {
        const formElement = document.querySelector(".ant-form");
        expect(formElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders page header", async () => {
    render(<RuleSetCreate />);

    await waitFor(
      () => {
        const headerElement = document.querySelector(".ant-page-header");
        expect(headerElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleSetCreate />);
    expect(container).toBeInTheDocument();
  });
});
