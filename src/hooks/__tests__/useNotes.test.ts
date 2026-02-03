/**
 * Unit tests for useNotes hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useNotes } from "../useNotes";
import * as httpClient from "@/api/httpClient";
import { NOTES } from "@/api/endpoints";
import type {
  AnalystNote,
  NoteCreateRequest,
  NoteUpdateRequest,
  NotesListResponse,
} from "@/types/notes";

// Mock the httpClient module
vi.mock("@/api/httpClient", () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

describe("useNotes", () => {
  const mockGet = vi.mocked(httpClient.get);
  const mockPost = vi.mocked(httpClient.post);
  const mockPatch = vi.mocked(httpClient.patch);
  const mockDel = vi.mocked(httpClient.del);

  const mockTransactionId = "txn-123";

  const mockNote1: AnalystNote = {
    id: "note-1",
    transaction_id: mockTransactionId,
    note_type: "INITIAL_REVIEW",
    note_content: "Initial review completed",
    is_private: false,
    is_system_generated: false,
    analyst_id: "analyst-1",
    analyst_name: "John Doe",
    analyst_email: "john@example.com",
    case_id: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  const mockNote2: AnalystNote = {
    id: "note-2",
    transaction_id: mockTransactionId,
    note_type: "CUSTOMER_CONTACT",
    note_content: "Called customer to verify transaction",
    is_private: true,
    is_system_generated: false,
    analyst_id: "analyst-1",
    analyst_name: "John Doe",
    analyst_email: "john@example.com",
    case_id: "case-1",
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
  };

  const mockNotesResponse: NotesListResponse = {
    items: [mockNote1, mockNote2],
    total: 2,
    page_size: 50,
    has_more: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchNotes", () => {
    it("should fetch notes list on mount", async () => {
      mockGet.mockResolvedValue(mockNotesResponse);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.notes).toEqual([]);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith(NOTES.LIST(mockTransactionId), expect.any(Object));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.notes).toEqual([mockNote1, mockNote2]);
      expect(result.current.total).toBe(2);
      expect(result.current.error).toBeNull();
    });

    it("should handle empty notes list", async () => {
      const emptyResponse: NotesListResponse = {
        items: [],
        total: 0,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notes).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it("should handle response without items property", async () => {
      const partialResponse = { total: 0, page_size: 50, has_more: false };
      mockGet.mockResolvedValue(partialResponse);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notes).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it("should handle response without total property", async () => {
      const partialResponse = { items: [mockNote1], page_size: 50, has_more: false };
      mockGet.mockResolvedValue(partialResponse);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notes).toEqual([mockNote1]);
      expect(result.current.total).toBe(0);
    });

    it("should not fetch when enabled is false", async () => {
      const { result } = renderHook(() =>
        useNotes({ transactionId: mockTransactionId, enabled: false })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.notes).toEqual([]);
    });

    it("should not fetch when transactionId is empty", async () => {
      const { result } = renderHook(() => useNotes({ transactionId: "" }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();
      expect(result.current.notes).toEqual([]);
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Failed to fetch notes");
      mockGet.mockRejectedValue(error);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.notes).toEqual([]);
    });

    it("should handle non-Error exceptions", async () => {
      mockGet.mockRejectedValue("string error");

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Failed to fetch notes");
      expect(result.current.notes).toEqual([]);
    });
  });

  describe("refetch", () => {
    it("should refetch notes when called", async () => {
      mockGet.mockResolvedValue(mockNotesResponse);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it("should update notes after refetch", async () => {
      const updatedResponse: NotesListResponse = {
        items: [mockNote1, mockNote2, { ...mockNote1, id: "note-3" }],
        total: 3,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockResolvedValueOnce(mockNotesResponse).mockResolvedValueOnce(updatedResponse);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.notes.length).toBe(2);
      });

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.notes.length).toBe(3);
        expect(result.current.total).toBe(3);
      });
    });
  });

  describe("createNote", () => {
    it("should create note and refetch notes list", async () => {
      const createRequest: NoteCreateRequest = {
        note_type: "GENERAL",
        note_content: "Test note",
        is_private: false,
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      // Add a small delay to ensure isCreating state can be observed
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockNote1), 50))
      );

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreating).toBe(false);

      // Call createNote
      await act(async () => {
        result.current.createNote(createRequest);
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith(
        NOTES.CREATE(mockTransactionId),
        createRequest,
        expect.any(Object)
      );
      // Initial fetch + refetch after create
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should create note with minimal data", async () => {
      const createRequest: NoteCreateRequest = {
        note_type: "GENERAL",
        note_content: "Simple note",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPost.mockResolvedValue(mockNote1);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createNote(createRequest);

      expect(mockPost).toHaveBeenCalledWith(
        NOTES.CREATE(mockTransactionId),
        createRequest,
        expect.any(Object)
      );
    });

    it("should handle create errors", async () => {
      const createRequest: NoteCreateRequest = {
        note_type: "GENERAL",
        note_content: "Test note",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPost.mockRejectedValue(new Error("Create failed"));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createNote(createRequest);
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });

    it("should set isCreating to false even if creation fails", async () => {
      const createRequest: NoteCreateRequest = {
        note_type: "GENERAL",
        note_content: "Test note",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPost.mockRejectedValue(new Error("Create failed"));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createNote(createRequest);
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe("updateNote", () => {
    it("should update note and refetch notes list", async () => {
      const noteId = "note-1";
      const updateRequest: NoteUpdateRequest = {
        note_content: "Updated content",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      // Add a small delay to ensure isUpdating state can be observed
      mockPatch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ...mockNote1, note_content: "Updated content" }), 50)
          )
      );

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isUpdating).toBe(false);

      // Call updateNote
      await act(async () => {
        result.current.updateNote(noteId, updateRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockPatch).toHaveBeenCalledWith(
        NOTES.UPDATE(mockTransactionId, noteId),
        updateRequest,
        expect.any(Object)
      );
      // Initial fetch + refetch after update
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should update note type", async () => {
      const noteId = "note-1";
      const updateRequest: NoteUpdateRequest = {
        note_type: "FRAUD_CONFIRMED",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPatch.mockResolvedValue(mockNote1);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.updateNote(noteId, updateRequest);

      expect(mockPatch).toHaveBeenCalledWith(
        NOTES.UPDATE(mockTransactionId, noteId),
        updateRequest,
        expect.any(Object)
      );
    });

    it("should update both content and type", async () => {
      const noteId = "note-1";
      const updateRequest: NoteUpdateRequest = {
        note_content: "Updated content",
        note_type: "ESCALATION",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPatch.mockResolvedValue(mockNote1);

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.updateNote(noteId, updateRequest);

      expect(mockPatch).toHaveBeenCalledWith(
        NOTES.UPDATE(mockTransactionId, noteId),
        updateRequest,
        expect.any(Object)
      );
    });

    it("should handle update errors", async () => {
      const noteId = "note-1";
      const updateRequest: NoteUpdateRequest = {
        note_content: "Updated content",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPatch.mockRejectedValue(new Error("Update failed"));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateNote(noteId, updateRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it("should set isUpdating to false even if update fails", async () => {
      const noteId = "note-1";
      const updateRequest: NoteUpdateRequest = {
        note_content: "Updated content",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPatch.mockRejectedValue(new Error("Update failed"));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateNote(noteId, updateRequest);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });
  });

  describe("deleteNote", () => {
    it("should delete note and refetch notes list", async () => {
      const noteId = "note-1";

      mockGet.mockResolvedValue(mockNotesResponse);
      // Add a small delay to ensure isDeleting state can be observed
      mockDel.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({}), 50)));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isDeleting).toBe(false);

      // Call deleteNote
      await act(async () => {
        result.current.deleteNote(noteId);
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockDel).toHaveBeenCalledWith(
        NOTES.DELETE(mockTransactionId, noteId),
        expect.any(Object)
      );
      // Initial fetch + refetch after delete
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("should handle delete errors", async () => {
      const noteId = "note-1";

      mockGet.mockResolvedValue(mockNotesResponse);
      mockDel.mockRejectedValue(new Error("Delete failed"));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteNote(noteId);
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it("should set isDeleting to false even if deletion fails", async () => {
      const noteId = "note-1";

      mockGet.mockResolvedValue(mockNotesResponse);
      mockDel.mockRejectedValue(new Error("Delete failed"));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteNote(noteId);
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple CRUD operations in sequence", async () => {
      const noteId = "note-1";
      const createRequest: NoteCreateRequest = {
        note_type: "GENERAL",
        note_content: "New note",
      };
      const updateRequest: NoteUpdateRequest = {
        note_content: "Updated note",
      };

      mockGet.mockResolvedValue(mockNotesResponse);
      mockPost.mockResolvedValue(mockNote1);
      mockPatch.mockResolvedValue(mockNote1);
      mockDel.mockResolvedValue({});

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform multiple operations
      await act(async () => {
        await result.current.createNote(createRequest);
        await result.current.updateNote(noteId, updateRequest);
        await result.current.deleteNote(noteId);
      });

      // Should have called fetch 4 times: initial + after create + after update + after delete
      expect(mockGet).toHaveBeenCalledTimes(4);
    });

    it("should track operation state correctly", async () => {
      mockGet.mockResolvedValue(mockNotesResponse);
      mockPost.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { result } = renderHook(() => useNotes({ transactionId: mockTransactionId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);

      let promise: Promise<void>;
      await act(async () => {
        promise = result.current.createNote({
          note_type: "GENERAL",
          note_content: "Test",
        });
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true);
      });

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);

      await promise!;

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe("transactionId changes", () => {
    it("should refetch when transactionId changes", async () => {
      const txn1 = "txn-1";
      const txn2 = "txn-2";

      const response1: NotesListResponse = {
        items: [{ ...mockNote1, transaction_id: txn1 }],
        total: 1,
        page_size: 50,
        has_more: false,
      };

      const response2: NotesListResponse = {
        items: [{ ...mockNote2, transaction_id: txn2 }],
        total: 1,
        page_size: 50,
        has_more: false,
      };

      mockGet.mockImplementation((url) => {
        if (url.includes(txn1)) return Promise.resolve(response1);
        if (url.includes(txn2)) return Promise.resolve(response2);
        return Promise.reject(new Error("Unknown transaction"));
      });

      const { result, rerender } = renderHook(({ transactionId }) => useNotes({ transactionId }), {
        initialProps: { transactionId: txn1 },
      });

      await waitFor(() => {
        expect(result.current.notes[0]?.transaction_id).toBe(txn1);
      });

      // Change transactionId
      rerender({ transactionId: txn2 });

      await waitFor(() => {
        expect(result.current.notes[0]?.transaction_id).toBe(txn2);
      });

      expect(mockGet).toHaveBeenCalledWith(NOTES.LIST(txn1), expect.any(Object));
      expect(mockGet).toHaveBeenCalledWith(NOTES.LIST(txn2), expect.any(Object));
    });

    it("should refetch when enabled changes from false to true", async () => {
      mockGet.mockResolvedValue(mockNotesResponse);

      const { result, rerender } = renderHook(
        ({ enabled }) => useNotes({ transactionId: mockTransactionId, enabled }),
        { initialProps: { enabled: false } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).not.toHaveBeenCalled();

      // Enable fetching
      rerender({ enabled: true });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledTimes(1);
      });

      expect(result.current.notes).toEqual([mockNote1, mockNote2]);
    });
  });
});
