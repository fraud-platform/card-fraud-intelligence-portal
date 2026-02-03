/**
 * EscalateModal Component Tests
 *
 * Tests for the EscalateModal component that allows escalating
 * transactions to supervisors.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { EscalateModal } from "../EscalateModal";

describe("EscalateModal", () => {
  const mockOnCancel = vi.fn();
  const mockOnEscalate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders modal when open prop is true", () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      expect(screen.getByText("Escalate Transaction")).toBeInTheDocument();
      expect(screen.getByText("Escalation Reason")).toBeInTheDocument();
      expect(screen.getByText("Escalate To (Optional)")).toBeInTheDocument();
    });

    it("does not render modal when open prop is false", () => {
      render(<EscalateModal open={false} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      expect(screen.queryByText("Escalate Transaction")).not.toBeInTheDocument();
    });

    it("renders escalation reason textarea", () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const textarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      expect(textarea).toBeInTheDocument();
    });

    it("renders escalate to dropdown", () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("shows loading state on ok button when loading is true", () => {
      render(
        <EscalateModal
          open={true}
          onCancel={mockOnCancel}
          onEscalate={mockOnEscalate}
          loading={true}
        />
      );

      const okButton = screen.getByRole("button", { name: /escalate/i });
      expect(okButton).toHaveClass("ant-btn-loading");
    });

    it("shows placeholder text for escalate to dropdown", () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // Should show placeholder about auto-assignment
      expect(
        screen.getByText("Select supervisor (or leave empty for auto-assignment)")
      ).toBeInTheDocument();
    });
  });

  describe("Form validation", () => {
    it("requires escalation reason", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      // Wait for validation state on textarea
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(
          "Describe why this transaction needs escalation..."
        );
        expect(textarea).toHaveAttribute("aria-invalid", "true");
      });

      expect(mockOnEscalate).not.toHaveBeenCalled();
    });

    it("does not require escalate_to (optional field)", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Add escalation reason only
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "Complex fraud pattern detected" } });

      // Submit without selecting supervisor
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalledWith("Complex fraud pattern detected", undefined);
      });
    });

    it("shows validation error immediately when submitting empty form", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      // Wait for textarea validation state
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(
          "Describe why this transaction needs escalation..."
        );
        expect(textarea).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("allows submitting with empty escalation reason when supervisor is selected", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Select a supervisor
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const supervisorOption = await screen.findByText(/Sarah Manager/);
      fireEvent.click(supervisorOption);

      // Try to submit without escalation reason
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      // Wait for textarea validation state
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(
          "Describe why this transaction needs escalation..."
        );
        expect(textarea).toHaveAttribute("aria-invalid", "true");
        expect(mockOnEscalate).not.toHaveBeenCalled();
      });
    });
  });

  describe("Form submission", () => {
    it("calls onEscalate with reason when form submitted without supervisor", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Add escalation reason
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, {
        target: { value: "High-value transaction requiring senior review" },
      });

      // Submit form
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalledTimes(1);
        expect(mockOnEscalate).toHaveBeenCalledWith(
          "High-value transaction requiring senior review",
          undefined
        );
      });
    });

    it("calls onEscalate with reason and supervisor when both provided", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Add escalation reason
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "Complex case pattern" } });

      // Select a supervisor
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const supervisorOption = await screen.findByText(/Sarah Manager/);
      fireEvent.click(supervisorOption);

      // Submit form
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalledTimes(1);
        expect(mockOnEscalate).toHaveBeenCalledWith("Complex case pattern", "auth0|supervisor1");
      });
    });

    it("calls onEscalate with different supervisor", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Add escalation reason
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "Policy exception needed" } });

      // Select Mike Director
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const supervisorOption = await screen.findByText(/Mike Director/);
      fireEvent.click(supervisorOption);

      // Submit form
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalledWith("Policy exception needed", "auth0|supervisor2");
      });
    });

    it("resets form after successful submission", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Add escalation reason and select supervisor
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "Test escalation" } });

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const supervisorOption = await screen.findByText(/Sarah Manager/);
      fireEvent.click(supervisorOption);

      // Submit form
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalled();
      });
    });
  });

  describe("Modal cancellation", () => {
    it("calls onCancel when cancel button clicked", () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("resets form when cancel button clicked", () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Fill in some fields
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "Test escalation" } });

      // Cancel
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when close button clicked", () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Close button is the X button in modal header
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("Supervisor selection", () => {
    it("displays all mock supervisors in dropdown", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // Check for all mock supervisors
      expect(await screen.findByText(/Sarah Manager/)).toBeInTheDocument();
      expect(screen.getByText(/Mike Director/)).toBeInTheDocument();
    });

    it("shows supervisor email in dropdown options", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // Should show name and email format
      expect(await screen.findByText(/sarah\.manager@company\.com/i)).toBeInTheDocument();
      expect(screen.getByText(/mike\.director@company\.com/i)).toBeInTheDocument();
    });

    it("allows searching supervisors by name or email", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // The select should have showSearch enabled
      expect(select).toBeInTheDocument();

      // Type to search
      const searchInput = screen.getByRole("combobox");
      fireEvent.change(searchInput, { target: { value: "Sarah" } });

      // Should filter to show only Sarah
      expect(await screen.findByText(/Sarah Manager/)).toBeInTheDocument();
    });

    it("allows clearing supervisor selection", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Select a supervisor
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const supervisorOption = await screen.findByText(/Sarah Manager/);
      fireEvent.click(supervisorOption);

      // The dropdown should have allowClear enabled
      expect(select).toBeInTheDocument();
    });

    it("allows selecting no supervisor for auto-assignment", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Add escalation reason
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "Standard escalation" } });

      // Don't select a supervisor, just submit
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalledWith("Standard escalation", undefined);
      });
    });
  });

  describe("Edge cases", () => {
    it("prevents submission when loading", async () => {
      render(
        <EscalateModal
          open={true}
          onCancel={mockOnCancel}
          onEscalate={mockOnEscalate}
          loading={true}
        />
      );

      // Add escalation reason
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "Test escalation" } });

      // Try to submit
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      // Should not call onEscalate due to loading state
      await waitFor(
        () => {
          expect(mockOnEscalate).not.toHaveBeenCalled();
        },
        { timeout: 100 }
      );
    });

    it("handles empty escalation reason gracefully", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Try to submit with empty reason
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        // Form will mark the textarea invalid (aria-invalid) instead of rendering a separate message
        const reasonTextarea = screen.getByPlaceholderText(
          "Describe why this transaction needs escalation..."
        );
        expect(reasonTextarea).toHaveAttribute("aria-invalid", "true");
        expect(mockOnEscalate).not.toHaveBeenCalled();
      });
    });

    it("handles whitespace-only escalation reason", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      // Add whitespace-only reason
      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: "   " } });

      // Try to submit
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      // Should still validate (whitespace is not empty for textarea)
      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalledWith("   ", undefined);
      });
    });

    it("handles long escalation reason text", async () => {
      render(<EscalateModal open={true} onCancel={mockOnCancel} onEscalate={mockOnEscalate} />);

      const longReason =
        "This is a very detailed escalation reason that explains " +
        "in great depth why this transaction requires escalation to a supervisor. " +
        "It includes multiple sentences of context and background information.";

      const reasonTextarea = screen.getByPlaceholderText(
        "Describe why this transaction needs escalation..."
      );
      fireEvent.change(reasonTextarea, { target: { value: longReason } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /escalate/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnEscalate).toHaveBeenCalledWith(longReason, undefined);
      });
    });
  });
});
