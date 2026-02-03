/**
 * Tests for AuditLogList component
 *
 * Covers:
 * - Basic rendering
 * - Table structure
 * - Component structure
 */

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { AuditLogList } from "../list";

describe("AuditLogList", () => {
  it("renders the list component", async () => {
    render(<AuditLogList />);

    // The List component should be present
    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 30000);

  it("renders search form inputs", async () => {
    render(<AuditLogList />);

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText("Search by entity ID")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders table component", async () => {
    render(<AuditLogList />);

    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<AuditLogList />);

    expect(container).toBeInTheDocument();
  });

  it("maintains structure after re-render", async () => {
    const { rerender } = render(<AuditLogList />);

    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    rerender(<AuditLogList />);

    await waitFor(
      () => {
        const listElement = document.querySelector(".ant-page-header");
        expect(listElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
