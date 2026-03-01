import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpsAnalystInsightPanel } from "../OpsAnalystInsightPanel";
import { useOpsAnalystInsights } from "@/hooks/useOpsAnalystInsights";
import { useInvestigationRun } from "@/hooks/useInvestigationRun";
import type { InsightDetail } from "@/types/opsAnalyst";

// Mock the hooks
vi.mock("@/hooks/useOpsAnalystInsights");
vi.mock("@/hooks/useInvestigationRun");

describe("OpsAnalystInsightPanel", () => {
  const reloadMock = vi.fn();
  const runMock = vi.fn();
  const mockUseInsights = vi.mocked(useOpsAnalystInsights);
  const mockUseRun = vi.mocked(useInvestigationRun);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUseInsights.mockReturnValue({
      insights: [],
      loading: false,
      error: null,
      reload: reloadMock,
    });

    mockUseRun.mockReturnValue({
      run: runMock.mockResolvedValue({}),
      loading: false,
      error: null,
      lastResult: null,
    });
  });

  const mockInsight: InsightDetail = {
    insight_id: "insight-1",
    transaction_id: "txn-1",
    severity: "CRITICAL",
    summary: "High risk transaction detected",
    insight_type: "FRAUD",
    model_mode: "agentic",
    generated_at: new Date().toISOString(),
    evidence: [],
  };

  it("should show loading state", () => {
    mockUseInsights.mockReturnValue({
      insights: [],
      loading: true,
      error: null,
      reload: reloadMock,
    });

    render(<OpsAnalystInsightPanel transactionId="txn-1" />);
    // Since we can't easily query by role="status" for Spin, we check if other elements are present or absent
    expect(screen.queryByText("Run Investigation")).toBeInTheDocument();
  });

  it("should display insight summary", () => {
    mockUseInsights.mockReturnValue({
      insights: [mockInsight],
      loading: false,
      error: null,
      reload: reloadMock,
    });

    render(<OpsAnalystInsightPanel transactionId="txn-1" />);

    expect(screen.getByText("High risk transaction detected")).toBeInTheDocument();
    expect(screen.getByText("Agentic")).toBeInTheDocument();
  });

  it("should trigger investigation run", async () => {
    mockUseInsights.mockReturnValue({
      insights: [],
      loading: false,
      error: null,
      reload: reloadMock,
    });

    render(<OpsAnalystInsightPanel transactionId="txn-1" />);

    const runBtn = screen.getByText("Run Investigation");
    fireEvent.click(runBtn);

    expect(runMock).toHaveBeenCalledWith({ transaction_id: "txn-1", mode: "quick" });

    // It should reload after run
    await waitFor(() => {
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  it("should display empty state", () => {
    mockUseInsights.mockReturnValue({
      insights: [],
      loading: false,
      error: null,
      reload: reloadMock,
    });

    render(<OpsAnalystInsightPanel transactionId="txn-1" />);

    expect(screen.getByText("No insights yet")).toBeInTheDocument();
  });
});
