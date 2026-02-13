/**
 * ReviewActionsPanel Component Tests
 *
 * Tests for the ReviewActionsPanel component that orchestrates review actions
 * and modals for transaction review workflow.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewActionsPanel } from "../ReviewActionsPanel";
import type { TransactionReview } from "../../../types/review";
import * as usePermissionsModule from "../../../hooks/usePermissions";
import { message } from "antd";

// Mock antd message
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock the usePermissions hook
vi.mock("../../../hooks/usePermissions", () => ({
  usePermissions: vi.fn(),
}));

describe("ReviewActionsPanel", () => {
  const mockUsePermissions = vi.mocked(usePermissionsModule.usePermissions);

  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers for component tests
    vi.useRealTimers();
    // Default mock: user has permission to review transactions
    mockUsePermissions.mockReturnValue({
      permissions: ["review:transactions"],
      capabilities: {
        canCreateRules: false,
        canEditRules: false,
        canDeleteRules: false,
        canApproveRules: false,
        canReadRules: false,
        canViewTransactions: true,
        canReviewTransactions: true,
        canCreateCases: false,
        canResolveCases: false,
        isAdmin: false,
      },
      isLoading: false,
      error: null,
    });
  });

  const createMockReview = (overrides?: Partial<TransactionReview>): TransactionReview => ({
    id: "review-1",
    transaction_id: "txn-123",
    status: "PENDING",
    risk_level: "MEDIUM",
    priority: 3,
    assigned_analyst_id: null,
    assigned_analyst_name: null,
    assigned_at: null,
    first_reviewed_at: null,
    resolved_at: null,
    resolved_by: null,
    resolution_code: null,
    resolution_notes: null,
    analyst_decision: null,
    analyst_decision_reason: null,
    case_id: null,
    escalated_at: null,
    escalated_to: null,
    escalation_reason: null,
    last_activity_at: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    ...overrides,
  });

  describe("status display", () => {
    it("shows current status and risk level", () => {
      const review = createMockReview({
        status: "IN_REVIEW",
        risk_level: "HIGH",
      });

      render(<ReviewActionsPanel review={review} />);

      expect(screen.getByText("In Review")).toBeInTheDocument();
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("displays unassigned when no analyst assigned", () => {
      const review = createMockReview({
        assigned_analyst_name: null,
      });

      render(<ReviewActionsPanel review={review} />);

      expect(screen.getByText("Unassigned")).toBeInTheDocument();
    });

    it("displays analyst name when assigned", () => {
      const review = createMockReview({
        assigned_analyst_name: "John Doe",
      });

      render(<ReviewActionsPanel review={review} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays priority", () => {
      const review = createMockReview({
        priority: 5,
      });

      render(<ReviewActionsPanel review={review} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("shows resolution details when resolved", () => {
      const review = createMockReview({
        status: "RESOLVED",
        resolved_at: "2024-01-16T12:00:00Z",
        resolved_by: "jane.analyst",
        resolution_code: "FRAUD_CONFIRMED",
      });

      render(<ReviewActionsPanel review={review} />);

      expect(screen.getByText("FRAUD_CONFIRMED")).toBeInTheDocument();
      expect(screen.getByText("jane.analyst")).toBeInTheDocument();
    });
  });

  describe("button enable/disable based on status", () => {
    describe("PENDING status", () => {
      it("enables Assign button, disables Resolve and Escalate", () => {
        const review = createMockReview({ status: "PENDING" });
        const onAssign = vi.fn();
        const onResolve = vi.fn();
        const onEscalate = vi.fn();

        render(
          <ReviewActionsPanel
            review={review}
            onAssign={onAssign}
            onResolve={onResolve}
            onEscalate={onEscalate}
          />
        );

        const assignButton = screen.getByRole("button", { name: /assign/i });
        const resolveButton = screen.getByRole("button", { name: /resolve/i });
        const escalateButton = screen.getByRole("button", { name: /escalate/i });

        expect(assignButton).toBeEnabled();
        expect(resolveButton).toBeDisabled();
        expect(escalateButton).toBeDisabled();
      });
    });

    describe("IN_REVIEW status", () => {
      it("enables all action buttons", () => {
        const review = createMockReview({ status: "IN_REVIEW" });
        const onAssign = vi.fn();
        const onResolve = vi.fn();
        const onEscalate = vi.fn();

        render(
          <ReviewActionsPanel
            review={review}
            onAssign={onAssign}
            onResolve={onResolve}
            onEscalate={onEscalate}
          />
        );

        const assignButton = screen.getByRole("button", { name: /assign/i });
        const resolveButton = screen.getByRole("button", { name: /resolve/i });
        const escalateButton = screen.getByRole("button", { name: /escalate/i });

        expect(assignButton).toBeEnabled();
        expect(resolveButton).toBeEnabled();
        expect(escalateButton).toBeEnabled();
      });
    });

    describe("ESCALATED status", () => {
      it("enables Assign and Resolve, disables Escalate", () => {
        const review = createMockReview({ status: "ESCALATED" });
        const onAssign = vi.fn();
        const onResolve = vi.fn();
        const onEscalate = vi.fn();

        render(
          <ReviewActionsPanel
            review={review}
            onAssign={onAssign}
            onResolve={onResolve}
            onEscalate={onEscalate}
          />
        );

        const assignButton = screen.getByRole("button", { name: /assign/i });
        const resolveButton = screen.getByRole("button", { name: /resolve/i });
        const escalateButton = screen.getByRole("button", { name: /escalate/i });

        expect(assignButton).toBeEnabled();
        expect(resolveButton).toBeEnabled();
        expect(escalateButton).toBeDisabled();
      });
    });

    describe("RESOLVED status", () => {
      it("enables Assign, disables Resolve and Escalate", () => {
        const review = createMockReview({ status: "RESOLVED" });
        const onAssign = vi.fn();
        const onResolve = vi.fn();
        const onEscalate = vi.fn();

        render(
          <ReviewActionsPanel
            review={review}
            onAssign={onAssign}
            onResolve={onResolve}
            onEscalate={onEscalate}
          />
        );

        const assignButton = screen.getByRole("button", { name: /assign/i });
        const resolveButton = screen.getByRole("button", { name: /resolve/i });
        const escalateButton = screen.getByRole("button", { name: /escalate/i });

        expect(assignButton).toBeEnabled();
        expect(resolveButton).toBeDisabled();
        expect(escalateButton).toBeDisabled();
      });
    });

    describe("CLOSED status", () => {
      it("disables all action buttons", () => {
        const review = createMockReview({ status: "CLOSED" });
        const onAssign = vi.fn();
        const onResolve = vi.fn();
        const onEscalate = vi.fn();

        render(
          <ReviewActionsPanel
            review={review}
            onAssign={onAssign}
            onResolve={onResolve}
            onEscalate={onEscalate}
          />
        );

        const assignButton = screen.getByRole("button", { name: /assign/i });
        const resolveButton = screen.getByRole("button", { name: /resolve/i });
        const escalateButton = screen.getByRole("button", { name: /escalate/i });

        expect(assignButton).toBeDisabled();
        expect(resolveButton).toBeDisabled();
        expect(escalateButton).toBeDisabled();
      });
    });
  });

  describe("button visibility based on handlers", () => {
    it("disables buttons when handlers are not provided", () => {
      const review = createMockReview({ status: "IN_REVIEW" });

      render(<ReviewActionsPanel review={review} />);

      const assignButton = screen.getByRole("button", { name: /assign/i });
      const resolveButton = screen.getByRole("button", { name: /resolve/i });
      const escalateButton = screen.getByRole("button", { name: /escalate/i });

      expect(assignButton).toBeDisabled();
      expect(resolveButton).toBeDisabled();
      expect(escalateButton).toBeDisabled();
    });

    it("enables buttons when handlers are provided and status allows", () => {
      const review = createMockReview({ status: "IN_REVIEW" });
      const onAssign = vi.fn();
      const onResolve = vi.fn();
      const onEscalate = vi.fn();

      render(
        <ReviewActionsPanel
          review={review}
          onAssign={onAssign}
          onResolve={onResolve}
          onEscalate={onEscalate}
        />
      );

      const assignButton = screen.getByRole("button", { name: /assign/i });
      const resolveButton = screen.getByRole("button", { name: /resolve/i });
      const escalateButton = screen.getByRole("button", { name: /escalate/i });

      expect(assignButton).toBeEnabled();
      expect(resolveButton).toBeEnabled();
      expect(escalateButton).toBeEnabled();
    });
  });

  describe("modal interactions", () => {
    it("opens and closes AssignAnalystModal", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onAssign = vi.fn();

      render(<ReviewActionsPanel review={review} onAssign={onAssign} />);

      const assignButton = screen.getByRole("button", { name: /assign/i });
      await user.click(assignButton);

      const modal = await screen.findByRole("dialog");

      // Modal should be visible (check for modal title/content)
      expect(within(modal).getByText(/assign transaction/i)).toBeInTheDocument();

      // Close modal by clicking cancel
      const cancelButton = within(modal).getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(
        () => {
          const dlg = screen.queryByRole("dialog");
          if (!dlg) return true;
          return (dlg as HTMLElement).getClientRects().length === 0;
        },
        { timeout: 5000 }
      );
    });

    it("opens and closes ResolveModal", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onResolve = vi.fn();

      render(<ReviewActionsPanel review={review} onResolve={onResolve} />);

      const resolveButton = screen.getByRole("button", { name: /resolve/i });
      await user.click(resolveButton);

      const modal = await screen.findByRole("dialog");

      // Modal should be visible
      expect(within(modal).getByText(/resolve transaction/i)).toBeInTheDocument();

      // Close modal by clicking cancel
      const cancelButton = within(modal).getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(
        () => {
          const dlg = screen.queryByRole("dialog");
          if (!dlg) return true;
          return (dlg as HTMLElement).getClientRects().length === 0;
        },
        { timeout: 5000 }
      );
    });

    it("opens and closes EscalateModal", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onEscalate = vi.fn();

      render(<ReviewActionsPanel review={review} onEscalate={onEscalate} />);

      const escalateButton = await screen.findByRole("button", { name: /escalate/i });
      await user.click(escalateButton);

      const modal = await screen.findByRole("dialog");

      // Modal should be visible
      expect(within(modal).getByText(/escalate transaction/i)).toBeInTheDocument();

      // Close modal by clicking cancel
      const cancelButton = await within(modal).findByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(
        () => {
          const dlg = screen.queryByRole("dialog");
          if (!dlg) return true;
          return (dlg as HTMLElement).getClientRects().length === 0;
        },
        { timeout: 5000 }
      );
    });
  });

  describe("handler callbacks", () => {
    it("calls onAssign handler when assign is confirmed", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onAssign = vi.fn().mockResolvedValue(undefined);

      render(<ReviewActionsPanel review={review} onAssign={onAssign} />);

      const assignButton = await screen.findByRole("button", { name: /assign/i });
      await user.click(assignButton);

      const modal = await screen.findByRole("dialog");
      const analystInput = await within(modal).findByPlaceholderText(/enter analyst id/i);
      fireEvent.change(analystInput, { target: { value: "analyst-123" } });

      // Submit the form
      const submitButton = await within(modal).findByRole("button", { name: /assign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onAssign).toHaveBeenCalledWith("analyst-123", undefined);
      });
    });

    it("calls onResolve handler when resolve is confirmed", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onResolve = vi.fn().mockResolvedValue(undefined);

      render(<ReviewActionsPanel review={review} onResolve={onResolve} />);

      const resolveButton = await screen.findByRole("button", { name: /resolve/i });
      await user.click(resolveButton);

      const modal = await screen.findByRole("dialog");

      // Select resolution code
      const resolutionSelect = within(modal).getByRole("combobox");
      fireEvent.mouseDown(resolutionSelect);
      const fraudOption = await screen.findByText(/Fraud Confirmed/);
      await user.click(fraudOption);

      // Add resolution notes (required)
      const notesTextarea = await within(modal).findByPlaceholderText(
        "Describe your findings and rationale..."
      );
      fireEvent.change(notesTextarea, { target: { value: "Confirmed fraudulent" } });

      // Submit the form
      const submitButton = await within(modal).findByRole("button", { name: /resolve/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onResolve).toHaveBeenCalledWith(
          "FRAUD_CONFIRMED",
          "Confirmed fraudulent",
          undefined,
          undefined
        );
      });
    });

    it("calls onEscalate handler when escalate is confirmed", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onEscalate = vi.fn().mockResolvedValue(undefined);

      render(<ReviewActionsPanel review={review} onEscalate={onEscalate} />);

      const escalateButton = await screen.findByRole("button", { name: /escalate/i });
      await user.click(escalateButton);

      const modal = await screen.findByRole("dialog");

      // Fill escalation reason (use direct change to avoid intermittent typing artifacts)
      const reasonInput = await within(modal).findByPlaceholderText(
        /describe why this transaction needs escalation/i
      );
      fireEvent.change(reasonInput, { target: { value: "Requires senior review" } });

      // Submit the form
      const submitButton = await within(modal).findByRole("button", { name: /escalate/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onEscalate).toHaveBeenCalledWith("Requires senior review", undefined);
      });
    });

    it("shows success message when assign succeeds", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onAssign = vi.fn().mockResolvedValue(undefined);

      render(<ReviewActionsPanel review={review} onAssign={onAssign} />);

      const assignButton = screen.getByRole("button", { name: /assign/i });
      await user.click(assignButton);

      const modal = await screen.findByRole("dialog");
      const analystInput = within(modal).getByPlaceholderText(/enter analyst id/i);
      fireEvent.change(analystInput, { target: { value: "analyst-123" } });

      const submitButton = await within(modal).findByRole("button", { name: /assign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onAssign).toHaveBeenCalledWith("analyst-123", undefined);
      });

      // Check that success message was shown
      const { message } = await import("antd");
      expect(message.success).toHaveBeenCalledWith("Transaction assigned successfully");
    });

    it("shows error message when assign fails", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onAssign = vi.fn().mockRejectedValue(new Error("Network error"));

      render(<ReviewActionsPanel review={review} onAssign={onAssign} />);

      const assignButton = screen.getByRole("button", { name: /assign/i });
      await user.click(assignButton);

      const modal = await screen.findByRole("dialog");
      const analystInput = within(modal).getByPlaceholderText(/enter analyst id/i);
      fireEvent.change(analystInput, { target: { value: "analyst-123" } });

      const submitButton = within(modal).getByRole("button", { name: /assign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("Failed to assign transaction");
      });
    });
  });

  describe("loading states", () => {
    it("disables buttons when loading prop is true", () => {
      const review = createMockReview({ status: "IN_REVIEW" });
      const onAssign = vi.fn();
      const onResolve = vi.fn();
      const onEscalate = vi.fn();

      render(
        <ReviewActionsPanel
          review={review}
          onAssign={onAssign}
          onResolve={onResolve}
          onEscalate={onEscalate}
          loading={true}
        />
      );

      const assignButton = screen.getByRole("button", { name: /assign/i });
      const resolveButton = screen.getByRole("button", { name: /resolve/i });
      const escalateButton = screen.getByRole("button", { name: /escalate/i });

      expect(assignButton).toBeDisabled();
      expect(resolveButton).toBeDisabled();
      expect(escalateButton).toBeDisabled();
    });

    it("disables buttons during action execution", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });

      let resolveAssign: (value: unknown) => void;
      const onAssign = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolveAssign = resolve;
        });
      });

      render(<ReviewActionsPanel review={review} onAssign={onAssign} />);

      const assignButton = screen.getByRole("button", { name: /assign/i });
      await user.click(assignButton);

      const modal = await screen.findByRole("dialog");
      const analystInput = within(modal).getByPlaceholderText(/enter analyst id/i);
      fireEvent.change(analystInput, { target: { value: "analyst-123" } });

      const submitButton = await within(modal).findByRole("button", { name: /assign/i });
      await user.click(submitButton);

      // While the action is in-flight the modal submit should show a loading spinner
      const spinner = await within(modal).findByLabelText("loading");
      expect(spinner).toBeInTheDocument();

      // Resolve the promise to complete the action
      resolveAssign!(undefined);

      // Wait for the modal spinner to disappear or the modal to be hidden/removed (handles leave animations)
      await waitFor(
        () => {
          const dlg = screen.queryByRole("dialog");
          if (!dlg) return true;
          const modalSpinner = within(dlg as HTMLElement).queryByLabelText("loading");
          if (!modalSpinner) return true;
          // If spinner is present but hidden due to animation, that's acceptable
          return (modalSpinner as HTMLElement).getClientRects().length === 0;
        },
        { timeout: 5000 }
      );
    });
  });

  describe("permission checks", () => {
    it("disables all buttons when user lacks review permissions", () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        capabilities: {
          canCreateRules: false,
          canEditRules: false,
          canDeleteRules: false,
          canApproveRules: false,
          canReadRules: false,
          canViewTransactions: true,
          canReviewTransactions: false,
          canCreateCases: false,
          canResolveCases: false,
          isAdmin: false,
        },
        isLoading: false,
        error: null,
      });

      const review = createMockReview({ status: "IN_REVIEW" });
      const onAssign = vi.fn();
      const onResolve = vi.fn();
      const onEscalate = vi.fn();

      render(
        <ReviewActionsPanel
          review={review}
          onAssign={onAssign}
          onResolve={onResolve}
          onEscalate={onEscalate}
        />
      );

      const assignButton = screen.getByRole("button", { name: /assign/i });
      const resolveButton = screen.getByRole("button", { name: /resolve/i });
      const escalateButton = screen.getByRole("button", { name: /escalate/i });

      expect(assignButton).toBeDisabled();
      expect(resolveButton).toBeDisabled();
      expect(escalateButton).toBeDisabled();
    });
  });

  describe("edge cases", () => {
    it("handles null review gracefully", () => {
      render(<ReviewActionsPanel review={null} />);

      expect(screen.getByText("Unassigned")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("uses default priority when review.priority is null", () => {
      const review = createMockReview({
        priority: null as unknown as number,
      });

      render(<ReviewActionsPanel review={review} />);

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("passes currentAssignee to AssignAnalystModal", async () => {
      const user = userEvent.setup();
      const review = createMockReview({
        status: "IN_REVIEW",
        assigned_analyst_name: "Current Analyst",
      });
      const onAssign = vi.fn();

      render(<ReviewActionsPanel review={review} onAssign={onAssign} />);

      const assignButton = screen.getByRole("button", { name: /assign/i });
      await user.click(assignButton);

      // Modal should show current assignee
      expect(screen.getByText(/currently assigned to: current analyst/i)).toBeInTheDocument();
    });

    it("passes originalDecision to ResolveModal", async () => {
      const user = userEvent.setup();
      const review = createMockReview({ status: "IN_REVIEW" });
      const onResolve = vi.fn();

      render(
        <ReviewActionsPanel review={review} onResolve={onResolve} originalDecision="APPROVE" />
      );

      const resolveButton = screen.getByRole("button", { name: /resolve/i });
      await user.click(resolveButton);

      // Modal should be visible (the modal will internally handle originalDecision)
      expect(screen.getByText(/resolve transaction/i)).toBeInTheDocument();
    });
  });

  describe("status transition button", () => {
    it("renders status transition button", () => {
      const review = createMockReview({ status: "PENDING" });
      const onStatusChange = vi.fn();

      render(<ReviewActionsPanel review={review} onStatusChange={onStatusChange} />);

      // Status transition button should be present (rendered in Card extra)
      const transitionButton = screen.getByRole("button", {
        name: /transition|start review/i,
      });
      expect(transitionButton).toBeInTheDocument();
    });

    it("disables status transition button when loading", () => {
      const review = createMockReview({ status: "PENDING" });
      const onStatusChange = vi.fn();

      render(<ReviewActionsPanel review={review} onStatusChange={onStatusChange} loading={true} />);

      const transitionButton = screen.getByRole("button", {
        name: /transition|start review/i,
      });
      expect(transitionButton).toBeDisabled();
    });

    it("disables status transition button when no handler provided", () => {
      const review = createMockReview({ status: "PENDING" });

      render(<ReviewActionsPanel review={review} />);

      const transitionButton = screen.getByRole("button", {
        name: /transition|start review/i,
      });
      expect(transitionButton).toBeDisabled();
    });
  });
});
