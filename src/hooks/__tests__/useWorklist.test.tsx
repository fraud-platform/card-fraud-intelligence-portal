import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("../../api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

import { get, post } from "../../api/httpClient";
import { useWorklist, useWorklistStats, useClaimNext } from "../useWorklist";

function WorklistTest({ filters }: { filters?: any }) {
  const { items, total, hasMore, nextCursor, isLoading, error, refetch } = useWorklist({ filters });
  return (
    <div>
      <div>loading:{String(isLoading)}</div>
      <div>total:{total}</div>
      <div>hasMore:{String(hasMore)}</div>
      <div>nextCursor:{String(nextCursor)}</div>
      <div>error:{error ? error.message : ""}</div>
      <ul>
        {items.map((i) => (
          <li key={i.id}>{i.transaction_id}</li>
        ))}
      </ul>
      <button onClick={() => refetch()}>refetch</button>
    </div>
  );
}

function StatsTest() {
  const { stats, isLoading, error, refetch } = useWorklistStats();
  return (
    <div>
      <div>loading:{String(isLoading)}</div>
      <div>error:{error ? error.message : ""}</div>
      <div>stats:{stats ? JSON.stringify(stats) : ""}</div>
      <button onClick={() => refetch()}>refetch</button>
    </div>
  );
}

function ClaimNextTest() {
  const { claimNext, isClaiming } = useClaimNext();
  return (
    <div>
      <div>claiming:{String(isClaiming)}</div>
      <button
        onClick={async () => {
          const r = await claimNext();
          const el = document.getElementById("claimed");
          if (el) el.textContent = r ? r.transaction_id : "null";
        }}
      >
        claim
      </button>
      <div id="claimed"></div>
    </div>
  );
}

describe("useWorklist family", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches worklist and renders items with pagination info", async () => {
    (get as unknown as vi.Mock).mockResolvedValueOnce({
      items: [{ id: "1", transaction_id: "tx-1" }],
      total: 1,
      has_more: true,
      next_cursor: "cursor-1",
    });

    render(<WorklistTest filters={{ status: "PENDING" }} />);

    await waitFor(() => expect(screen.getByText("tx-1")).toBeInTheDocument());
    expect(screen.getByText("total:1")).toBeInTheDocument();
    expect(screen.getByText("hasMore:true")).toBeInTheDocument();
    expect(screen.getByText("nextCursor:cursor-1")).toBeInTheDocument();
  });

  it("calls get with query params when filters provided", async () => {
    (get as unknown as vi.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      has_more: false,
      next_cursor: null,
    });

    render(<WorklistTest filters={{ status: "PENDING", limit: 10 }} />);

    await waitFor(() => expect(get).toHaveBeenCalled());
    const calledUrl = (get as unknown as vi.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("status=PENDING");
    expect(calledUrl).toContain("limit=10");
  });

  it("handles worklist fetch error gracefully", async () => {
    (get as unknown as vi.Mock).mockRejectedValueOnce(new Error("failed"));

    render(<WorklistTest />);

    await waitFor(() => expect(screen.getByText(/failed/)).toBeInTheDocument());
    expect(screen.getByText("total:0")).toBeInTheDocument();
  });

  it("fetches stats and exposes data", async () => {
    (get as unknown as vi.Mock).mockResolvedValueOnce({ open: 5, in_review: 2 });

    render(<StatsTest />);

    await waitFor(() => expect(screen.getByText(/"open":5/)).toBeInTheDocument());
  });

  it("claimNext posts and returns item", async () => {
    (post as unknown as vi.Mock).mockResolvedValueOnce({ id: "1", transaction_id: "tx-claim" });

    render(<ClaimNextTest />);

    fireEvent.click(screen.getByText("claim"));

    await waitFor(() => expect(document.getElementById("claimed")?.textContent).toBe("tx-claim"));
    expect(post).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });

  it("claimNext returns null on error", async () => {
    (post as unknown as vi.Mock).mockRejectedValueOnce(new Error("nope"));

    render(<ClaimNextTest />);

    fireEvent.click(screen.getByText("claim"));

    await waitFor(() => expect(document.getElementById("claimed")?.textContent).toBe("null"));
  });
});
