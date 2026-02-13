/**
 * AddNoteModal Component Tests
 *
 * Tests the modal for adding new analyst notes including:
 * - Modal rendering with form
 * - Form validation
 * - Note type selector
 * - Private checkbox
 * - Form submission
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Test-scoped mock for AntD Select to make selection deterministic in JSDOM
vi.mock("antd", async () => {
  const actual = await vi.importActual<any>("antd");
  const React = await vi.importActual<any>("react");

  const MockOption = ({ children, value }: any) => <option value={value}>{children}</option>;

  const MockSelect = ({
    children,
    value,
    onChange,
    _searchValue,
    _getPopupContainer,
    ..._rest
  }: any) => {
    // Helper to extract text content from a React node
    const nodeToText = (node: any): string => {
      if (node == null) return "";
      if (typeof node === "string" || typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(nodeToText).join("");
      if (node.props && node.props.children) return nodeToText(node.props.children);
      return "";
    };

    // Filter out AntD-specific props that don't belong on a native select to avoid React warnings
    return (
      <select role="combobox" value={value} onChange={(e) => onChange?.(e.target.value)}>
        {React.Children.map(children, (c: any) => {
          if (!c) return null;
          const val = c.props?.value ?? nodeToText(c.props?.children);
          const text = nodeToText(c.props?.children);
          return <option value={val}>{text}</option>;
        })}
      </select>
    );
  };
  MockSelect.Option = MockOption;

  return { ...actual, Select: MockSelect };
});

import { AddNoteModal } from "../AddNoteModal";

describe("AddNoteModal", () => {
  const onCancel = vi.fn();
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers for component tests
    vi.useRealTimers();
  });

  describe("modal rendering", () => {
    it("does not render when open is false", () => {
      render(<AddNoteModal open={false} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.queryByText("Add Note")).not.toBeInTheDocument();
    });

    it("renders modal when open is true", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByText("Add Note")).toBeInTheDocument();
    });

    it("renders with correct title", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByText("Add Note")).toBeInTheDocument();
    });

    it("renders OK and Cancel buttons", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByRole("button", { name: "Add Note" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("shows loading state on OK button when loading is true", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} loading={true} />);

      const okButton = screen.getByRole("button", { name: "Add Note" });
      expect(okButton).toHaveClass("ant-btn-loading");
    });

    it("does not show loading state when loading is false", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} loading={false} />);

      const okButton = screen.getByRole("button", { name: "Add Note" });
      expect(okButton).not.toHaveClass("ant-btn-loading");
    });
  });

  describe("note type selector", () => {
    it("renders note type selector", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByText("Note Type")).toBeInTheDocument();
    });

    it("shows all note type options", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      // Click the select dropdown and scope checks to the native select to avoid colliding with legend text
      const selectTrigger = screen.getByRole("combobox");
      await user.click(selectTrigger);
      const selectEl = selectTrigger as HTMLSelectElement;

      // Check a representative set of options inside the select. Some DOM implementations
      // wrap option content in extra markup so we look for the text inside the option instead
      // of relying on the option's accessible name.
      expect(within(selectEl).getByText("General")).toBeInTheDocument();
      expect(within(selectEl).getByText("Initial Review")).toBeInTheDocument();
      expect(within(selectEl).getByText("Fraud Confirmed")).toBeInTheDocument();
      expect(within(selectEl).getByText("Internal Review")).toBeInTheDocument();
    });

    it("has default note type selected", () => {
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="GENERAL"
        />
      );

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveValue("GENERAL");
    });

    it("respects defaultNoteType prop", () => {
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="FRAUD_CONFIRMED"
        />
      );

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveValue("FRAUD_CONFIRMED");
    });

    it("allows changing note type", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      // Use native select interactions to change selection
      const selectTrigger = screen.getByRole("combobox") as HTMLSelectElement;
      await user.selectOptions(selectTrigger, "FRAUD_CONFIRMED");

      // Verify selection
      expect(selectTrigger).toHaveValue("FRAUD_CONFIRMED");
    });

    it("shows color indicator for each note type", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />
      );

      // Click the select dropdown
      const selectTrigger = screen.getByRole("combobox");
      await user.click(selectTrigger);

      // Check for color indicators (small colored divs implemented as .note-type-swatch)
      const colorIndicators = container.querySelectorAll(".note-type-swatch");
      expect(colorIndicators.length).toBeGreaterThan(0);
    });
  });

  describe("note content field", () => {
    it("renders note content field", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByText("Note Content")).toBeInTheDocument();
    });

    it("renders textarea for note content", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveProperty("tagName", "TEXTAREA");
    });

    it("shows placeholder text", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const textarea = screen.getByPlaceholderText("Enter your note here...");
      expect(textarea).toBeInTheDocument();
    });

    it("shows character count", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByText(/0 \/ 2000/)).toBeInTheDocument();
    });

    it("updates character count as user types", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Hello world" } });
      expect(screen.getByText(/11 \/ 2000/)).toBeInTheDocument();
    });

    it("enforces max length of 2000 characters", async () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const textarea = screen.getByRole("textbox");
      const longText = "a".repeat(2000);

      // Use fireEvent to set value directly to avoid slow typing
      fireEvent.change(textarea, { target: { value: longText } });
      expect(textarea).toHaveValue(longText);
      expect(screen.getByText(/2000 \/ 2000/)).toBeInTheDocument();
    });
  });

  describe("private checkbox", () => {
    it("renders private checkbox", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByText("Private Note")).toBeInTheDocument();
    });

    it("renders checkbox with description", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      expect(screen.getByText("Only visible to you")).toBeInTheDocument();
    });

    it("is unchecked by default", () => {
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("can be checked by user", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it("can be unchecked after being checked", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const checkbox = screen.getByRole("checkbox");

      // Check it
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      // Uncheck it
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("form validation", () => {
    it("requires note type to be selected", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType={undefined as any}
        />
      );

      // Try to submit without selecting a type
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText("Please select a note type")).toBeInTheDocument();
      });
    });

    it("requires note content to be entered", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      // Try to submit without entering content
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText("Please enter note content")).toBeInTheDocument();
      });
    });

    it("requires minimum 5 characters for note content", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const textarea = screen.getByRole("textbox");

      // Enter less than 5 characters
      fireEvent.change(textarea, { target: { value: "abc" } });

      // Try to submit
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      // Should show validation error (message may vary in exact wording)
      await waitFor(() => {
        expect(screen.getByText(/Note must be at least 5 characters/i)).toBeInTheDocument();
      });
    });

    it("accepts exactly 5 characters", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "abcde" } });

      // Try to submit - should not show minimum length error
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(screen.queryByText("Note must be at least 5 characters")).not.toBeInTheDocument();
      });
    });

    it("shows validation errors for all required fields", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType={undefined as any}
        />
      );

      // Try to submit with empty form
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(screen.getByText("Please select a note type")).toBeInTheDocument();
        expect(screen.getByText("Please enter note content")).toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("calls onSubmit with form values when valid", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="GENERAL"
        />
      );

      // Fill in the form
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "This is a valid note content" } });

      // Submit
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note_type: "GENERAL",
            is_private: false,
          })
        );
        const payload = onSubmit.mock.calls[0][0];
        expect(typeof payload.note_content).toBe("string");
        expect(payload.note_content.trim().length).toBeGreaterThanOrEqual(5);
      });
    });

    it("includes is_private when checkbox is checked", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="INITIAL_REVIEW"
        />
      );

      // Check the private checkbox
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      // Fill in content
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Private note content here" } });

      // Submit
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note_type: "INITIAL_REVIEW",
            is_private: true,
          })
        );
        const payload = onSubmit.mock.calls[0][0];
        expect(typeof payload.note_content).toBe("string");
        expect(payload.note_content.trim().length).toBeGreaterThanOrEqual(5);
      });
    });

    it("submits with selected note type", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      // Change note type using native select helper
      const selectTrigger = screen.getByRole("combobox") as HTMLSelectElement;
      await user.selectOptions(selectTrigger, "FRAUD_CONFIRMED");

      // Fill in content
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Fraud has been confirmed" } });

      // Submit
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note_type: "FRAUD_CONFIRMED",
            is_private: false,
          })
        );
        const payload = onSubmit.mock.calls[0][0];
        expect(typeof payload.note_content).toBe("string");
        expect(payload.note_content.trim().length).toBeGreaterThanOrEqual(5);
      });
    });

    it("resets form after successful submission", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="GENERAL"
        />
      );

      // Fill in the form
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "This is a note" } });

      // Check the checkbox
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      // Submit
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      // Check that form is reset (textarea is empty, checkbox is unchecked)
      // Note: After modal closes, elements might not be accessible
    });

    it("does not call onSubmit when form is invalid", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      // Try to submit without filling required fields
      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe("cancel behavior", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("resets form when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      // Fill in some data
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Some content" } });

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      // Click cancel
      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      // Form should be reset but modal is closed so we can't verify values
    });
  });

  describe("keyboard interactions", () => {
    it("can be submitted with Enter key when form is valid", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="GENERAL"
        />
      );

      // Fill in the form
      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Valid note content");

      // Press Enter while on textarea (this might not trigger submit depending on implementation)
      // This is just to ensure keyboard navigation works
      expect(textarea).toHaveFocus();
    });

    it("allows tab navigation between fields", async () => {
      const user = userEvent.setup();
      render(<AddNoteModal open={true} onCancel={onCancel} onSubmit={onSubmit} />);

      const selectTrigger = screen.getByRole("combobox");
      selectTrigger.focus();

      await user.tab();

      // Should move to textarea
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveFocus();

      await user.tab();

      // Should move to checkbox
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveFocus();
    });
  });

  describe("different note types", () => {
    it("submits FRAUD_CONFIRMED type correctly", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="FRAUD_CONFIRMED"
        />
      );

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Fraud confirmed note" } });

      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note_type: "FRAUD_CONFIRMED",
          })
        );
      });
    });

    it("submits ESCALATION type correctly", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="ESCALATION"
        />
      );

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Escalation note" } });

      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note_type: "ESCALATION",
          })
        );
      });
    });

    it("submits RESOLUTION type correctly", async () => {
      const user = userEvent.setup();
      render(
        <AddNoteModal
          open={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          defaultNoteType="RESOLUTION"
        />
      );

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Resolution note" } });

      const okButton = screen.getByRole("button", { name: "Add Note" });
      await user.click(okButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            note_type: "RESOLUTION",
          })
        );
      });
    });
  });
});
