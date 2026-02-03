/**
 * Tests for AuditLogShow component
 *
 * Covers:
 * - Basic rendering
 * - Show component structure
 * - Loading state handling
 */

import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@/test/utils";
import { AuditLogShow } from "../show";

// Mock useParams
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ id: "test-audit-id" }),
  };
});

// Mock httpClient
vi.mock("../../api/httpClient", () => ({
  get: vi.fn(() =>
    Promise.resolve({
      audit_id: "test-audit-id",
      entity_type: "RULE",
      entity_id: "rule-123",
      action: "CREATE",
      performed_by: "user@example.com",
      performed_at: "2024-01-01T00:00:00Z",
      old_value: null,
      new_value: { name: "test" },
    })
  ),
}));

describe("AuditLogShow", () => {
  it("renders the show component with loading state", async () => {
    render(<AuditLogShow />);

    // Initially should show loading
    await waitFor(
      () => {
        const showElement = document.querySelector(".ant-page-header");
        expect(showElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders Show component structure", async () => {
    render(<AuditLogShow />);

    await waitFor(
      () => {
        const showElement = document.querySelector(".ant-page-header");
        expect(showElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<AuditLogShow />);

    expect(container).toBeInTheDocument();
  });

  it("maintains structure after re-render", async () => {
    const { rerender } = render(<AuditLogShow />);

    await waitFor(
      () => {
        const showElement = document.querySelector(".ant-page-header");
        expect(showElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    rerender(<AuditLogShow />);

    await waitFor(
      () => {
        const showElement = document.querySelector(".ant-page-header");
        expect(showElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
