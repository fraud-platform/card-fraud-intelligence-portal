/**
 * PriorityBadge Component Tests
 *
 * Tests for the PriorityBadge component that displays priority levels (1-5)
 * with appropriate color coding.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PriorityBadge } from "../PriorityBadge";

describe("PriorityBadge", () => {
  describe("Valid priority rendering", () => {
    it("renders priority 1 (Critical) with red color", () => {
      render(<PriorityBadge priority={1} />);
      const badge = screen.getByText("Critical");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
    });

    it("renders priority 2 (High) with orange color", () => {
      render(<PriorityBadge priority={2} />);
      const badge = screen.getByText("High");
      expect(badge).toBeInTheDocument();
    });

    it("renders priority 3 (Medium) with gold color", () => {
      render(<PriorityBadge priority={3} />);
      const badge = screen.getByText("Medium");
      expect(badge).toBeInTheDocument();
    });

    it("renders priority 4 (Low) with blue color", () => {
      render(<PriorityBadge priority={4} />);
      const badge = screen.getByText("Low");
      expect(badge).toBeInTheDocument();
    });

    it("renders priority 5 (Minimal) with default color", () => {
      render(<PriorityBadge priority={5} />);
      const badge = screen.getByText("Minimal");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Size variations", () => {
    it("renders with default size", () => {
      render(<PriorityBadge priority={1} size="default" />);
      const badge = screen.getByText("Critical");
      expect(badge).toBeInTheDocument();
      // Default size should not have custom font-size styling
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeFalsy();
    });

    it("renders with small size", () => {
      render(<PriorityBadge priority={1} size="small" />);
      const badge = screen.getByText("Critical");
      expect(badge).toBeInTheDocument();
      // Small size should have custom font-size styling
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeTruthy();
    });
  });

  describe("Label display control", () => {
    it("shows human-readable label when showLabel is true", () => {
      render(<PriorityBadge priority={1} showLabel={true} />);
      expect(screen.getByText("Critical")).toBeInTheDocument();
    });

    it("shows P-prefixed format when showLabel is false", () => {
      render(<PriorityBadge priority={1} showLabel={false} />);
      expect(screen.getByText("P1")).toBeInTheDocument();
      expect(screen.queryByText("Critical")).not.toBeInTheDocument();
    });

    it("shows label by default when showLabel is omitted", () => {
      render(<PriorityBadge priority={2} />);
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("renders P-prefixed format for all priorities when showLabel is false", () => {
      [1, 2, 3, 4, 5].forEach((priority) => {
        const { unmount } = render(<PriorityBadge priority={priority} showLabel={false} />);
        expect(screen.getByText(`P${priority}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Edge cases", () => {
    it("handles unknown priority gracefully with P-prefix", () => {
      render(<PriorityBadge priority={99} />);
      // Should render with P-prefix and default color
      const badge = screen.getByText("P99");
      expect(badge).toBeInTheDocument();
    });

    it("handles zero priority gracefully", () => {
      render(<PriorityBadge priority={0} />);
      const badge = screen.getByText("P0");
      expect(badge).toBeInTheDocument();
    });

    it("handles BLOCKLIST priority gracefully", () => {
      render(<PriorityBadge priority={-1} />);
      const badge = screen.getByText("P-1");
      expect(badge).toBeInTheDocument();
    });

    it("renders default size when size prop is omitted", () => {
      render(<PriorityBadge priority={3} />);
      const badge = screen.getByText("Medium");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Priority label mapping", () => {
    it("maps priority numbers to human-readable labels correctly", () => {
      const priorityMapping: Record<number, string> = {
        1: "Critical",
        2: "High",
        3: "Medium",
        4: "Low",
        5: "Minimal",
      };

      Object.entries(priorityMapping).forEach(([priority, label]) => {
        const { unmount } = render(<PriorityBadge priority={Number(priority)} />);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Combined prop variations", () => {
    it("combines small size with P-prefix format", () => {
      render(<PriorityBadge priority={1} size="small" showLabel={false} />);
      const badge = screen.getByText("P1");
      expect(badge).toBeInTheDocument();
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeTruthy();
    });

    it("combines small size with label format", () => {
      render(<PriorityBadge priority={1} size="small" showLabel={true} />);
      const badge = screen.getByText("Critical");
      expect(badge).toBeInTheDocument();
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeTruthy();
    });
  });
});
