/**
 * Tests for ApprovalList component
 *
 * Covers:
 * - Basic rendering
 * - Table structure
 * - Component structure
 */

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { ApprovalList } from "../list";

describe("ApprovalList", () => {
  it("renders the list component", async () => {
    render(<ApprovalList />);

    // The List component should be present
    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders search form inputs", async () => {
    render(<ApprovalList />);

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText("Search by entity ID")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders table component", async () => {
    render(<ApprovalList />);

    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<ApprovalList />);

    expect(container).toBeInTheDocument();
  });

  it("maintains structure after re-render", async () => {
    const { rerender } = render(<ApprovalList />);

    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    rerender(<ApprovalList />);

    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
