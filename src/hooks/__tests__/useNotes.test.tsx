import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { useNotes } from "../useNotes";

// Mock httpClient
vi.mock("../../api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}));

import { get, post, patch, del } from "../../api/httpClient";

function TestComponent({ transactionId }: { transactionId: string }) {
  const {
    notes,
    total,
    isLoading,
    error,
    refetch,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNotes({ transactionId });

  return (
    <div>
      <div>loading:{String(isLoading)}</div>
      <div>creating:{String(isCreating)}</div>
      <div>updating:{String(isUpdating)}</div>
      <div>deleting:{String(isDeleting)}</div>
      <div>error:{error ? error.message : ""}</div>
      <div>total:{total}</div>
      <ul>
        {notes.map((n) => (
          <li key={n.id}>{n.content}</li>
        ))}
      </ul>

      <button onClick={() => refetch()}>refetch</button>
      <button onClick={() => void createNote({ content: "new note", type: "GENERAL" })}>
        create
      </button>
      <button onClick={() => void updateNote("note-1", { content: "updated" })}>update</button>
      <button onClick={() => void deleteNote("note-1")}>delete</button>
    </div>
  );
}

describe("useNotes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches notes on mount and displays them", async () => {
    (get as unknown as vi.Mock).mockResolvedValueOnce({
      items: [{ id: "n1", content: "first" }],
      total: 1,
    });

    render(<TestComponent transactionId="tx1" />);

    await waitFor(() => expect(screen.getByText("first")).toBeInTheDocument());
    expect(screen.getByText("total:1")).toBeInTheDocument();
  });

  it("createNote calls post and refetches", async () => {
    (get as unknown as vi.Mock)
      .mockResolvedValueOnce({ items: [], total: 0 })
      .mockResolvedValueOnce({ items: [{ id: "n2", content: "created" }], total: 1 });
    (post as unknown as vi.Mock).mockResolvedValueOnce({});

    render(<TestComponent transactionId="tx2" />);

    // Wait for initial empty load
    await waitFor(() => expect(screen.getByText("total:0")).toBeInTheDocument());

    fireEvent.click(screen.getByText("create"));

    // Wait for created note to appear
    await waitFor(() => expect(screen.getByText("created")).toBeInTheDocument());
    expect(post).toHaveBeenCalledWith(
      expect.stringContaining("/notes"),
      expect.objectContaining({ content: "new note" }),
      expect.any(Object)
    );
  });

  it("updateNote calls patch and refetches", async () => {
    (get as unknown as vi.Mock)
      .mockResolvedValueOnce({ items: [{ id: "note-1", content: "old" }], total: 1 })
      .mockResolvedValueOnce({ items: [{ id: "note-1", content: "updated" }], total: 1 });
    (patch as unknown as vi.Mock).mockResolvedValueOnce({});

    render(<TestComponent transactionId="tx3" />);

    await waitFor(() => expect(screen.getByText("old")).toBeInTheDocument());

    fireEvent.click(screen.getByText("update"));

    await waitFor(() => expect(screen.getByText("updated")).toBeInTheDocument());
    expect(patch).toHaveBeenCalled();
  });

  it("deleteNote calls del and refetches", async () => {
    (get as unknown as vi.Mock)
      .mockResolvedValueOnce({ items: [{ id: "note-1", content: "to-delete" }], total: 1 })
      .mockResolvedValueOnce({ items: [], total: 0 });
    (del as unknown as vi.Mock).mockResolvedValueOnce({});

    render(<TestComponent transactionId="tx4" />);

    await waitFor(() => expect(screen.getByText("to-delete")).toBeInTheDocument());

    fireEvent.click(screen.getByText("delete"));

    await waitFor(() => expect(screen.queryByText("to-delete")).not.toBeInTheDocument());
    expect(del).toHaveBeenCalled();
  });

  it("handles fetch error gracefully", async () => {
    (get as unknown as vi.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<TestComponent transactionId="tx5" />);

    await waitFor(() => expect(screen.getByText(/Network error/)).toBeInTheDocument());
    expect(screen.getByText("total:0")).toBeInTheDocument();
  });
});
