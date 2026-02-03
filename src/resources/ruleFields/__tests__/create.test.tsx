/**
 * Tests for RuleFieldCreate component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleFieldCreate } from "../create";

describe("RuleFieldCreate", () => {
  it("renders the create form", async () => {
    render(<RuleFieldCreate />);

    await waitFor(
      () => {
        const formElement = document.querySelector(".ant-form");
        expect(formElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders page header", async () => {
    render(<RuleFieldCreate />);

    await waitFor(
      () => {
        const headerElement = document.querySelector(".ant-page-header");
        expect(headerElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleFieldCreate />);
    expect(container).toBeInTheDocument();
  });
});
