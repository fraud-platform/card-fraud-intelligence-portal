import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RecommendationCard } from "../RecommendationCard";
import type { RecommendationDetail } from "@/types/opsAnalyst";

// window.matchMedia mock is often needed for Ant Design
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("RecommendationCard", () => {
  const onAcknowledgeMock = vi.fn();

  const mockRec: RecommendationDetail = {
    recommendation_id: "rec-1",
    type: "review_priority",
    status: "OPEN",
    priority: 1,
    payload: { title: "Urgent Review", impact: "High Risk" },
  };

  it("should display recommendation details", () => {
    render(<RecommendationCard recommendation={mockRec} onAcknowledge={onAcknowledgeMock} />);

    expect(screen.getByText("Urgent Review")).toBeInTheDocument();
    expect(screen.getByText("High Risk")).toBeInTheDocument();
    expect(screen.getByText("Review Priority")).toBeInTheDocument();
    expect(screen.getByText("OPEN")).toBeInTheDocument();
  });

  it("should show acknowledge modal on click", async () => {
    render(<RecommendationCard recommendation={mockRec} onAcknowledge={onAcknowledgeMock} />);

    const ackBtn = screen.getByText("Acknowledge");
    fireEvent.click(ackBtn);

    expect(screen.getByText("Acknowledge Recommendation")).toBeInTheDocument();
  });

  it("should call onAcknowledge when confirmed", async () => {
    onAcknowledgeMock.mockResolvedValue({});

    render(<RecommendationCard recommendation={mockRec} onAcknowledge={onAcknowledgeMock} />);

    fireEvent.click(screen.getByText("Acknowledge"));

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Optional comment...")).toBeInTheDocument();
    });

    // Click OK in modal (Ant Design modal OK button usually has text 'OK' or 'Acknowledge' as set in okText)
    // The component sets okText based on action
    // Using simple text match might match the trigger button again.
    // The modal button is usually the last one or inside the modal.

    // Let's try to target the modal specifically or use getByRole inside the modal if possible.
    // Since we can't easily scope to portal in testing-library without setup, we rely on text.
    // The modal title is "Acknowledge Recommendation", the button text is "Acknowledge".
    // The trigger button is also "Acknowledge".
    // We can use getAllByText("Acknowledge") and pick the one in the modal (usually the second one if it renders at end)

    // Better: type a comment first to ensure we are interacting with modal content
    fireEvent.change(screen.getByPlaceholderText("Optional comment..."), {
      target: { value: "Test comment" },
    });

    // Now click the confirm button. It should be visible now.
    // The modal footer buttons.
    const buttons = screen.getAllByRole("button", { name: "Acknowledge" });
    // Usually the last one is the modal action
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(onAcknowledgeMock).toHaveBeenCalledWith("rec-1", {
        action: "ACKNOWLEDGED",
        comment: "Test comment",
      });
    });
  });

  it("should show reject modal on click", () => {
    render(<RecommendationCard recommendation={mockRec} onAcknowledge={onAcknowledgeMock} />);

    fireEvent.click(screen.getByText("Reject"));

    expect(screen.getByText("Reject Recommendation")).toBeInTheDocument();
  });
});
