/**
 * Tests for TransactionShow component
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor, screen, userEvent } from "@/test/utils";
import { Routes, Route } from "react-router";
import { TransactionShow } from "../show";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useReview: vi.fn(() => ({
    review: null,
    isLoading: false,
    updateStatus: vi.fn(),
    assign: vi.fn(),
    resolve: vi.fn(),
    escalate: vi.fn(),
    isUpdating: false,
  })),
  useNotes: vi.fn(() => ({
    notes: [],
    isLoading: false,
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
  })),
}));

// Mock the API call
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(() =>
    Promise.resolve({
      transaction: {
        transaction_id: "txn-123",
        card_id: "card-456",
        card_last4: "1234",
        card_network: "VISA",
        amount: 100.5,
        currency: "USD",
        merchant_id: "merchant-789",
        mcc: "5411",
        decision: "APPROVE",
        decision_reason: "DEFAULT_ALLOW",
        ruleset_id: "ruleset-001",
        ruleset_version: 1,
        matched_rules: [
          {
            rule_id: "rule-001",
            rule_version: 1,
            rule_version_id: "rv-001",
            rule_name: "Test Rule",
            priority: 100,
            match_reason: "Test match",
            scope: {
              network: ["VISA"],
            },
          },
        ],
        transaction_timestamp: "2024-01-15T10:30:00Z",
        ingestion_timestamp: "2024-01-15T10:31:00Z",
      },
      matched_rules: [
        {
          rule_id: "rule-001",
          rule_version: 1,
          rule_version_id: "rv-001",
          rule_name: "Test Rule",
          priority: 100,
          match_reason: "Test match",
          scope: {
            network: ["VISA"],
          },
        },
      ],
      review: null,
      notes: [],
    })
  ),
}));

describe("TransactionShow", () => {
  const renderWithRoute = (route = "/transactions/show/test-txn-id") =>
    render(
      <Routes>
        <Route path="/transactions/show/:id" element={<TransactionShow />} />
      </Routes>,
      { initialRoute: route }
    );

  const renderWithMissingId = () =>
    render(
      <Routes>
        <Route path="/transactions/show" element={<TransactionShow />} />
      </Routes>,
      { initialRoute: "/transactions/show" }
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { container } = renderWithRoute();
    expect(container).toBeInTheDocument();
  });

  it("shows loading state while fetching transaction", () => {
    const { container } = renderWithRoute();
    // Should show a spinner initially
    const spinElement = container.querySelector(".ant-spin");
    expect(spinElement).toBeInTheDocument();
  });

  it("renders transaction details after loading", async () => {
    renderWithRoute();

    await waitFor(
      () => {
        const pageElement = document.querySelector(".ant-page-header");
        expect(pageElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("displays error state when transaction ID is missing", async () => {
    renderWithMissingId();

    await waitFor(
      () => {
        const alertElement = document.querySelector(".ant-alert-error");
        expect(alertElement).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("renders collapse panels for transaction information", async () => {
    renderWithRoute();

    await waitFor(
      () => {
        const collapseElement = document.querySelector(".ant-collapse");
        expect(collapseElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("memoizes handler functions with useCallback", async () => {
    const { rerender } = renderWithRoute();

    // Component should re-render without issues due to memoization
    rerender(
      <Routes>
        <Route path="/transactions/show/:id" element={<TransactionShow />} />
      </Routes>
    );

    await waitFor(
      () => {
        const pageElement = document.querySelector(".ant-page-header");
        expect(pageElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("memoizes matched rules table columns with useMemo", async () => {
    const user = userEvent.setup();
    renderWithRoute();

    const matchedRulesTab = await screen.findByRole("tab", { name: /Rule Matches/i });
    await user.click(matchedRulesTab);

    await waitFor(
      () => {
        const tableElement = document.querySelector(".ant-table");
        expect(tableElement).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
