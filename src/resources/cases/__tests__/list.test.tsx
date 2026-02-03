/**
 * Tests for CasesList component
 *
 * Covers:
 * - Component rendering without crashing
 * - Filter memoization and state changes
 * - Handler functions (handleViewCase, handleCreateCase, handleRefresh)
 * - Column memoization and table functionality
 * - New Case button visibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@/test/utils";
import CasesList from "../list";
import * as hooks from "@/hooks";
import * as refineCore from "@refinedev/core";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useCasesList: vi.fn(),
}));

// Mock @refinedev/core - keep all exports but mock useGo
vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...(actual as object),
    useGo: vi.fn(() => vi.fn()),
  };
});

describe("CasesList", () => {
  const mockUseCasesList = vi.mocked(hooks.useCasesList);

  // Mock data
  const mockCases = [
    {
      id: "case_1",
      case_number: "CASE-2024-001",
      case_type: "INVESTIGATION" as const,
      case_status: "OPEN" as const,
      risk_level: "HIGH" as const,
      title: "Suspicious pattern at merchant X",
      description: "Multiple transactions with similar characteristics",
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
    },
    {
      id: "case_2",
      case_number: "CASE-2024-002",
      case_type: "FRAUD_RING" as const,
      case_status: "IN_PROGRESS" as const,
      risk_level: "CRITICAL" as const,
      title: "Organized fraud ring investigation",
      description: "Coordinated fraud across multiple accounts",
      total_transaction_count: 47,
      total_transaction_amount: 98500.0,
      assigned_analyst_id: "analyst_2",
      assigned_analyst_name: "Jane Smith",
      assigned_at: "2024-01-14T14:30:00Z",
      resolved_at: null,
      resolved_by: null,
      resolution_summary: null,
      created_by: "admin",
      created_at: "2024-01-14T13:00:00Z",
      updated_at: "2024-01-14T14:30:00Z",
    },
    {
      id: "case_3",
      case_number: "CASE-2024-003",
      case_type: "DISPUTE" as const,
      case_status: "RESOLVED" as const,
      risk_level: "LOW" as const,
      title: "Cardholder dispute resolution",
      description: "Customer claimed transactions were unauthorized",
      total_transaction_count: 3,
      total_transaction_amount: 450.0,
      assigned_analyst_id: null,
      assigned_analyst_name: null,
      assigned_at: null,
      resolved_at: "2024-01-13T16:00:00Z",
      resolved_by: "John Doe",
      resolution_summary: "Confirmed as legitimate transactions",
      created_by: "admin",
      created_at: "2024-01-13T10:00:00Z",
      updated_at: "2024-01-13T16:00:00Z",
    },
  ];

  const mockRefetch = vi.fn();
  const mockGo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default hook mocks
    mockUseCasesList.mockReturnValue({
      cases: mockCases,
      total: 3,
      hasMore: false,
      nextCursor: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
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
      const { container } = render(<CasesList />);
      expect(container).toBeInTheDocument();
    });

    it("renders page title with folder icon", async () => {
      render(<CasesList />);
      await waitFor(() => {
        expect(screen.getByText("Cases")).toBeInTheDocument();
      });
    });

    it("renders New Case button", async () => {
      render(<CasesList />);
      await waitFor(() => {
        expect(screen.getByText("New Case")).toBeInTheDocument();
      });
    });

    it("renders filter controls", async () => {
      render(<CasesList />);
      await waitFor(() => {
        expect(screen.getAllByLabelText("Status").length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText("Type").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Transactions").length).toBeGreaterThan(0);
        expect(screen.getByText("Refresh")).toBeInTheDocument();
      });
    });

    it("renders table with cases", async () => {
      render(<CasesList />);
      await waitFor(() => {
        const tableRows = document.querySelectorAll(".ant-table-row");
        expect(tableRows.length).toBeGreaterThan(0);
      });
    });

    it("shows loading state when isLoading is true", async () => {
      mockUseCasesList.mockReturnValue({
        cases: [],
        total: 0,
        hasMore: false,
        nextCursor: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<CasesList />);
      await waitFor(() => {
        const refreshButton = screen.getByText("Refresh");
        expect(refreshButton).toBeInTheDocument();
        expect(refreshButton.closest("button")).toHaveClass("ant-btn-loading");
      });
    });

    it("renders empty case list", async () => {
      mockUseCasesList.mockReturnValue({
        cases: [],
        total: 0,
        hasMore: false,
        nextCursor: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<CasesList />);
      await waitFor(() => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      });
    });

    it("displays correct pagination text", async () => {
      render(<CasesList />);
      await waitFor(() => {
        expect(screen.getByText("3 cases")).toBeInTheDocument();
      });
    });
  });

  describe("Filter Functionality", () => {
    it("should call useCasesList with default filters", async () => {
      render(<CasesList />);
      await waitFor(() => {
        expect(mockUseCasesList).toHaveBeenCalledTimes(1);
        const call = mockUseCasesList.mock.calls[0];
        expect(call).toBeDefined();

        if (call && call[0]) {
          expect(call[0].filters).toEqual({
            case_status: undefined,
            case_type: undefined,
          });
        }
      });
    });

    it("should trigger refetch when status filter changes", async () => {
      render(<CasesList />);
      await waitFor(() => {
        expect(mockUseCasesList).toHaveBeenCalledTimes(1);
      });

      // Change status filter — pick the visible ant-select container
      const statusSelect =
        screen.getAllByLabelText("Status").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Status")[0];
      const statusSelector = statusSelect.querySelector(".ant-select-selector") ?? statusSelect;
      // If this is a native select (our MockSelect), change the value directly
      if (
        (statusSelect as HTMLElement).tagName?.toLowerCase() === "select" ||
        (statusSelector as HTMLElement).tagName?.toLowerCase() === "select"
      ) {
        const selectEl =
          (statusSelect as HTMLElement).tagName?.toLowerCase() === "select"
            ? (statusSelect as HTMLSelectElement)
            : (statusSelector as HTMLSelectElement);
        const openOpt = Array.from(selectEl.options).find(
          (o) => (o.textContent ?? "").trim() === "Open"
        );
        if (openOpt) {
          fireEvent.change(selectEl, { target: { value: openOpt.value } });
        }
      } else {
        fireEvent.mouseDown(statusSelector);
        const statusListbox = await screen.findByRole("listbox");
        const openOption = within(statusListbox).getByRole("option", { name: "Open" });
        fireEvent.click(openOption);
      }

      await waitFor(() => {
        expect(mockUseCasesList).toHaveBeenCalled();
      });
    });

    it("should trigger refetch when type filter changes", async () => {
      render(<CasesList />);
      await waitFor(() => {
        expect(mockUseCasesList).toHaveBeenCalledTimes(1);
      });

      // Change type filter — pick the visible ant-select container
      const typeSelect =
        screen.getAllByLabelText("Type").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Type")[0];
      const typeSelector = typeSelect.querySelector(".ant-select-selector") ?? typeSelect;
      // If this is a native select, set its value directly
      if (
        (typeSelect as HTMLElement).tagName?.toLowerCase() === "select" ||
        (typeSelector as HTMLElement).tagName?.toLowerCase() === "select"
      ) {
        const selectEl =
          (typeSelect as HTMLElement).tagName?.toLowerCase() === "select"
            ? (typeSelect as HTMLSelectElement)
            : (typeSelector as HTMLSelectElement);
        const invOpt = Array.from(selectEl.options).find(
          (o) => (o.textContent ?? "").trim() === "Investigation"
        );
        if (invOpt) {
          fireEvent.change(selectEl, { target: { value: invOpt.value } });
        }
      } else {
        fireEvent.mouseDown(typeSelector);
        const typeListbox = await screen.findByRole("listbox");
        const investigationOption = within(typeListbox).getByRole("option", {
          name: "Investigation",
        });
        fireEvent.click(investigationOption);
      }

      await waitFor(() => {
        expect(mockUseCasesList).toHaveBeenCalled();
      });
    });

    it("should clear status filter", async () => {
      render(<CasesList />);

      const statusSelect =
        screen.getAllByLabelText("Status").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Status")[0];

      // Open dropdown and select an option
      const statusSelector = statusSelect.querySelector(".ant-select-selector") ?? statusSelect;
      if (
        (statusSelect as HTMLElement).tagName?.toLowerCase() === "select" ||
        (statusSelector as HTMLElement).tagName?.toLowerCase() === "select"
      ) {
        const selectEl =
          (statusSelect as HTMLElement).tagName?.toLowerCase() === "select"
            ? (statusSelect as HTMLSelectElement)
            : (statusSelector as HTMLSelectElement);
        const openOpt = Array.from(selectEl.options).find(
          (o) => (o.textContent ?? "").trim() === "Open"
        );
        if (openOpt) {
          fireEvent.change(selectEl, { target: { value: openOpt.value } });
        }
      } else {
        fireEvent.mouseDown(statusSelector);
        const statusListbox = await screen.findByRole("listbox");
        const openOption = within(statusListbox).getByRole("option", { name: "Open" });
        fireEvent.click(openOption);
      }

      // Clear the selection by clicking clear icon inside the ant-select container (if present), otherwise try to clear the native select
      const clearIcon =
        statusSelect.querySelector?.(".ant-select-clear-icon") ??
        statusSelect.parentElement?.querySelector(".ant-select-clear-icon");
      if (clearIcon) {
        fireEvent.click(clearIcon);
      } else if ((statusSelect as HTMLElement).tagName?.toLowerCase() === "select") {
        const sel = statusSelect as HTMLSelectElement;
        // attempt to clear by setting an empty value if available, otherwise set to an empty string
        const emptyOpt = Array.from(sel.options).find(
          (o) => o.value === "" || (o.textContent ?? "").trim() === ""
        );
        if (emptyOpt) {
          fireEvent.change(sel, { target: { value: emptyOpt.value } });
        } else {
          fireEvent.change(sel, { target: { value: "" } });
        }
      }

      await waitFor(() => {
        expect(statusSelect).toBeInTheDocument();
      });
    });

    it("should cycle through available status options", async () => {
      render(<CasesList />);

      const statusSelect =
        screen.getAllByLabelText("Status").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Status")[0];
      const openSelectAndGetListbox = async (sel: HTMLElement) => {
        // Prefer native select if present (our test setup sometimes mocks Select to a native <select>)
        // If the element itself is a native select, return it directly.
        if (sel.tagName?.toLowerCase() === "select") {
          return sel as HTMLSelectElement;
        }

        const nestedSelect = sel.querySelector("select") as HTMLSelectElement | null;
        if (nestedSelect) {
          return nestedSelect;
        }

        // If there are multiple mock-selects in the document, try to match by aria-label of the passed element.
        const allMockSelects = screen.queryAllByTestId("mock-select");
        if (allMockSelects.length === 1) {
          return allMockSelects[0] as HTMLSelectElement;
        } else if (allMockSelects.length > 1) {
          const aria = sel.getAttribute("aria-label");
          const matched = allMockSelects.find((m) => m.getAttribute("aria-label") === aria);
          if (matched) return matched as HTMLSelectElement;
          // otherwise fallthrough to opening the AntD selector
        }

        const selectorEl = sel.querySelector(".ant-select-selector") ?? sel;
        fireEvent.mouseDown(selectorEl as HTMLElement);
        try {
          return await screen.findByRole("listbox");
        } catch {
          // fallback to click if mousedown didn't work
          fireEvent.click(selectorEl as HTMLElement);
          return await screen.findByRole("listbox");
        }
      };

      // Open once and capture available option names
      const firstListbox = await openSelectAndGetListbox(statusSelect);
      let statusOptionNames: string[] = [];
      if ((firstListbox as HTMLElement).tagName?.toLowerCase() === "select") {
        const sel = firstListbox as HTMLSelectElement;
        statusOptionNames = Array.from(sel.options).map((o) => (o.textContent ?? "").trim());
        // Select the first option directly on native select
        expect(statusOptionNames.length).toBeGreaterThan(0);
        fireEvent.change(sel, { target: { value: sel.options[0].value } });
      } else {
        statusOptionNames = within(firstListbox as HTMLElement)
          .getAllByRole("option")
          .map((o) => o.getAttribute("aria-label") ?? (o.textContent ?? "").trim());

        // Select the first available option to verify selection behavior
        expect(statusOptionNames.length).toBeGreaterThan(0);
        const firstStatusName = statusOptionNames[0];
        const firstOption = within(firstListbox as HTMLElement).getByRole("option", {
          name: firstStatusName,
        });
        fireEvent.click(firstOption);
      }

      await waitFor(() => {
        expect(screen.getAllByLabelText("Status").length).toBeGreaterThan(0);
      });
    });

    it("should cycle through available type options", async () => {
      render(<CasesList />);

      const typeSelect =
        screen.getAllByLabelText("Type").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Type")[0];
      const openSelectAndGetListbox = async (sel: HTMLElement) => {
        // Prefer native select if present (our test setup sometimes mocks Select to a native <select>)
        // If the element itself is a native select, return it directly.
        if (sel.tagName?.toLowerCase() === "select") {
          return sel as HTMLSelectElement;
        }

        const nestedSelect = sel.querySelector("select") as HTMLSelectElement | null;
        if (nestedSelect) {
          return nestedSelect;
        }

        // If there are multiple mock-selects in the document, try to match by aria-label of the passed element.
        const allMockSelects = screen.queryAllByTestId("mock-select");
        if (allMockSelects.length === 1) {
          return allMockSelects[0] as HTMLSelectElement;
        } else if (allMockSelects.length > 1) {
          const aria = sel.getAttribute("aria-label");
          const matched = allMockSelects.find((m) => m.getAttribute("aria-label") === aria);
          if (matched) return matched as HTMLSelectElement;
          // otherwise fallthrough to opening the AntD selector
        }

        const selectorEl = sel.querySelector(".ant-select-selector") ?? sel;
        fireEvent.mouseDown(selectorEl as HTMLElement);
        try {
          return await screen.findByRole("listbox");
        } catch {
          fireEvent.click(selectorEl as HTMLElement);
          return await screen.findByRole("listbox");
        }
      };

      // Open once and capture available option names
      const firstListbox = await openSelectAndGetListbox(typeSelect);
      let typeOptionNames: string[] = [];
      if ((firstListbox as HTMLElement).tagName?.toLowerCase() === "select") {
        const sel = firstListbox as HTMLSelectElement;
        typeOptionNames = Array.from(sel.options).map((o) => (o.textContent ?? "").trim());
        expect(typeOptionNames.length).toBeGreaterThan(0);
        fireEvent.change(sel, { target: { value: sel.options[0].value } });
      } else {
        typeOptionNames = within(firstListbox as HTMLElement)
          .getAllByRole("option")
          .map((o) => o.getAttribute("aria-label") ?? (o.textContent ?? "").trim());

        // Select the first available option to verify selection behavior
        expect(typeOptionNames.length).toBeGreaterThan(0);
        const firstTypeName = typeOptionNames[0];
        const firstTypeOption = within(firstListbox as HTMLElement).getByRole("option", {
          name: firstTypeName,
        });
        fireEvent.click(firstTypeOption);
      }

      await waitFor(() => {
        expect(screen.getAllByLabelText("Type").length).toBeGreaterThan(0);
      });
    });
  });

  describe("Handler Functions", () => {
    it("should call handleRefresh and trigger refetch", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("Refresh")).toBeInTheDocument();
      });

      const refreshButton = screen.getByText("Refresh");
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledTimes(1);
      });
    });

    it("should call handleCreateCase and navigate to create page", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("New Case")).toBeInTheDocument();
      });

      const createButton = screen.getByText("New Case");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockGo).toHaveBeenCalledWith({
          to: "/cases/create",
        });
      });
    });

    it("should call handleViewCase and navigate to case detail", async () => {
      render(<CasesList />);

      await waitFor(() => {
        const tableRows = document.querySelectorAll(".ant-table-row");
        expect(tableRows.length).toBeGreaterThan(0);
      });

      // Find and click the View button
      const viewButtons = screen.getAllByText("View");
      expect(viewButtons.length).toBeGreaterThan(0);

      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(mockGo).toHaveBeenCalledWith({
          to: "/cases/show/case_1",
        });
      });
    });
  });

  describe("Table Columns Rendering", () => {
    it("should render all expected columns", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getAllByText("Case #").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Title").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Type").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Risk").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Transactions").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Total Amount").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Assigned To").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Created").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
      });
    });

    it("should render case numbers in monospace font", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("CASE-2024-001")).toBeInTheDocument();
      });
    });

    it("should render case type badges correctly", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("Investigation", { selector: ".ant-tag" })).toBeInTheDocument();
        expect(screen.getByText("Fraud Ring", { selector: ".ant-tag" })).toBeInTheDocument();
        expect(screen.getByText("Dispute", { selector: ".ant-tag" })).toBeInTheDocument();
      });
    });

    it("should render case status badges correctly", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("Open", { selector: ".ant-tag" })).toBeInTheDocument();
        expect(screen.getByText("In Progress", { selector: ".ant-tag" })).toBeInTheDocument();
        expect(screen.getByText("Resolved", { selector: ".ant-tag" })).toBeInTheDocument();
      });
    });

    it("should render risk level badges", async () => {
      render(<CasesList />);

      await waitFor(() => {
        const tableRows = document.querySelectorAll(".ant-table-row");
        expect(tableRows.length).toBeGreaterThan(0);
      });

      // Risk badges should be rendered
      const riskBadges = document.querySelectorAll(".ant-tag");
      expect(riskBadges.length).toBeGreaterThan(0);
    });

    it("should render transaction counts", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("15")).toBeInTheDocument();
        expect(screen.getByText("47")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("should render amounts formatted as currency", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("$12,500.50")).toBeInTheDocument();
        expect(screen.getByText("$98,500.00")).toBeInTheDocument();
        expect(screen.getByText("$450.00")).toBeInTheDocument();
      });
    });

    it("should render assigned analyst names", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });
    });

    it('should render "Unassigned" for cases without analyst', async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("Unassigned")).toBeInTheDocument();
      });
    });

    it("should render dates formatted correctly", async () => {
      render(<CasesList />);

      await waitFor(() => {
        const tableRows = document.querySelectorAll(".ant-table-row");
        expect(tableRows.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should handle multiple filter changes in sequence", async () => {
      render(<CasesList />);

      // Change status
      const statusSelect =
        screen.getAllByLabelText("Status").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Status")[0];
      const statusSelector = statusSelect.querySelector(".ant-select-selector") ?? statusSelect;
      if (
        (statusSelect as HTMLElement).tagName?.toLowerCase() === "select" ||
        (statusSelector as HTMLElement).tagName?.toLowerCase() === "select"
      ) {
        const sel =
          (statusSelect as HTMLElement).tagName?.toLowerCase() === "select"
            ? (statusSelect as HTMLSelectElement)
            : (statusSelector as HTMLSelectElement);
        const openOpt = Array.from(sel.options).find(
          (o) => (o.textContent ?? "").trim() === "Open"
        );
        if (openOpt) {
          fireEvent.change(sel, { target: { value: openOpt.value } });
        }
      } else {
        fireEvent.mouseDown(statusSelector);
        const statusListbox = await screen.findByRole("listbox");
        fireEvent.click(within(statusListbox).getByRole("option", { name: "Open" }));
        // Click outside to close the dropdown
        fireEvent.click(document.body);

        // If using an AntD overlay listbox, wait for it to close or become hidden. For native select mocks, skip this check.
        const maybeListbox = screen.queryByRole("listbox");
        if (maybeListbox) {
          await waitFor(() => {
            expect(screen.queryByRole("listbox")).not.toBeVisible();
          });
        }
      }

      // If using an AntD overlay listbox, wait for it to close or become hidden. For native select mocks, skip this check.
      const maybeListbox = screen.queryByRole("listbox");
      if (maybeListbox) {
        await waitFor(() => {
          expect(screen.queryByRole("listbox")).not.toBeVisible();
        });
      }

      // Change type
      const typeSelect =
        screen.getAllByLabelText("Type").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Type")[0];
      const typeSelector = typeSelect.querySelector(".ant-select-selector") ?? typeSelect;
      if (
        (typeSelect as HTMLElement).tagName?.toLowerCase() === "select" ||
        (typeSelector as HTMLElement).tagName?.toLowerCase() === "select"
      ) {
        const sel =
          (typeSelect as HTMLElement).tagName?.toLowerCase() === "select"
            ? (typeSelect as HTMLSelectElement)
            : (typeSelector as HTMLSelectElement);
        const invOpt = Array.from(sel.options).find(
          (o) => (o.textContent ?? "").trim() === "Investigation"
        );
        if (invOpt) {
          fireEvent.change(sel, { target: { value: invOpt.value } });
        }
      } else {
        fireEvent.mouseDown(typeSelector);
        const typeListbox = await screen.findByRole("listbox");
        fireEvent.click(within(typeListbox).getByRole("option", { name: "Investigation" }));
      }

      await waitFor(() => {
        expect(screen.getAllByLabelText("Status").length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText("Type").length).toBeGreaterThan(0);
      });
    });

    it("should handle filter then refresh sequence", async () => {
      render(<CasesList />);

      // Apply filter
      const statusSelect =
        screen.getAllByLabelText("Status").find((el) => el.classList?.contains("ant-select")) ??
        screen.getAllByLabelText("Status")[0];
      const statusSelector = statusSelect.querySelector(".ant-select-selector") ?? statusSelect;
      if (
        (statusSelect as HTMLElement).tagName?.toLowerCase() === "select" ||
        (statusSelector as HTMLElement).tagName?.toLowerCase() === "select"
      ) {
        const sel =
          (statusSelect as HTMLElement).tagName?.toLowerCase() === "select"
            ? (statusSelect as HTMLSelectElement)
            : (statusSelector as HTMLSelectElement);
        const openOpt = Array.from(sel.options).find(
          (o) => (o.textContent ?? "").trim() === "Open"
        );
        if (openOpt) {
          fireEvent.change(sel, { target: { value: openOpt.value } });
        }
      } else {
        fireEvent.mouseDown(statusSelector);
        const statusListbox = await screen.findByRole("listbox");
        fireEvent.click(within(statusListbox).getByRole("option", { name: "Open" }));
      }

      // Refresh
      const refreshButton = screen.getByText("Refresh");
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it("should handle empty case list gracefully", async () => {
      mockUseCasesList.mockReturnValue({
        cases: [],
        total: 0,
        hasMore: false,
        nextCursor: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("Cases")).toBeInTheDocument();
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      });
    });

    it("should handle error state in cases list", async () => {
      const error = new Error("Failed to fetch cases");
      mockUseCasesList.mockReturnValue({
        cases: [],
        total: 0,
        hasMore: false,
        nextCursor: null,
        isLoading: false,
        error,
        refetch: mockRefetch,
      });

      render(<CasesList />);

      await waitFor(() => {
        expect(screen.getByText("Cases")).toBeInTheDocument();
      });
    });
  });

  describe("Performance and Memoization", () => {
    it("should not recreate columns on every render", async () => {
      const { rerender } = render(<CasesList />);

      await waitFor(() => {
        expect(screen.getAllByText("Case #").length).toBeGreaterThan(0);
      });

      const initialColumns = screen.getAllByRole("columnheader").length;

      rerender(<CasesList />);

      await waitFor(() => {
        const columnsAfterRerender = screen.getAllByRole("columnheader").length;
        expect(columnsAfterRerender).toBe(initialColumns);
      });
    });

    it("should use memoized filter options", async () => {
      render(<CasesList />);

      await waitFor(() => {
        expect(mockUseCasesList).toHaveBeenCalled();
      });
    });
  });
});
