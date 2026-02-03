/**
 * Tests for CaseShow component
 *
 * Covers:
 * - Component rendering without crashing
 * - Loading state
 * - Empty state (case not found)
 * - Case detail view with header information
 * - Transactions tab
 * - Activity tab
 * - Navigation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@/test/utils";
import CaseShow from "../show";
import * as hooks from "@/hooks";
import * as refineCore from "@refinedev/core";
import * as api from "@/api/httpClient";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useCase: vi.fn(),
  useCaseActivity: vi.fn(),
}));

// Mock @refinedev/core - keep all exports but mock useGo
vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...(actual as object),
    useGo: vi.fn(() => vi.fn()),
    useParams: () => ({ id: "case_1" }),
  };
});

// Mock the API client
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
}));

// Mock useParams from react-router
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useParams: () => ({ id: "case_1" }),
  };
});

describe("CaseShow", () => {
  const mockUseCase = vi.mocked(hooks.useCase);
  const mockUseCaseActivity = vi.mocked(hooks.useCaseActivity);
  const mockGet = vi.mocked(api.get);

  // Mock data
  const mockCaseData = {
    id: "case_1",
    case_number: "CASE-2024-001",
    case_type: "INVESTIGATION" as const,
    case_status: "OPEN" as const,
    risk_level: "HIGH" as const,
    title: "Suspicious pattern at merchant X",
    description: "Multiple transactions with similar characteristics detected over 48-hour period",
    total_transaction_count: 15,
    total_transaction_amount: 12500.5,
    assigned_analyst_id: "analyst_1",
    assigned_analyst_name: "John Doe",
    assigned_at: "2024-01-15T10:00:00Z",
    resolved_at: null,
    resolved_by: null,
    resolution_summary: null,
    created_by: "admin",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  const mockResolvedCaseData = {
    ...mockCaseData,
    id: "case_2",
    case_number: "CASE-2024-002",
    case_status: "RESOLVED" as const,
    resolved_at: "2024-01-16T14:00:00Z",
    resolved_by: "Jane Smith",
    resolution_summary: "Confirmed fraud pattern, escalated to fraud team",
  };

  const mockTransactions = [
    {
      transaction_id: "txn_12345678901234567890",
      amount: 1500.0,
      currency: "USD",
      decision: "ALLOW",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      transaction_id: "txn_98765432109876543210",
      amount: 2500.5,
      currency: "USD",
      decision: "DENY",
      created_at: "2024-01-15T11:00:00Z",
    },
  ];

  const mockActivities = [
    {
      id: "activity_1",
      case_id: "case_1",
      activity_type: "STATUS_CHANGE",
      activity_description: "Case status changed from OPEN to IN_PROGRESS",
      activity_data: { old_status: "OPEN", new_status: "IN_PROGRESS" },
      performed_by: "analyst_1",
      performed_by_name: "John Doe",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "activity_2",
      case_id: "case_1",
      activity_type: "TRANSACTION_ADDED",
      activity_description: "Transaction txn_12345678901234567890 added to case",
      activity_data: { transaction_id: "txn_12345678901234567890" },
      performed_by: "admin",
      performed_by_name: "System Admin",
      created_at: "2024-01-15T10:15:00Z",
    },
  ];

  const mockGo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default hook mocks
    mockUseCase.mockReturnValue({
      case_: mockCaseData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      update: vi.fn(),
      resolve: vi.fn(),
      addTransaction: vi.fn(),
      removeTransaction: vi.fn(),
      isUpdating: false,
    });

    mockUseCaseActivity.mockReturnValue({
      activities: mockActivities,
      total: 2,
      hasMore: false,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockGet.mockResolvedValue({
      items: mockTransactions,
    });

    // Mock useGo
    const mockUseGo = vi.mocked(refineCore.useGo);
    mockUseGo.mockReturnValue(mockGo);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<CaseShow />);
      expect(container).toBeInTheDocument();
    });

    it("shows loading state while loading case data", async () => {
      mockUseCase.mockReturnValue({
        case_: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        update: vi.fn(),
        resolve: vi.fn(),
        addTransaction: vi.fn(),
        removeTransaction: vi.fn(),
        isUpdating: false,
      });

      render(<CaseShow />);

      await waitFor(() => {
        const spinElement = document.querySelector(".ant-spin");
        expect(spinElement).toBeInTheDocument();
      });
    });

    it("shows empty state when case is not found", async () => {
      mockUseCase.mockReturnValue({
        case_: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        update: vi.fn(),
        resolve: vi.fn(),
        addTransaction: vi.fn(),
        removeTransaction: vi.fn(),
        isUpdating: false,
      });

      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("Case not found")).toBeInTheDocument();
        expect(screen.getByText("Back to Cases")).toBeInTheDocument();
      });
    });

    it("renders case header information", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("CASE-2024-001")).toBeInTheDocument();
        expect(screen.getByText("Suspicious pattern at merchant X")).toBeInTheDocument();
        expect(screen.getByText("Investigation")).toBeInTheDocument();
        expect(screen.getByText("Open")).toBeInTheDocument();
      });
    });

    it("renders case description when present", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Multiple transactions with similar characteristics detected over 48-hour period"
          )
        ).toBeInTheDocument();
      });
    });

    it("renders case details in descriptions", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("15")).toBeInTheDocument(); // transaction count
        expect(screen.getByText("$12,500.50")).toBeInTheDocument(); // total amount
        expect(screen.getByText("John Doe")).toBeInTheDocument(); // assigned analyst
      });
    });

    it('shows "Unassigned" when no analyst is assigned', async () => {
      mockUseCase.mockReturnValue({
        case_: {
          ...mockCaseData,
          assigned_analyst_id: null,
          assigned_analyst_name: null,
          assigned_at: null,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        update: vi.fn(),
        resolve: vi.fn(),
        addTransaction: vi.fn(),
        removeTransaction: vi.fn(),
        isUpdating: false,
      });

      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("Unassigned")).toBeInTheDocument();
      });
    });

    it("renders resolution information for resolved cases", async () => {
      mockUseCase.mockReturnValue({
        case_: mockResolvedCaseData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        update: vi.fn(),
        resolve: vi.fn(),
        addTransaction: vi.fn(),
        removeTransaction: vi.fn(),
        isUpdating: false,
      });

      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("Jane Smith")).toBeInTheDocument(); // resolved by
        expect(
          screen.getByText("Confirmed fraud pattern, escalated to fraud team")
        ).toBeInTheDocument(); // resolution summary
      });
    });
  });

  describe("Transactions Tab", () => {
    it("renders transactions tab with count", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Transactions/ })).toBeInTheDocument();
      });
    });

    it("renders transactions table with correct columns", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Transactions/ })).toBeInTheDocument();
        // Switch to transactions tab if not already active
        const transactionsTab = screen.getByRole("tab", { name: /Transactions/ });
        fireEvent.click(transactionsTab);
      });

      await waitFor(() => {
        expect(screen.getByText("Transaction ID")).toBeInTheDocument();
        expect(screen.getByText("Amount")).toBeInTheDocument();
        expect(screen.getByText("Decision")).toBeInTheDocument();
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });
    });

    it("renders transaction data correctly", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        const transactionsTab = screen.getByRole("tab", { name: /Transactions/ });
        fireEvent.click(transactionsTab);
      });

      // Wait for the table to render and show at least one row
      await waitFor(() => {
        const rows = document.querySelectorAll(".ant-table-row");
        expect(rows.length).toBeGreaterThan(0);
      });
      // Ensure a decision cell exists
      await waitFor(() => {
        expect(screen.getByText("ALLOW")).toBeInTheDocument();
      });
    });

    it("shows loading state while fetching transactions", async () => {
      // Make get pending
      mockGet.mockImplementation(() => new Promise(() => {}));

      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Transactions/ })).toBeInTheDocument();
      });
    });

    it("shows empty transactions list when no transactions", async () => {
      mockGet.mockResolvedValue({ items: [] });

      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Transactions/ })).toBeInTheDocument();
      });
    });

    it("navigates to transaction detail when View is clicked", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        const transactionsTab = screen.getByRole("tab", { name: /Transactions/ });
        fireEvent.click(transactionsTab);
      });

      // Find a View button in the rendered table and click it
      await waitFor(() => {
        const viewButton = Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent?.trim() === "View"
        );
        expect(viewButton).toBeDefined();
        fireEvent.click(viewButton!);
      });

      await waitFor(() => {
        expect(mockGo).toHaveBeenCalledWith({
          to: "/transactions/show/txn_12345678901234567890",
        });
      });
    });
  });

  describe("Activity Tab", () => {
    it("renders activity log tab", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("Activity Log")).toBeInTheDocument();
      });
    });

    it("renders activity timeline", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        const activityTab = screen.getByText("Activity Log");
        fireEvent.click(activityTab);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Case status changed from OPEN to IN_PROGRESS")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Transaction txn_12345678901234567890 added to case")
        ).toBeInTheDocument();
      });
    });

    it("shows activity performer information", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        const activityTab = screen.getByText("Activity Log");
        fireEvent.click(activityTab);
      });

      await waitFor(() => {
        expect(screen.getAllByText(/John\s*Doe/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/System\s*Admin/).length).toBeGreaterThan(0);
      });
    });

    it("shows empty state when no activities", async () => {
      mockUseCaseActivity.mockReturnValue({
        activities: [],
        total: 0,
        hasMore: false,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<CaseShow />);

      await waitFor(() => {
        const activityTab = screen.getByText("Activity Log");
        fireEvent.click(activityTab);
      });

      await waitFor(() => {
        expect(screen.getByText("No activity recorded")).toBeInTheDocument();
      });
    });

    it("shows loading state while fetching activities", async () => {
      mockUseCaseActivity.mockReturnValue({
        activities: [],
        total: 0,
        hasMore: false,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<CaseShow />);

      await waitFor(() => {
        const activityTab = screen.getByText("Activity Log");
        fireEvent.click(activityTab);
      });
    });
  });

  describe("Navigation", () => {
    it("navigates back to cases list when back button is clicked", async () => {
      render(<CaseShow />);

      await waitFor(() => {
        const backButton = screen.getByText("Back to Cases");
        expect(backButton).toBeInTheDocument();

        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(mockGo).toHaveBeenCalledWith({
          to: "/cases",
        });
      });
    });

    it("navigates back when clicking back button from empty state", async () => {
      mockUseCase.mockReturnValue({
        case_: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        update: vi.fn(),
        resolve: vi.fn(),
        addTransaction: vi.fn(),
        removeTransaction: vi.fn(),
        isUpdating: false,
      });

      render(<CaseShow />);

      await waitFor(() => {
        const backButton = screen.getByText("Back to Cases");
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(mockGo).toHaveBeenCalledWith({
          to: "/cases",
        });
      });
    });
  });

  describe("Integration Tests", () => {
    it("handles switching between tabs", async () => {
      render(<CaseShow />);

      // Transactions tab should be visible
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Transactions/ })).toBeInTheDocument();
      });

      // Click Activity Log tab
      const activityTab = screen.getByText("Activity Log");
      fireEvent.click(activityTab);

      await waitFor(() => {
        expect(
          screen.getByText("Case status changed from OPEN to IN_PROGRESS")
        ).toBeInTheDocument();
      });

      // Click back to Transactions tab
      const transactionsTab = screen.getByRole("tab", { name: /Transactions/ });
      fireEvent.click(transactionsTab);

      await waitFor(() => {
        expect(screen.getByText("$1,500.00")).toBeInTheDocument();
      });
    });

    it("handles case with no description", async () => {
      mockUseCase.mockReturnValue({
        case_: {
          ...mockCaseData,
          description: null,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        update: vi.fn(),
        resolve: vi.fn(),
        addTransaction: vi.fn(),
        removeTransaction: vi.fn(),
        isUpdating: false,
      });

      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("CASE-2024-001")).toBeInTheDocument();
        // Description should not be present
        expect(
          screen.queryByText(
            "Multiple transactions with similar characteristics detected over 48-hour period"
          )
        ).not.toBeInTheDocument();
      });
    });

    it("handles API errors gracefully", async () => {
      mockGet.mockRejectedValue(new Error("Failed to fetch transactions"));

      render(<CaseShow />);

      await waitFor(() => {
        expect(screen.getByText("CASE-2024-001")).toBeInTheDocument();
      });

      // Component should still render
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /Transactions/ })).toBeInTheDocument();
      });
    });
  });
});
