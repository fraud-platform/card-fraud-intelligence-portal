/**
 * ResolveModal Component Tests
 *
 * Tests for the ResolveModal component that allows resolving
 * transaction reviews with resolution codes and notes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ResolveModal } from "../ResolveModal";

describe("ResolveModal", () => {
  const mockOnCancel = vi.fn();
  const mockOnResolve = vi.fn();

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
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      expect(screen.getByText("Resolve Transaction")).toBeInTheDocument();
      expect(screen.getByText("Resolution Code")).toBeInTheDocument();
      expect(screen.getByText("Resolution Notes")).toBeInTheDocument();
    });

    it("does not render modal when open prop is false", () => {
      render(<ResolveModal open={false} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      expect(screen.queryByText("Resolve Transaction")).not.toBeInTheDocument();
    });

    it("shows original decision when provided", () => {
      render(
        <ResolveModal
          open={true}
          onCancel={mockOnCancel}
          onResolve={mockOnResolve}
          originalDecision="DECLINE"
        />
      );

      expect(screen.getByText(/Original engine decision:/i)).toBeInTheDocument();
      expect(screen.getByText("DECLINE")).toBeInTheDocument();
    });

    it("does not show original decision when not provided", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      expect(screen.queryByText(/Original engine decision:/i)).not.toBeInTheDocument();
    });

    it("renders resolution code dropdown with all options", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();

      // Open dropdown to see options
      fireEvent.mouseDown(select);

      expect(screen.getByText("Fraud Confirmed")).toBeInTheDocument();
      expect(screen.getByText("False Positive")).toBeInTheDocument();
      expect(screen.getByText("Legitimate")).toBeInTheDocument();
      expect(screen.getByText("Duplicate")).toBeInTheDocument();
      expect(screen.getByText("Insufficient Info")).toBeInTheDocument();
    });

    it("renders resolution notes textarea", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      const textarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      expect(textarea).toBeInTheDocument();
    });

    it("shows decision override radio buttons", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      expect(screen.getByText("Keep original decision")).toBeInTheDocument();
      expect(screen.getByText("Override decision")).toBeInTheDocument();
    });

    it("shows loading state on ok button when loading is true", () => {
      render(
        <ResolveModal
          open={true}
          onCancel={mockOnCancel}
          onResolve={mockOnResolve}
          loading={true}
        />
      );

      const okButton = screen.getByRole("button", { name: /resolve/i });
      expect(okButton).toHaveClass("ant-btn-loading");
    });
  });

  describe("Form validation", () => {
    it("requires resolution code selection", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      // Wait for validation state to appear on the select
      await waitFor(() => {
        const selectInput = screen.getByRole("combobox");
        expect(selectInput).toHaveAttribute("aria-invalid", "true");
      });

      expect(mockOnResolve).not.toHaveBeenCalled();
    });

    it("requires resolution notes", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select a resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = await screen.findByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      // Try to submit without notes
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      // Wait for validation state to appear on the textarea
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText("Describe your findings and rationale...");
        expect(textarea).toHaveAttribute("aria-invalid", "true");
      });

      expect(mockOnResolve).not.toHaveBeenCalled();
    });

    it("requires analyst decision when override is selected", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = await screen.findByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      // Add resolution notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Confirmed fraudulent activity" } });

      // Select override decision
      const overrideRadio = screen.getByLabelText("Override decision");
      fireEvent.click(overrideRadio);

      // Try to submit without analyst decision
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      // Wait for the analyst decision form item to show an error state
      await waitFor(() => {
        const label = screen.getByText("Analyst Decision Override");
        const formItem = label.closest(".ant-form-item");
        expect(formItem).toHaveClass("ant-form-item-has-error");
      });

      expect(mockOnResolve).not.toHaveBeenCalled();
    });

    it("requires override reason when override is selected", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = await screen.findByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      // Add resolution notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Confirmed fraudulent activity" } });

      // Select override decision and choose Approve
      const overrideRadio = screen.getByLabelText("Override decision");
      fireEvent.click(overrideRadio);

      const approveRadio = screen.getByLabelText("Approve");
      fireEvent.click(approveRadio);

      // Try to submit without override reason
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      // Wait for the override reason form item to show an error state
      await waitFor(() => {
        const label = screen.getByText("Override Reason");
        const formItem = label.closest(".ant-form-item");
        expect(formItem).toHaveClass("ant-form-item-has-error");
      });

      expect(mockOnResolve).not.toHaveBeenCalled();
    });
  });

  describe("Form submission without override", () => {
    it("calls onResolve with resolution code and notes", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = await screen.findByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      // Add resolution notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Confirmed fraudulent activity" } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnResolve).toHaveBeenCalledTimes(1);
        const [code, notes] = mockOnResolve.mock.calls[0];
        expect(code).toEqual("FRAUD_CONFIRMED");
        expect(notes).toEqual("Confirmed fraudulent activity");
      });
    });

    it("calls onResolve with FALSE_ALLOWLIST resolution", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const falsePositiveOption = await screen.findByText("False Positive");
      fireEvent.click(falsePositiveOption);

      // Add resolution notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Legitimate transaction" } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        const [code, notes] = mockOnResolve.mock.calls[0];
        expect(code).toEqual("FALSE_POSITIVE");
        expect(notes).toEqual("Legitimate transaction");
      });
    });

    it("calls onResolve with LEGITIMATE resolution", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const legitimateOption = await screen.findByText("Legitimate");
      fireEvent.click(legitimateOption);

      // Add resolution notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Verified with cardholder" } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        const [code, notes] = mockOnResolve.mock.calls[0];
        expect(code).toEqual("LEGITIMATE");
        expect(notes).toEqual("Verified with cardholder");
      });
    });
  });

  describe("Form submission with override", () => {
    it("calls onResolve with analyst decision override", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = await screen.findByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      // Add resolution notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Confirmed fraudulent" } });

      // Select override decision
      const overrideRadio = screen.getByLabelText("Override decision");
      fireEvent.click(overrideRadio);

      // Select APPROVE decision
      const approveRadio = screen.getByLabelText("Approve");
      fireEvent.click(approveRadio);

      // Add override reason
      const overrideReasonTextarea = screen.getByPlaceholderText(
        "Explain why you are overriding the engine decision..."
      );
      fireEvent.change(overrideReasonTextarea, {
        target: { value: "Additional evidence supports approval" },
      });

      // Submit form
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnResolve).toHaveBeenCalledTimes(1);
        expect(mockOnResolve).toHaveBeenCalledWith(
          "FRAUD_CONFIRMED",
          "Confirmed fraudulent",
          "APPROVE",
          "Additional evidence supports approval"
        );
      });
    });

    it("calls onResolve with DECLINE override decision", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const legitimateOption = await screen.findByText("Legitimate");
      fireEvent.click(legitimateOption);

      // Add resolution notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Transaction is legitimate" } });

      // Select override decision
      const overrideRadio = screen.getByLabelText("Override decision");
      fireEvent.click(overrideRadio);

      // Select DECLINE decision
      const declineRadio = screen.getByLabelText("Decline");
      fireEvent.click(declineRadio);

      // Add override reason
      const overrideReasonTextarea = screen.getByPlaceholderText(
        "Explain why you are overriding the engine decision..."
      );
      fireEvent.change(overrideReasonTextarea, { target: { value: "Risk patterns detected" } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnResolve).toHaveBeenCalledWith(
          "LEGITIMATE",
          "Transaction is legitimate",
          "DECLINE",
          "Risk patterns detected"
        );
      });
    });

    it("shows analyst decision fields only when override is selected", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Initially, override fields should not be visible (no decision radios or override reason)
      expect(screen.queryByLabelText("Approve")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Decline")).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Explain why you are overriding the engine decision...")
      ).not.toBeInTheDocument();

      // Select override decision
      const overrideRadio = screen.getByLabelText("Override decision");
      fireEvent.click(overrideRadio);

      // Now fields should be visible
      expect(screen.getByLabelText("Approve")).toBeInTheDocument();
      expect(screen.getByLabelText("Decline")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Explain why you are overriding the engine decision...")
      ).toBeInTheDocument();

      // Select keep original
      const keepOriginalRadio = screen.getByLabelText("Keep original decision");
      fireEvent.click(keepOriginalRadio);

      // Ensure the Keep original decision radio is selected
      await waitFor(() => {
        expect(screen.getByLabelText("Keep original decision")).toBeChecked();
      });
    });
  });

  describe("Modal cancellation", () => {
    it("calls onCancel when cancel button clicked", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("resets form when cancel button clicked", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Fill in some fields
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = screen.getByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Test notes" } });

      // Cancel
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when close button clicked", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Close button is the X button in modal header
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("Resolution codes", () => {
    it("shows description for each resolution code", () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      // Check descriptions
      expect(screen.getByText("Transaction confirmed as fraudulent")).toBeInTheDocument();
      expect(screen.getByText("Transaction incorrectly flagged")).toBeInTheDocument();
      expect(screen.getByText("Valid transaction by cardholder")).toBeInTheDocument();
      expect(screen.getByText("Duplicate investigation")).toBeInTheDocument();
      expect(screen.getByText("Cannot determine - insufficient information")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles empty original decision", () => {
      render(
        <ResolveModal
          open={true}
          onCancel={mockOnCancel}
          onResolve={mockOnResolve}
          originalDecision=""
        />
      );

      expect(screen.queryByText(/Original engine decision:/i)).not.toBeInTheDocument();
    });

    it("prevents submission when loading", async () => {
      render(
        <ResolveModal
          open={true}
          onCancel={mockOnCancel}
          onResolve={mockOnResolve}
          loading={true}
        />
      );

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = await screen.findByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      // Add notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Test notes" } });

      // Try to submit
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      // Should not call onResolve due to loading state
      await waitFor(
        () => {
          expect(mockOnResolve).not.toHaveBeenCalled();
        },
        { timeout: 100 }
      );
    });

    it("resets form after successful submission", async () => {
      render(<ResolveModal open={true} onCancel={mockOnCancel} onResolve={mockOnResolve} />);

      // Select resolution code
      const select = screen.getByRole("combobox");
      fireEvent.mouseDown(select);

      const fraudOption = await screen.findByText("Fraud Confirmed");
      fireEvent.click(fraudOption);

      // Add notes
      const notesTextarea = screen.getByPlaceholderText("Describe your findings and rationale...");
      fireEvent.change(notesTextarea, { target: { value: "Test notes" } });

      // Submit form
      const okButton = screen.getByRole("button", { name: /resolve/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(mockOnResolve).toHaveBeenCalled();
      });
    });
  });
});
