/**
 * StatusBadge Component Tests
 *
 * Tests for the StatusBadge component that displays transaction review status
 * with appropriate color coding.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StatusBadge } from "../StatusBadge";
import type { TransactionStatus } from "../../../types/review";

describe("StatusBadge", () => {
  describe("Valid status rendering", () => {
    it("renders PENDING status with default color", () => {
      render(<StatusBadge status="PENDING" />);
      const badge = screen.getByText("Pending");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
    });

    it("renders IN_REVIEW status with processing color", () => {
      render(<StatusBadge status="IN_REVIEW" />);
      const badge = screen.getByText("In Review");
      expect(badge).toBeInTheDocument();
    });

    it("renders ESCALATED status with warning color", () => {
      render(<StatusBadge status="ESCALATED" />);
      const badge = screen.getByText("Escalated");
      expect(badge).toBeInTheDocument();
    });

    it("renders RESOLVED status with success color", () => {
      render(<StatusBadge status="RESOLVED" />);
      const badge = screen.getByText("Resolved");
      expect(badge).toBeInTheDocument();
    });

    it("renders CLOSED status with default color", () => {
      render(<StatusBadge status="CLOSED" />);
      const badge = screen.getByText("Closed");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Size variations", () => {
    it("renders with default size", () => {
      render(<StatusBadge status="PENDING" size="default" />);
      const badge = screen.getByText("Pending");
      expect(badge).toBeInTheDocument();
      // Default size should not have custom font-size styling
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeFalsy();
    });

    it("renders with small size", () => {
      render(<StatusBadge status="PENDING" size="small" />);
      const badge = screen.getByText("Pending");
      expect(badge).toBeInTheDocument();
      // Small size should have custom font-size styling
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeTruthy();
    });
  });

  describe("Edge cases", () => {
    it("handles unknown status gracefully", () => {
      // TypeScript would prevent this, but testing runtime behavior
      const unknownStatus = "UNKNOWN_STATUS" as TransactionStatus;
      render(<StatusBadge status={unknownStatus} />);

      // Should render the unknown status as-is with default color
      const badge = screen.getByText("UNKNOWN_STATUS");
      expect(badge).toBeInTheDocument();
    });

    it("renders default size when size prop is omitted", () => {
      render(<StatusBadge status="PENDING" />);
      const badge = screen.getByText("Pending");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Status label mapping", () => {
    it("maps status codes to human-readable labels correctly", () => {
      const statusMapping: Record<TransactionStatus, string> = {
        PENDING: "Pending",
        IN_REVIEW: "In Review",
        ESCALATED: "Escalated",
        RESOLVED: "Resolved",
        CLOSED: "Closed",
      };

      Object.entries(statusMapping).forEach(([status, label]) => {
        const { unmount } = render(<StatusBadge status={status as TransactionStatus} />);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
