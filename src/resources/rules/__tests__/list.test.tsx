/**
 * Tests for RuleList component
 */

import { describe, it, expect } from "vitest";
import { render, waitFor } from "@/test/utils";
import { RuleList } from "../list";

describe("RuleList", () => {
  it("renders the list component", async () => {
    render(<RuleList />);

    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders table component", async () => {
    render(<RuleList />);

    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<RuleList />);
    expect(container).toBeInTheDocument();
  });
});
