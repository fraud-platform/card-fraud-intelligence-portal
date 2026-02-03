/**
 * Tests for ApprovalShow component
 *
 * Covers:
 * - Basic rendering
 * - Show component structure
 * - Loading state handling
 */

import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@/test/utils";
import { ApprovalShow } from "../show";

// Mock useParams
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: () => ({ id: "test-approval-id" }),
    useNavigate: () => vi.fn(),
  };
});

// Mock httpClient
vi.mock("../../api/httpClient", () => ({
  get: vi.fn(() =>
    Promise.resolve({
      approval: {
        approval_id: "test-approval-id",
        status: "PENDING",
        entity_type: "RULE",
        entity_id: "rule-123",
        action: "CREATE",
        maker: "maker@example.com",
        created_at: "2024-01-01T00:00:00Z",
      },
      entity_data: {
        entity_name: "Test Rule",
        new_value: { name: "test" },
      },
    })
  ),
  post: vi.fn(),
}));

// Mock authProvider
vi.mock("../../app/authProvider", () => ({
  isChecker: () => true,
}));

describe("ApprovalShow", () => {
  it("renders the show component with loading state", async () => {
    render(<ApprovalShow />);

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
    render(<ApprovalShow />);

    await waitFor(
      () => {
        const showElement = document.querySelector(".ant-page-header");
        expect(showElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders without crashing", () => {
    const { container } = render(<ApprovalShow />);

    expect(container).toBeInTheDocument();
  });

  it("maintains structure after re-render", async () => {
    const { rerender } = render(<ApprovalShow />);

    await waitFor(
      () => {
        const showElement = document.querySelector(".ant-page-header");
        expect(showElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    rerender(<ApprovalShow />);

    await waitFor(
      () => {
        const showElement = document.querySelector(".ant-page-header");
        expect(showElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
