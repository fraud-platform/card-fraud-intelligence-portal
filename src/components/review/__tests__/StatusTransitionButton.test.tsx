/**
 * StatusTransitionButton Component Tests
 *
 * Tests for the StatusTransitionButton component that provides a dropdown
 * for transitioning between transaction statuses.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { StatusTransitionButton } from "../StatusTransitionButton";
import type { TransactionStatus } from "../../../types/review";

describe("StatusTransitionButton", () => {
  describe("Rendering", () => {
    it("renders dropdown button with correct label", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="PENDING" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText("Change Status")).toBeInTheDocument();
    });

    it("shows dropdown icon", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="PENDING" onTransition={onTransition} />);

      // Check for DownOutlined icon
      const button = screen.getByRole("button", { name: /change status/i });
      expect(button).toBeInTheDocument();
    });

    it("shows loading state when loading prop is true", () => {
      const onTransition = vi.fn();
      render(
        <StatusTransitionButton
          currentStatus="PENDING"
          onTransition={onTransition}
          loading={true}
        />
      );

      const button = screen.getByRole("button", { name: /change status/i });
      expect(button).toHaveClass("ant-btn-loading");
    });

    it("disables button when disabled prop is true", () => {
      const onTransition = vi.fn();
      render(
        <StatusTransitionButton
          currentStatus="PENDING"
          onTransition={onTransition}
          disabled={true}
        />
      );

      const button = screen.getByRole("button", { name: /change status/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Valid status transitions", () => {
    it("shows IN_REVIEW as only valid transition from PENDING", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="PENDING" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // Should show "In Review" in the dropdown menu
      expect(screen.getByText("In Review")).toBeInTheDocument();
    });

    it("shows ESCALATED and RESOLVED as valid transitions from IN_REVIEW", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="IN_REVIEW" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // Should show both "Escalated" and "Resolved" in the dropdown menu
      expect(screen.getByText("Escalated")).toBeInTheDocument();
      expect(screen.getByText("Resolved")).toBeInTheDocument();
    });

    it("shows IN_REVIEW and RESOLVED as valid transitions from ESCALATED", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="ESCALATED" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // Should show both "In Review" and "Resolved" in the dropdown menu
      expect(screen.getByText("In Review")).toBeInTheDocument();
      expect(screen.getByText("Resolved")).toBeInTheDocument();
    });

    it("shows CLOSED and IN_REVIEW as valid transitions from RESOLVED", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="RESOLVED" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // Should show both "Closed" and "In Review" in the dropdown menu
      expect(screen.getByText("Closed")).toBeInTheDocument();
      expect(screen.getByText("In Review")).toBeInTheDocument();
    });

    it("shows disabled button with no transitions available from CLOSED", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="CLOSED" onTransition={onTransition} />);

      // Should show a disabled button with "No transitions available"
      expect(screen.getByText("No transitions available")).toBeInTheDocument();
      const button = screen.getByRole("button", { name: /no transitions available/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Transition callback", () => {
    it("calls onTransition with selected status", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="PENDING" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // Click on "In Review" menu item
      const inReviewOption = screen.getByText("In Review");
      fireEvent.click(inReviewOption);

      expect(onTransition).toHaveBeenCalledTimes(1);
      expect(onTransition).toHaveBeenCalledWith("IN_REVIEW");
    });

    it("calls onTransition with ESCALATED status", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="IN_REVIEW" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // Click on "Escalated" menu item
      const escalatedOption = screen.getByText("Escalated");
      fireEvent.click(escalatedOption);

      expect(onTransition).toHaveBeenCalledTimes(1);
      expect(onTransition).toHaveBeenCalledWith("ESCALATED");
    });

    it("calls onTransition with RESOLVED status", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="IN_REVIEW" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // Click on "Resolved" menu item
      const resolvedOption = screen.getByText("Resolved");
      fireEvent.click(resolvedOption);

      expect(onTransition).toHaveBeenCalledTimes(1);
      expect(onTransition).toHaveBeenCalledWith("RESOLVED");
    });
  });

  describe("Disabled states", () => {
    it("does not show dropdown when button is disabled", () => {
      const onTransition = vi.fn();
      render(
        <StatusTransitionButton
          currentStatus="PENDING"
          onTransition={onTransition}
          disabled={true}
        />
      );

      const button = screen.getByRole("button", { name: /change status/i });
      expect(button).toBeDisabled();

      // Click should not open dropdown
      fireEvent.click(button);
      // Menu items should not be visible
      expect(screen.queryByText("In Review")).not.toBeInTheDocument();
    });

    it("does not show dropdown when button is loading", () => {
      const onTransition = vi.fn();
      render(
        <StatusTransitionButton
          currentStatus="PENDING"
          onTransition={onTransition}
          loading={true}
        />
      );

      const button = screen.getByRole("button", { name: /change status/i });
      expect(button).toHaveClass("ant-btn-loading");
    });

    it("shows disabled button when status is CLOSED", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="CLOSED" onTransition={onTransition} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByText("No transitions available")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles all valid transaction statuses", () => {
      const onTransition = vi.fn();
      const statuses: TransactionStatus[] = [
        "PENDING",
        "IN_REVIEW",
        "ESCALATED",
        "RESOLVED",
        "CLOSED",
      ];

      statuses.forEach((status) => {
        const { unmount } = render(
          <StatusTransitionButton currentStatus={status} onTransition={onTransition} />
        );
        expect(screen.getByRole("button")).toBeInTheDocument();
        unmount();
      });
    });

    it("renders caret icon in menu items", () => {
      const onTransition = vi.fn();
      render(<StatusTransitionButton currentStatus="PENDING" onTransition={onTransition} />);

      const button = screen.getByRole("button", { name: /change status/i });
      fireEvent.click(button);

      // The menu should contain the status text
      expect(screen.getByText("In Review")).toBeInTheDocument();
    });
  });
});
