import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("../../api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

import { get, post, patch } from "../../api/httpClient";
import { useReview } from "../useReview";

function TestComponent({ transactionId }: { transactionId: string }) {
  const { review, isLoading, error, refetch, updateStatus, assign, resolve, escalate, isUpdating } =
    useReview({ transactionId });
  return (
    <div>
      <div>loading:{String(isLoading)}</div>
      <div>updating:{String(isUpdating)}</div>
      <div>error:{error ? error.message : ""}</div>
      <div>review:{review ? review.id : ""}</div>
      <button onClick={() => refetch()}>refetch</button>
      <button onClick={() => void updateStatus({ status: "RESOLVED" })}>update</button>
      <button onClick={() => void assign({ analyst_id: "auth0|a" })}>assign</button>
      <button onClick={() => void resolve({ resolution_code: "FALSE_POSITIVE", notes: "ok" })}>
        resolve
      </button>
      <button onClick={() => void escalate({ reason: "escalate" })}>escalate</button>
    </div>
  );
}

describe("useReview", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches review on mount and exposes it", async () => {
    (get as unknown as vi.Mock).mockResolvedValueOnce({ id: "rev-1", status: "IN_REVIEW" });

    const { getByText } = render(<TestComponent transactionId="tx-1" />);

    await waitFor(() => expect(getByText("review:rev-1")).toBeInTheDocument());
  });

  it("handles fetch error gracefully", async () => {
    (get as unknown as vi.Mock).mockRejectedValueOnce(new Error("nope"));

    const { getByText } = render(<TestComponent transactionId="tx-err" />);

    await waitFor(() => expect(getByText(/nope/)).toBeInTheDocument());
  });

  it("updateStatus calls patch and refetches", async () => {
    (get as unknown as vi.Mock)
      .mockResolvedValueOnce({ id: "rev-2" })
      .mockResolvedValueOnce({ id: "rev-2" });
    (patch as unknown as vi.Mock).mockResolvedValueOnce({});

    const { getByText } = render(<TestComponent transactionId="tx-2" />);
    await waitFor(() => expect(getByText("review:rev-2")).toBeInTheDocument());

    getByText("update").click();
    await waitFor(() => expect(patch).toHaveBeenCalled());
  });

  it("assign calls patch and sets updating flag", async () => {
    (get as unknown as vi.Mock)
      .mockResolvedValueOnce({ id: "rev-3" })
      .mockResolvedValueOnce({ id: "rev-3" });
    (patch as unknown as vi.Mock).mockResolvedValueOnce({});

    const { getByText } = render(<TestComponent transactionId="tx-3" />);
    await waitFor(() => expect(getByText("review:rev-3")).toBeInTheDocument());

    getByText("assign").click();
    await waitFor(() => expect(patch).toHaveBeenCalled());
  });

  it("resolve and escalate call post and refetch", async () => {
    (get as unknown as vi.Mock)
      .mockResolvedValueOnce({ id: "rev-4" })
      .mockResolvedValueOnce({ id: "rev-4" });
    (post as unknown as vi.Mock).mockResolvedValue({});

    const { getByText } = render(<TestComponent transactionId="tx-4" />);
    await waitFor(() => expect(getByText("review:rev-4")).toBeInTheDocument());

    getByText("resolve").click();
    await waitFor(() => expect(post).toHaveBeenCalled());

    getByText("escalate").click();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  });
});
