/**
 * NoteTypeBadge Component Tests
 *
 * Tests the note type badge component renders correctly with proper colors
 * for all note types defined in the system.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteTypeBadge } from "../NoteTypeBadge";
import { NOTE_TYPE_CONFIG, type NoteType } from "../../../types/notes";

describe("NoteTypeBadge", () => {
  describe("renders each note type with correct label and color", () => {
    const noteTypes: NoteType[] = [
      "GENERAL",
      "INITIAL_REVIEW",
      "CUSTOMER_CONTACT",
      "MERCHANT_CONTACT",
      "BANK_CONTACT",
      "FRAUD_CONFIRMED",
      "FALSE_POSITIVE",
      "ESCALATION",
      "RESOLUTION",
      "LEGAL_HOLD",
      "INTERNAL_REVIEW",
    ];

    noteTypes.forEach((noteType) => {
      it(`renders ${noteType} with correct label`, () => {
        const config = NOTE_TYPE_CONFIG[noteType];
        const { container } = render(<NoteTypeBadge type={noteType} />);

        // Check label is rendered
        expect(screen.getByText(config.label)).toBeInTheDocument();

        // Check tag has correct color class
        const tag = container.querySelector(".ant-tag");
        expect(tag).toBeInTheDocument();
      });
    });
  });

  describe("color validation", () => {
    it("renders GENERAL with default color", () => {
      render(<NoteTypeBadge type="GENERAL" />);
      expect(screen.getByText("General")).toBeInTheDocument();
    });

    it("renders INITIAL_REVIEW with blue color", () => {
      render(<NoteTypeBadge type="INITIAL_REVIEW" />);
      expect(screen.getByText("Initial Review")).toBeInTheDocument();
    });

    it("renders CUSTOMER_CONTACT with cyan color", () => {
      render(<NoteTypeBadge type="CUSTOMER_CONTACT" />);
      expect(screen.getByText("Customer Contact")).toBeInTheDocument();
    });

    it("renders MERCHANT_CONTACT with purple color", () => {
      render(<NoteTypeBadge type="MERCHANT_CONTACT" />);
      expect(screen.getByText("Merchant Contact")).toBeInTheDocument();
    });

    it("renders BANK_CONTACT with geekblue color", () => {
      render(<NoteTypeBadge type="BANK_CONTACT" />);
      expect(screen.getByText("Bank Contact")).toBeInTheDocument();
    });

    it("renders FRAUD_CONFIRMED with red color", () => {
      render(<NoteTypeBadge type="FRAUD_CONFIRMED" />);
      expect(screen.getByText("Fraud Confirmed")).toBeInTheDocument();
    });

    it("renders FALSE_ALLOWLIST with green color", () => {
      render(<NoteTypeBadge type="FALSE_POSITIVE" />);
      expect(screen.getByText("False Positive")).toBeInTheDocument();
    });

    it("renders ESCALATION with orange color", () => {
      render(<NoteTypeBadge type="ESCALATION" />);
      expect(screen.getByText("Escalation")).toBeInTheDocument();
    });

    it("renders RESOLUTION with lime color", () => {
      render(<NoteTypeBadge type="RESOLUTION" />);
      expect(screen.getByText("Resolution")).toBeInTheDocument();
    });

    it("renders LEGAL_HOLD with volcano color", () => {
      render(<NoteTypeBadge type="LEGAL_HOLD" />);
      expect(screen.getByText("Legal Hold")).toBeInTheDocument();
    });

    it("renders INTERNAL_REVIEW with gold color", () => {
      render(<NoteTypeBadge type="INTERNAL_REVIEW" />);
      expect(screen.getByText("Internal Review")).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    it("renders with default size by default", () => {
      const { container } = render(<NoteTypeBadge type="GENERAL" />);
      const tag = container.querySelector(".ant-tag");

      // Default size should not have inline style for fontSize
      expect(tag?.getAttribute("style")).toBeNull();
    });

    it("renders with small size when specified", () => {
      const { container } = render(<NoteTypeBadge type="GENERAL" size="small" />);
      const tag = container.querySelector(".ant-tag");

      // Small size should have inline styles for fontSize and padding
      expect(tag?.getAttribute("style")).toContain("font-size: 11px");
      expect(tag?.getAttribute("style")).toContain("padding: 0px 4px");
    });
  });

  describe("handles unknown note types gracefully", () => {
    it("falls back to displaying the type as label", () => {
      // Force an unknown type to test fallback behavior
      const unknownType = "UNKNOWN_TYPE" as NoteType;
      render(<NoteTypeBadge type={unknownType} />);

      expect(screen.getByText(unknownType)).toBeInTheDocument();
    });
  });
});
