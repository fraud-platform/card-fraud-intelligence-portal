import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { ErrorBoundary } from "../ErrorBoundary";

describe("ErrorBoundary unit behavior", () => {
  it("getDerivedStateFromError sets hasError and error", () => {
    const state = (ErrorBoundary as any).getDerivedStateFromError(new Error("boom"));
    expect(state).toEqual(expect.objectContaining({ hasError: true, error: expect.any(Error) }));
  });

  it("componentDidCatch calls onError when provided", () => {
    const mockOnError = vi.fn();
    const ThrowError = () => {
      throw new Error("boom");
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalled();
    const callArgs = mockOnError.mock.calls[0];
    expect(callArgs[0]).toBeInstanceOf(Error);
    expect(callArgs[1]).toEqual(expect.objectContaining({ componentStack: expect.any(String) }));
  });

  it("renders fallback UI when error occurs", () => {
    const ThrowError = () => {
      throw new Error("boom");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });
});
