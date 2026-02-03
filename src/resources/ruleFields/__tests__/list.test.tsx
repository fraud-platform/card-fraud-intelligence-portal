/**
 * Tests for RuleFieldList component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleFieldList } from "../list";

describe("RuleFieldList", () => {
  it("renders the list component", async () => {
    render(<RuleFieldList />);

    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders table component", async () => {
    render(<RuleFieldList />);

    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleFieldList />);
    expect(container).toBeInTheDocument();
  });
});
