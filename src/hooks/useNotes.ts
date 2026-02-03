/**
 * useNotes Hook
 *
 * Custom hook for managing analyst notes on transactions.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { get, post, patch, del } from "../api/httpClient";
import { NOTES } from "../api/endpoints";
import { isAbortError } from "../shared/utils/abort";
import type {
  AnalystNote,
  NoteCreateRequest,
  NoteUpdateRequest,
  NotesListResponse,
} from "../types/notes";

function makeOptimisticNote(transactionId: string, request: NoteCreateRequest): AnalystNote {
  const tempId = `temp-${Date.now()}`;
  const now = new Date().toISOString();
  return {
    id: tempId,
    transaction_id: transactionId,
    note_type: request.note_type,
    note_content: request.note_content,
    is_private: request.is_private ?? false,
    is_system_generated: false,
    analyst_id: "",
    analyst_name: null,
    analyst_email: null,
    case_id: null,
    attachments: [],
    created_at: now,
    updated_at: now,
  };
}

interface UseNotesOptions {
  transactionId: string;
  enabled?: boolean;
  initialNotes?: AnalystNote[];
  initialTotal?: number;
  skipInitialFetch?: boolean;
}

interface UseNotesReturn {
  notes: AnalystNote[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createNote: (request: NoteCreateRequest) => Promise<void>;
  updateNote: (noteId: string, request: NoteUpdateRequest) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Hook for managing transaction notes
 */
export function useNotes({
  transactionId,
  enabled = true,
  initialNotes = [],
  initialTotal,
  skipInitialFetch = false,
}: UseNotesOptions): UseNotesReturn {
  const [notes, setNotes] = useState<AnalystNote[]>(initialNotes);
  const [total, setTotal] = useState(initialTotal ?? initialNotes.length);
  const [isLoading, setIsLoading] = useState(enabled && !skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasSkippedInitialFetch, setHasSkippedInitialFetch] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const getAbortSignal = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller.signal;
  }, []);

  const fetchNotes = useCallback(async () => {
    if (enabled === false || transactionId === undefined || transactionId === "") {
      setIsLoading(false);
      return;
    }
    if (skipInitialFetch && !hasSkippedInitialFetch) {
      setHasSkippedInitialFetch(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const signal = getAbortSignal();

    let aborted = false;

    try {
      const data = await get<NotesListResponse>(NOTES.LIST(transactionId), { signal });
      aborted = signal.aborted;
      if (!aborted) {
        setNotes(data.items ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      aborted = signal.aborted || isAbortError(err);
      if (!aborted) {
        setError(err instanceof Error ? err : new Error("Failed to fetch notes"));
        setNotes([]);
      }
    } finally {
      if (!aborted && !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [transactionId, enabled, skipInitialFetch, hasSkippedInitialFetch, getAbortSignal]);

  useEffect(() => {
    void fetchNotes();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchNotes]);

  const createNote = useCallback(
    async (request: NoteCreateRequest): Promise<void> => {
      const previousNotes = notes;
      const previousTotal = total;
      const optimisticNote = makeOptimisticNote(transactionId, request);
      const signal = getAbortSignal();
      setIsCreating(true);
      try {
        setNotes((prev) => [optimisticNote, ...prev]);
        setTotal((prev) => prev + 1);
        await post<AnalystNote>(NOTES.CREATE(transactionId), request, { signal });
        await fetchNotes();
      } catch {
        setNotes(previousNotes);
        setTotal(previousTotal);
      } finally {
        setIsCreating(false);
      }
    },
    [transactionId, fetchNotes, notes, total, getAbortSignal]
  );

  const updateNote = useCallback(
    async (noteId: string, request: NoteUpdateRequest): Promise<void> => {
      const previousNotes = notes;
      const now = new Date().toISOString();
      const signal = getAbortSignal();
      setIsUpdating(true);
      try {
        setNotes((prev) =>
          prev.map((note) => (note.id === noteId ? { ...note, ...request, updated_at: now } : note))
        );
        await patch<AnalystNote>(NOTES.UPDATE(transactionId, noteId), request, { signal });
        await fetchNotes();
      } catch {
        setNotes(previousNotes);
      } finally {
        setIsUpdating(false);
      }
    },
    [transactionId, fetchNotes, notes, getAbortSignal]
  );

  const deleteNote = useCallback(
    async (noteId: string): Promise<void> => {
      const previousNotes = notes;
      const previousTotal = total;
      const signal = getAbortSignal();
      setIsDeleting(true);
      try {
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        setTotal((prev) => Math.max(prev - 1, 0));
        await del(NOTES.DELETE(transactionId, noteId), { signal });
        await fetchNotes();
      } catch {
        setNotes(previousNotes);
        setTotal(previousTotal);
      } finally {
        setIsDeleting(false);
      }
    },
    [transactionId, fetchNotes, notes, total, getAbortSignal]
  );

  return {
    notes,
    total,
    isLoading,
    error,
    refetch: () => {
      void fetchNotes();
    },
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
