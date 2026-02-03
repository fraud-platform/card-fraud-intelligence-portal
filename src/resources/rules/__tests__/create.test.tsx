/**
 * Tests for RuleCreate component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleCreate } from "../create";

describe("RuleCreate", () => {
  it("renders the create form", async () => {
    render(<RuleCreate />);

    await waitFor(
      () => {
        const formElement = document.querySelector(".ant-form");
        expect(formElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders page header", async () => {
    render(<RuleCreate />);

    await waitFor(
      () => {
        const headerElement = document.querySelector(".ant-page-header");
        expect(headerElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleCreate />);
    expect(container).toBeInTheDocument();
  });
});
