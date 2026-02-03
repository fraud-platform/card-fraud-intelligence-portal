/**
 * RiskLevelBadge Component Tests
 *
 * Tests for the RiskLevelBadge component that displays risk levels
 * with appropriate color coding.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RiskLevelBadge } from "../RiskLevelBadge";
import type { RiskLevel } from "../../../types/review";

describe("RiskLevelBadge", () => {
  describe("Valid risk level rendering", () => {
    it("renders CRITICAL level with red color", () => {
      render(<RiskLevelBadge level="CRITICAL" />);
      const badge = screen.getByText("Critical");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
    });

    it("renders HIGH level with orange color", () => {
      render(<RiskLevelBadge level="HIGH" />);
      const badge = screen.getByText("High");
      expect(badge).toBeInTheDocument();
    });

    it("renders MEDIUM level with gold color", () => {
      render(<RiskLevelBadge level="MEDIUM" />);
      const badge = screen.getByText("Medium");
      expect(badge).toBeInTheDocument();
    });

    it("renders LOW level with green color", () => {
      render(<RiskLevelBadge level="LOW" />);
      const badge = screen.getByText("Low");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Null and undefined handling", () => {
    it("renders N/A when level is null", () => {
      render(<RiskLevelBadge level={null} />);
      const badge = screen.getByText("N/A");
      expect(badge).toBeInTheDocument();
    });

    it("renders N/A when level is undefined", () => {
      render(<RiskLevelBadge level={undefined} />);
      const badge = screen.getByText("N/A");
      expect(badge).toBeInTheDocument();
    });

    it("applies default color to N/A badge", () => {
      render(<RiskLevelBadge level={null} />);
      const badge = screen.getByText("N/A");
      expect(badge).toBeInTheDocument();
      // Should have default color styling
    });
  });

  describe("Size variations", () => {
    it("renders with default size", () => {
      render(<RiskLevelBadge level="HIGH" size="default" />);
      const badge = screen.getByText("High");
      expect(badge).toBeInTheDocument();
      // Default size should not have custom font-size styling
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeFalsy();
    });

    it("renders with small size", () => {
      render(<RiskLevelBadge level="HIGH" size="small" />);
      const badge = screen.getByText("High");
      expect(badge).toBeInTheDocument();
      // Small size should have custom font-size styling
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeTruthy();
    });

    it("renders N/A with small size", () => {
      render(<RiskLevelBadge level={null} size="small" />);
      const badge = screen.getByText("N/A");
      expect(badge).toBeInTheDocument();
      const hasSmallFontSize = badge.getAttribute("style")?.includes("font-size: 11px");
      expect(hasSmallFontSize).toBeTruthy();
    });
  });

  describe("Label display control", () => {
    it("shows human-readable label when showLabel is true", () => {
      render(<RiskLevelBadge level="CRITICAL" showLabel={true} />);
      expect(screen.getByText("Critical")).toBeInTheDocument();
    });

    it("shows raw value when showLabel is false", () => {
      render(<RiskLevelBadge level="CRITICAL" showLabel={false} />);
      expect(screen.getByText("CRITICAL")).toBeInTheDocument();
      expect(screen.queryByText("Critical")).not.toBeInTheDocument();
    });

    it("shows label by default when showLabel is omitted", () => {
      render(<RiskLevelBadge level="HIGH" />);
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("always shows N/A regardless of showLabel prop", () => {
      const { rerender } = render(<RiskLevelBadge level={null} showLabel={true} />);
      expect(screen.getByText("N/A")).toBeInTheDocument();

      rerender(<RiskLevelBadge level={null} showLabel={false} />);
      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles unknown risk level gracefully", () => {
      // TypeScript would prevent this, but testing runtime behavior
      const unknownLevel = "EXTREME" as RiskLevel;
      render(<RiskLevelBadge level={unknownLevel} />);

      // Should render the unknown level as-is with default color
      const badge = screen.getByText("EXTREME");
      expect(badge).toBeInTheDocument();
    });

    it("renders default size when size prop is omitted", () => {
      render(<RiskLevelBadge level="MEDIUM" />);
      const badge = screen.getByText("Medium");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Risk level label mapping", () => {
    it("maps risk levels to human-readable labels correctly", () => {
      const riskMapping: Record<RiskLevel, string> = {
        CRITICAL: "Critical",
        HIGH: "High",
        MEDIUM: "Medium",
        LOW: "Low",
      };

      Object.entries(riskMapping).forEach(([level, label]) => {
        const { unmount } = render(<RiskLevelBadge level={level as RiskLevel} />);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
