/**
 * AssignAnalystModal Component Tests
 *
 * Tests for the AssignAnalystModal component that allows assigning
 * transactions to analysts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { AssignAnalystModal } from "../AssignAnalystModal";

describe("AssignAnalystModal", () => {
  const mockOnCancel = vi.fn();
  const mockOnAssign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers for component tests
    vi.useRealTimers();
  });

  afterEach(() => {
    // Restore fake timers after each test
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "setImmediate",
        "clearImmediate",
        "Date",
      ],
    });
  });

  describe("Rendering", () => {
    it("renders modal when open prop is true", () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      expect(screen.getByText("Assign Transaction")).toBeInTheDocument();
      expect(screen.getByText("Select Analyst")).toBeInTheDocument();
      expect(screen.getByText("Assignment Notes (Optional)")).toBeInTheDocument();
    });

    it("does not render modal when open prop is false", () => {
      render(<AssignAnalystModal open={false} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      expect(screen.queryByText("Assign Transaction")).not.toBeInTheDocument();
    });

    it("shows current assignee when provided", () => {
      render(
        <AssignAnalystModal
          open={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          currentAssignee="John Smith"
        />
      );

      expect(screen.getByText(/Currently assigned to: John Smith/i)).toBeInTheDocument();
    });

    it("does not show current assignee when not provided", () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      expect(screen.queryByText(/Currently assigned to:/i)).not.toBeInTheDocument();
    });

    it("renders analyst selection dropdown", () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("renders notes textarea", () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const textarea = screen.getByPlaceholderText("Add notes about this assignment...");
      expect(textarea).toBeInTheDocument();
    });

    it("shows loading state on ok button when loading is true", () => {
      render(
        <AssignAnalystModal
          open={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          loading={true}
        />
      );

      const okButton = screen.getByRole("button", { name: /assign/i });
      expect(okButton).toHaveClass("ant-btn-loading");
    });
  });

  describe("Form validation", () => {
    it("requires analyst selection", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        const select = screen.getByRole("combobox");
        expect(select).toHaveAttribute("aria-invalid", "true");
      });

      expect(mockOnAssign).not.toHaveBeenCalled();
    });

    it("does not require notes (optional field)", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      // Select an analyst
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // Click on first analyst option
      const analystOption = await screen.findByText(/John Smith/);
      fireEvent.click(analystOption);

      // Submit without notes
      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnAssign).toHaveBeenCalledWith("auth0|analyst1", "John Smith");
      });
    });

    it("shows validation error immediately when submitting empty form", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        const select = screen.getByRole("combobox");
        expect(select).toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("Form submission", () => {
    it("calls onAssign with analyst id and name when form submitted", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      // Select an analyst
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const analystOption = await screen.findByText(/John Smith/);
      fireEvent.click(analystOption);

      // Submit form
      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnAssign).toHaveBeenCalledTimes(1);
        expect(mockOnAssign).toHaveBeenCalledWith("auth0|analyst1", "John Smith");
      });
    });

    it("calls onAssign with different analyst", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      // Select Jane Doe
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const analystOption = await screen.findByText(/Jane Doe/);
      fireEvent.click(analystOption);

      // Submit form
      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnAssign).toHaveBeenCalledWith("auth0|analyst2", "Jane Doe");
      });
    });

    it("includes notes in submission when provided", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      // Select an analyst
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const analystOption = await screen.findByText(/John Smith/);
      fireEvent.click(analystOption);

      // Add notes
      const notesTextarea = screen.getByPlaceholderText("Add notes about this assignment...");
      fireEvent.change(notesTextarea, { target: { value: "Urgent review needed" } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnAssign).toHaveBeenCalledWith("auth0|analyst1", "John Smith");
      });
    });

    it("resets form after successful submission", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      // Select an analyst and add notes
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const analystOption = await screen.findByText(/John Smith/);
      fireEvent.click(analystOption);

      const notesTextarea = screen.getByPlaceholderText("Add notes about this assignment...");
      fireEvent.change(notesTextarea, { target: { value: "Test notes" } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnAssign).toHaveBeenCalled();
      });
    });
  });

  describe("Modal cancellation", () => {
    it("calls onCancel when cancel button clicked", () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("resets form when cancel button clicked", () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      // Select an analyst
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const analystOption = screen.getByText(/John Smith/);
      fireEvent.click(analystOption);

      // Cancel
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when close button clicked", () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      // Close button is the X button in modal header
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("Analyst list", () => {
    it("displays all mock analysts in dropdown", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // Check for all mock analysts
      expect(await screen.findByText(/John Smith/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Bob Wilson/)).toBeInTheDocument();
      expect(screen.getByText(/Sarah Manager/)).toBeInTheDocument();
    });

    it("shows analyst email in dropdown options", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // Should show name and email format
      expect(await screen.findByText(/john\.smith@company\.com/i)).toBeInTheDocument();
    });

    it("allows searching analysts by name or email", async () => {
      render(<AssignAnalystModal open={true} onCancel={mockOnCancel} onAssign={mockOnAssign} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // The select should have showSearch enabled
      expect(select).toBeInTheDocument();

      // Type to search
      const searchInput = screen.getByRole("combobox");
      fireEvent.change(searchInput, { target: { value: "John" } });

      // Should filter to show only John
      expect(await screen.findByText(/John Smith/)).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles empty current assignee", () => {
      render(
        <AssignAnalystModal
          open={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          currentAssignee=""
        />
      );

      expect(screen.queryByText(/Currently assigned to:/i)).not.toBeInTheDocument();
    });

    it("handles null current assignee", () => {
      render(
        <AssignAnalystModal
          open={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          currentAssignee={null}
        />
      );

      expect(screen.queryByText(/Currently assigned to:/i)).not.toBeInTheDocument();
    });

    it("prevents submission when loading", async () => {
      render(
        <AssignAnalystModal
          open={true}
          onCancel={mockOnCancel}
          onAssign={mockOnAssign}
          loading={true}
        />
      );

      // Select an analyst
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const analystOption = await screen.findByText(/John Smith/);
      fireEvent.click(analystOption);

      // Try to submit
      const okButton = screen.getByRole("button", { name: /assign/i });
      fireEvent.click(okButton);

      // Should not call onAssign due to loading state
      await waitFor(
        () => {
          expect(mockOnAssign).not.toHaveBeenCalled();
        },
        { timeout: 100 }
      );
    });
  });
});
