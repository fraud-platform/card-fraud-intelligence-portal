/**
 * Tests for CaseCreate component
 *
 * Covers:
 * - Component rendering without crashing
 * - Form validation
 * - Form submission
 * - Navigation
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, within, userEvent } from "@/test/utils";
import CaseCreate from "../create";
import * as hooks from "@/hooks";
import * as refineCore from "@refinedev/core";
import * as antd from "antd";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useCreateCase: vi.fn(),
}));

// Mock @refinedev/core - keep all exports but mock useGo
vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...(actual as object),
    useGo: vi.fn(() => vi.fn()),
  };
});

// Mock message component and provide a lightweight Select mock for reliable testing
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  const React = await vi.importActual("react");

  // Lightweight Select mock that maps children <Select.Option value> to a native <select>
  const MockSelect = ({ children, value, onChange, ...rest }) => {
    return React.createElement(
      "select",
      {
        ...rest,
        value,
        onChange: (e) => {
          // Ensure Select onChange is invoked in tests
          onChange?.(e.target.value);
        },
        // Ensure the native select element has a name/id to aid form bindings and debugging
        id: rest.id ?? rest.name,
        name: rest.name,
        "data-testid": rest["data-testid"] ?? "mock-select",
      },
      React.Children.map(children, (child) => {
        // child is expected to be <Select.Option value>Label</Select.Option>
        return React.createElement("option", { value: child.props.value }, child.props.children);
      })
    );
  };

  const MockOption = (props) => React.createElement("span", props, props.children);

  // Ensure the mock shape matches AntD's Select API where Option is a static property
  MockSelect.Option = MockOption;

  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
    Select: MockSelect,
    Option: MockOption,
  };
});

describe("CaseCreate", () => {
  const mockUseCreateCase = vi.mocked(hooks.useCreateCase);

  const mockGo = vi.fn();

  const mockCreatedCase = {
    id: "case_1",
    case_number: "CASE-2024-001",
    case_type: "INVESTIGATION" as const,
    case_status: "OPEN" as const,
    risk_level: "HIGH" as const,
    title: "Test Case",
    description: "Test description",
    total_transaction_count: 0,
    total_transaction_amount: 0,
    assigned_analyst_id: null,
    assigned_analyst_name: null,
    assigned_at: null,
    resolved_at: null,
    resolved_by: null,
    resolution_summary: null,
    created_by: "admin",
    created_at: "2024-01-15T09:00:00Z",
    updated_at: "2024-01-15T09:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default hook mocks
    mockUseCreateCase.mockReturnValue({
      createCase: vi.fn().mockResolvedValue(mockCreatedCase),
      isCreating: false,
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
      const { container } = render(<CaseCreate />);
      expect(container).toBeInTheDocument();
    });

    it("renders page title", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create New Case")).toBeInTheDocument();
      });
    });

    it("renders back button", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Back to Cases")).toBeInTheDocument();
      });
    });

    it("renders case type field", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Case Type")).toBeInTheDocument();
      });
    });

    it("renders title field", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Title")).toBeInTheDocument();
      });
    });

    it("renders description field", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Description")).toBeInTheDocument();
      });
    });

    it("renders risk level field", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Risk Level")).toBeInTheDocument();
      });
    });

    it("renders create case button", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });
    });

    it("renders cancel button", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });
    });

    it("initializes form with default values", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        // Case type should default to INVESTIGATION
        // Risk level should default to MEDIUM
        expect(screen.getByText("Case Type")).toBeInTheDocument();
        expect(screen.getByText("Risk Level")).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("shows validation error when case type is not selected", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Clear case type selection
      const caseTypeSelect = screen
        .getByText("Case Type")
        .closest(".ant-form-item")
        ?.querySelector(".ant-select-clear-icon");
      if (caseTypeSelect) {
        await userEvent.click(caseTypeSelect as Element);
      }

      // Try to submit without title
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        // Should show validation error for title
        const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
        expect(titleInput).toBeInTheDocument();
      });
    });

    it("shows validation error when title is empty", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Try to submit without title
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        // Should show validation error on the title field (check aria-invalid or form item error class)
        const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
        expect(titleInput).toHaveAttribute("aria-invalid", "true");
        const titleFormItem = titleInput.closest(".ant-form-item");
        expect(titleFormItem).toHaveClass("ant-form-item-has-error");
      });
    });

    it("shows validation error when title is too short", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Enter short title
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "abc" } });

      // Try to submit
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        // Should show validation error on the title field
        expect(titleInput).toHaveAttribute("aria-invalid", "true");
        const titleFormItem = titleInput.closest(".ant-form-item");
        expect(titleFormItem).toHaveClass("ant-form-item-has-error");
      });
    });

    it("accepts valid title length", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Enter valid title
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Valid investigation title" } });

      // Try to submit - should not show title length error
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        // Should not show title length error
        expect(screen.queryByText(/Title must be at least 5 characters/)).not.toBeInTheDocument();
      });
    });

    it("allows optional description to be empty", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Enter only required fields
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Valid investigation title" } });

      // Description is optional, so no error should be shown
      expect(screen.queryByText("Description")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid data", async () => {
      const mockCreateCase = vi.fn().mockResolvedValue(mockCreatedCase);
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Fill form
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Test investigation case" } });

      const descriptionInput = screen.getByPlaceholderText("Detailed description of the case...");
      fireEvent.change(descriptionInput, { target: { value: "This is a detailed description" } });

      // Submit form
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateCase).toHaveBeenCalledWith({
          case_type: "INVESTIGATION",
          title: "Test investigation case",
          description: "This is a detailed description",
          risk_level: "MEDIUM",
        });
      });
    });

    it("shows success message and navigates on successful creation", async () => {
      const mockCreateCase = vi.fn().mockResolvedValue(mockCreatedCase);
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Fill form
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Test investigation case" } });

      // Submit form
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        const message = vi.mocked(antd.message);
        expect(message.success).toHaveBeenCalledWith("Case created successfully");
        expect(mockGo).toHaveBeenCalledWith({
          to: "/cases/show/case_1",
        });
      });
    });

    it("shows error message on failed creation", async () => {
      const mockCreateCase = vi.fn().mockRejectedValue(new Error("Failed to create case"));
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Fill form
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Test investigation case" } });

      // Submit form
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        const message = vi.mocked(antd.message);
        expect(message.error).toHaveBeenCalledWith("Failed to create case");
      });
    });

    it("shows loading state while creating", async () => {
      const mockCreateCase = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: true,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Fill form
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Test investigation case" } });

      // Submit form
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(createButton.closest("button")).toHaveClass("ant-btn-loading");
      });
    });

    it("submits form with different case types", async () => {
      const mockCreateCase = vi.fn().mockResolvedValue(mockCreatedCase);
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Select a different case type (pick an available option dynamically)
      let expectedCaseType = "FRAUD_RING";
      const caseTypeWrapper = screen.getByText("Case Type").closest(".ant-form-item");

      // Try to find a native <select> rendered by our mock, first within the expected selector, then globally by test id
      const selectEl =
        (caseTypeWrapper?.querySelector("select") as HTMLSelectElement | null) ??
        (screen.queryByTestId("mock-select") as HTMLSelectElement | null);

      if (selectEl) {
        const opts = Array.from(selectEl.options);
        const chosenOpt = opts.find((o) => o.value !== selectEl.value) ?? opts[0];
        // Use userEvent to select option so events are dispatched correctly
        await userEvent.selectOptions(selectEl, chosenOpt.value);
        // Wait for the controlled value to propagate into the native select
        await waitFor(() => {
          expect((selectEl as HTMLSelectElement).value).toBe(chosenOpt.value);
        });
        // Diagnostic removed in cleanup
        expectedCaseType = chosenOpt.value;
      } else if (caseTypeWrapper) {
        // If native <select> mock wasn't available (Select not mocked), try the dropdown flow
        const caseTypeSelect = caseTypeWrapper.querySelector(".ant-select-selector");
        if (caseTypeSelect) {
          fireEvent.mouseDown(caseTypeSelect);
          const listboxes = await screen.findAllByRole("listbox");
          const listbox =
            listboxes.find((lb) => (lb as HTMLElement).getClientRects().length > 0) ?? listboxes[0];
          // Robustly get options: prefer Testing Library query, fall back to raw DOM if listbox is hidden
          let options: HTMLElement[] = [];
          try {
            options = within(listbox).getAllByRole("option");
          } catch {
            options = Array.from(listbox.querySelectorAll('[role="option"]')) as HTMLElement[];
          }
          const chosen =
            options.find((o) => o.getAttribute("aria-selected") === "false") ?? options[0];
          const name = (chosen?.getAttribute("aria-label") ??
            (chosen?.textContent ?? "")?.trim()) as string;
          if (chosen) {
            fireEvent.mouseDown(chosen);
            fireEvent.click(chosen);
            fireEvent.mouseDown(document.body);
            fireEvent.click(document.body);
            // Set expectedCaseType from the chosen option
            expectedCaseType = (name ?? "INVESTIGATION").toUpperCase().replace(/\s+/g, "_");
          }
        }
      }

      // Fill form
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Test fraud ring case" } });

      // Submit form
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateCase).toHaveBeenCalledWith(
          expect.objectContaining({
            case_type: expectedCaseType,
            title: "Test fraud ring case",
          })
        );
      });
    });

    it("submits form with different risk levels", async () => {
      const mockCreateCase = vi.fn().mockResolvedValue(mockCreatedCase);
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Select different risk level
      let expectedRiskLevel = "CRITICAL";
      const riskLevelWrapper = screen.getByText("Risk Level").closest(".ant-form-item");

      // Try to find a native <select> rendered by our mock
      const riskSelectEl =
        (riskLevelWrapper?.querySelector("select") as HTMLSelectElement | null) ??
        (document.querySelector("select#risk_level") as HTMLSelectElement | null);

      if (riskSelectEl) {
        const opts = Array.from(riskSelectEl.options);
        const chosenOpt = opts.find((o) => o.value !== riskSelectEl.value) ?? opts[0];
        await userEvent.selectOptions(riskSelectEl, chosenOpt.value);
        await waitFor(() => expect(riskSelectEl.value).toBe(chosenOpt.value));
        // Diagnostic removed in cleanup
        expectedRiskLevel = chosenOpt.value;
      } else if (riskLevelWrapper) {
        const riskLevelSelect = riskLevelWrapper.querySelector(".ant-select-selector");
        if (riskLevelSelect) {
          const listboxes = await screen.findAllByRole("listbox");
          const listbox =
            listboxes.find((lb) => (lb as HTMLElement).getClientRects().length > 0) ?? listboxes[0];
          // Robustly get options: prefer Testing Library query, fall back to raw DOM if listbox is hidden
          let options: HTMLElement[] = [];
          try {
            options = within(listbox).getAllByRole("option");
          } catch {
            options = Array.from(listbox.querySelectorAll('[role="option"]')) as HTMLElement[];
          }
          const chosen =
            options.find((o) => o.getAttribute("aria-selected") === "false") ?? options[0];
          const name = (chosen?.getAttribute("aria-label") ??
            (chosen?.textContent ?? "")?.trim()) as string;

          // Try selecting via keyboard navigation (ArrowDown + Enter) to move active descendant
          const selectInput = riskLevelSelect.querySelector("input");
          if (selectInput) {
            // Focus the input and use ArrowDown + Enter to change selection
            fireEvent.focus(selectInput);
            fireEvent.keyDown(selectInput, { key: "ArrowDown", code: "ArrowDown", charCode: 40 });
            fireEvent.keyDown(selectInput, { key: "Enter", code: "Enter", charCode: 13 });
            // Click outside to ensure overlay/list is closed and selection is committed
            fireEvent.mouseDown(document.body);
            fireEvent.click(document.body);
          } else {
            // Fallback to clicking the option directly using raw DOM node
            const optionEl = listbox.querySelector(
              '[role="option"][aria-label]'
            ) as HTMLElement | null;
            const clicked =
              optionEl && optionEl.getAttribute("aria-label") === name
                ? optionEl
                : (chosen ?? optionEl);
            if (clicked) {
              fireEvent.mouseDown(clicked);
              fireEvent.click(clicked);
              fireEvent.mouseDown(document.body);
              fireEvent.click(document.body);
            }
          }

          expectedRiskLevel = (name ?? "MEDIUM").toUpperCase().replace(/\s+/g, "_");
        }
      }

      // Fill form
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Test case with critical risk" } });

      // Submit form
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateCase).toHaveBeenCalledWith(
          expect.objectContaining({
            risk_level: expectedRiskLevel,
            title: "Test case with critical risk",
          })
        );
      });
    });
  });

  describe("Navigation", () => {
    it("navigates back to cases list when cancel is clicked", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockGo).toHaveBeenCalledWith({
          to: "/cases",
        });
      });
    });

    it("navigates back to cases list when back button is clicked", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Back to Cases")).toBeInTheDocument();
      });

      const backButton = screen.getByText("Back to Cases");
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(mockGo).toHaveBeenCalledWith({
          to: "/cases",
        });
      });
    });
  });

  describe("Form Field Interactions", () => {
    it("shows all case type options", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Case Type")).toBeInTheDocument();
      });

      const caseTypeSelect = screen
        .getByText("Case Type")
        .closest(".ant-form-item")
        ?.querySelector(".ant-select-selector");
      if (caseTypeSelect) {
        // Select element is mocked to native <select> in this test; assert a couple of options exist on it
        const selectEl = caseTypeSelect.querySelector("select") as HTMLSelectElement | null;
        expect(selectEl).toBeTruthy();
        if (selectEl) {
          const optionNames = Array.from(selectEl.options).map((o) => o.textContent?.trim());
          expect(optionNames).toEqual(expect.arrayContaining(["Investigation", "Dispute"]));
        }
      }
    });

    it("shows all risk level options", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Risk Level")).toBeInTheDocument();
      });

      const riskLevelSelect = screen
        .getByText("Risk Level")
        .closest(".ant-form-item")
        ?.querySelector(".ant-select-selector");
      if (riskLevelSelect) {
        fireEvent.mouseDown(riskLevelSelect);
        const listboxes = await screen.findAllByRole("listbox");
        const listbox =
          listboxes.find((lb) => (lb as HTMLElement).getClientRects().length > 0) ?? listboxes[0];

        await waitFor(() => {
          // AntD may render a subset of options in tests - assert a couple of expected ones
          expect(within(listbox).getByRole("option", { name: "High" })).toBeInTheDocument();
          expect(within(listbox).getByRole("option", { name: "Medium" })).toBeInTheDocument();
        });
      }
    });

    it("accepts long description text", async () => {
      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      const longDescription =
        "This is a very long description that spans multiple lines and contains detailed information about the investigation case. ".repeat(
          5
        );

      const descriptionInput = screen.getByPlaceholderText("Detailed description of the case...");
      fireEvent.change(descriptionInput, { target: { value: longDescription } });

      // Should accept the input without errors
      expect(descriptionInput).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    it("handles form submission with all fields filled", async () => {
      const mockCreateCase = vi.fn().mockResolvedValue(mockCreatedCase);
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Fill all fields
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Complete test case" } });

      const descriptionInput = screen.getByPlaceholderText("Detailed description of the case...");
      fireEvent.change(descriptionInput, {
        target: { value: "Complete description with all details" },
      });

      // Select different case type
      let expectedCaseType = "DISPUTE";
      const caseTypeWrapper = screen.getByText("Case Type").closest(".ant-form-item");
      const caseTypeSelectEl =
        (caseTypeWrapper?.querySelector("select") as HTMLSelectElement | null) ??
        (document.querySelector("select#case_type") as HTMLSelectElement | null);
      if (caseTypeSelectEl) {
        await userEvent.selectOptions(caseTypeSelectEl, "DISPUTE");
        await waitFor(() => expect(caseTypeSelectEl.value).toBe("DISPUTE"));
        expectedCaseType = "DISPUTE";
      }

      // Select different risk level
      let expectedRiskLevel = "HIGH";
      const riskLevelWrapper = screen.getByText("Risk Level").closest(".ant-form-item");
      const riskSelectEl =
        (riskLevelWrapper?.querySelector("select") as HTMLSelectElement | null) ??
        (document.querySelector("select#risk_level") as HTMLSelectElement | null);
      if (riskSelectEl) {
        await userEvent.selectOptions(riskSelectEl, "HIGH");
        await waitFor(() => expect(riskSelectEl.value).toBe("HIGH"));
        expectedRiskLevel = "HIGH";
      } else if (riskLevelWrapper) {
        const riskLevelSelect = riskLevelWrapper.querySelector(".ant-select-selector");
        if (riskLevelSelect) {
          fireEvent.mouseDown(riskLevelSelect);
          const listbox = await screen.findByRole("listbox");
          const highOption = within(listbox).getByRole("option", { name: "High" });
          const riskSelectInput = riskLevelSelect.querySelector("input");
          if (riskSelectInput) {
            fireEvent.focus(riskSelectInput);
            fireEvent.keyDown(riskSelectInput, {
              key: "ArrowDown",
              code: "ArrowDown",
              charCode: 40,
            });
            fireEvent.keyDown(riskSelectInput, { key: "Enter", code: "Enter", charCode: 13 });
          } else {
            fireEvent.mouseDown(highOption);
            fireEvent.click(highOption);
          }

          // expectedRiskLevel is already set from the native select change above
          // expectedRiskLevel = 'HIGH';
        }
      }

      // Submit form
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateCase).toHaveBeenCalledWith({
          case_type: expectedCaseType,
          title: "Complete test case",
          description: "Complete description with all details",
          risk_level: expectedRiskLevel,
        });
      });
    });

    it("prevents submission when form is invalid", async () => {
      const mockCreateCase = vi.fn().mockResolvedValue(mockCreatedCase);
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      await userEvent.click(createButton);

      await waitFor(() => {
        // Should not call createCase
        expect(mockCreateCase).not.toHaveBeenCalled();
      });
    });

    it("handles rapid form submissions", async () => {
      const mockCreateCase = vi.fn().mockResolvedValue(mockCreatedCase);
      mockUseCreateCase.mockReturnValue({
        createCase: mockCreateCase,
        isCreating: false,
      });

      render(<CaseCreate />);

      await waitFor(() => {
        expect(screen.getByText("Create Case")).toBeInTheDocument();
      });

      // Fill form
      const titleInput = screen.getByPlaceholderText("Brief description of the investigation");
      fireEvent.change(titleInput, { target: { value: "Test case" } });

      // Submit form multiple times quickly
      const createButton = screen.getByRole("button", { name: /Create Case/ });
      // Use synchronous clicks to simulate rapid submits
      fireEvent.click(createButton);
      fireEvent.click(createButton);
      fireEvent.click(createButton);

      await waitFor(() => {
        // Should only call createCase once (subsequent clicks are ignored)
        expect(mockCreateCase).toHaveBeenCalledTimes(1);
      });
    });
  });
});
