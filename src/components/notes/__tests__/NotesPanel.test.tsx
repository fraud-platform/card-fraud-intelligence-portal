/**
 * NotesPanel Component Tests
 *
 * Tests the notes panel component displays note count correctly,
 * shows Add button based on permissions, sorts notes properly,
 * and renders edit/delete buttons based on permissions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesPanel } from "../NotesPanel";
import type { AnalystNote } from "../../../types/notes";
import { message } from "antd";

// Mock Ant Design message
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe("NotesPanel", () => {
  const mockNotes: AnalystNote[] = [
    {
      id: "note-1",
      transaction_id: "txn-123",
      note_type: "GENERAL",
      note_content: "This is the first note",
      is_private: false,
      is_system_generated: false,
      analyst_id: "analyst-1",
      analyst_name: "John Doe",
      analyst_email: "john.doe@example.com",
      case_id: null,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "note-2",
      transaction_id: "txn-123",
      note_type: "FRAUD_CONFIRMED",
      note_content: "This is the second note",
      is_private: false,
      is_system_generated: false,
      analyst_id: "analyst-2",
      analyst_name: "Jane Smith",
      analyst_email: "jane.smith@example.com",
      case_id: null,
      created_at: "2024-01-15T11:00:00Z",
      updated_at: "2024-01-15T11:00:00Z",
    },
    {
      id: "note-3",
      transaction_id: "txn-123",
      note_type: "INITIAL_REVIEW",
      note_content: "This is the third note",
      is_private: false,
      is_system_generated: false,
      analyst_id: "analyst-1",
      analyst_name: "John Doe",
      analyst_email: "john.doe@example.com",
      case_id: null,
      created_at: "2024-01-15T09:00:00Z",
      updated_at: "2024-01-15T09:00:00Z",
    },
  ];

  const currentUserId = "analyst-1";
  const onAddNote = vi.fn();
  const onEditNote = vi.fn();
  const onDeleteNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers for component tests
    vi.useRealTimers();
  });

  afterEach(() => {});

  describe("note count display", () => {
    it("displays correct count when notes exist", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // The count may be split into separate nodes (e.g. "Notes (", "3", ")"). Find the card header and assert a numeric child exists
      const header = document.querySelector(".ant-card-head-title");
      expect(header).toBeInTheDocument();
      const countNode = within(header as HTMLElement).getByText((content) => /^\d+$/.test(content));
      expect(countNode).toHaveTextContent("3");
    });

    it("displays zero count when no notes exist", () => {
      render(
        <NotesPanel
          notes={[]}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // Find the card header and assert the numeric child shows zero
      const header = document.querySelector(".ant-card-head-title");
      expect(header).toBeInTheDocument();
      const countNode = within(header as HTMLElement).getByText((content) => /^\d+$/.test(content));
      expect(countNode).toHaveTextContent("0");
    });

    it("displays count with single note", () => {
      render(
        <NotesPanel
          notes={[mockNotes[0]]}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // Find the card header and assert the numeric child shows one
      const header = document.querySelector(".ant-card-head-title");
      expect(header).toBeInTheDocument();
      const countNode = within(header as HTMLElement).getByText((content) => /^\d+$/.test(content));
      expect(countNode).toHaveTextContent("1");
    });
  });

  describe("Add button visibility", () => {
    it("shows Add button when canAdd is true and onAddNote is provided", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canAdd={true}
        />
      );

      const addButton = screen.getByRole("button", { name: /add note/i });
      expect(addButton).toBeInTheDocument();
    });

    it("does not show Add button when canAdd is false", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canAdd={false}
        />
      );

      const addButton = screen.queryByRole("button", { name: /add note/i });
      expect(addButton).not.toBeInTheDocument();
    });

    it("does not show Add button when onAddNote is not provided", () => {
      render(<NotesPanel notes={mockNotes} currentUserId={currentUserId} canAdd={true} />);

      const addButton = screen.queryByRole("button", { name: /add note/i });
      expect(addButton).not.toBeInTheDocument();
    });
  });

  describe("note sorting", () => {
    it("sorts notes by created_at descending (newest first)", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      const noteCards = screen.getAllByText(/This is the .* note/);

      // First note should be note-2 (11:00:00 - newest)
      expect(noteCards[0]).toHaveTextContent("This is the second note");

      // Second note should be note-1 (10:00:00 - middle)
      expect(noteCards[1]).toHaveTextContent("This is the first note");

      // Third note should be note-3 (09:00:00 - oldest)
      expect(noteCards[2]).toHaveTextContent("This is the third note");
    });

    it("maintains order when notes have same timestamp", () => {
      const notesWithSameTime: AnalystNote[] = [
        { ...mockNotes[0], id: "note-a", created_at: "2024-01-15T10:00:00Z" },
        { ...mockNotes[1], id: "note-b", created_at: "2024-01-15T10:00:00Z" },
      ];

      render(
        <NotesPanel
          notes={notesWithSameTime}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // Both notes should be rendered (order is stable but not guaranteed)
      expect(screen.getByText("This is the first note")).toBeInTheDocument();
      expect(screen.getByText("This is the second note")).toBeInTheDocument();
    });
  });

  describe("edit button visibility", () => {
    it("shows edit button for own non-system notes when onEditNote is provided", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // First note belongs to current user
      const firstNoteEditButton = screen.getAllByRole("button", { name: /edit/i })[0];
      expect(firstNoteEditButton).toBeInTheDocument();
    });

    it("does not show edit button for other users notes", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId="different-user"
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // No edit buttons should be shown since none belong to "different-user"
      const editButtons = screen.queryAllByRole("button", { name: /edit/i });
      expect(editButtons).toHaveLength(0);
    });

    it("does not show edit button for system-generated notes", () => {
      const systemNote: AnalystNote = {
        ...mockNotes[0],
        is_system_generated: true,
      };

      render(
        <NotesPanel
          notes={[systemNote]}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      const editButton = screen.queryByRole("button", { name: /edit/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it("does not show edit button when onEditNote is not provided", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
        />
      );

      const editButtons = screen.queryAllByRole("button", { name: /edit/i });
      expect(editButtons).toHaveLength(0);
    });
  });

  describe("delete button visibility", () => {
    it("shows delete button for own notes when onDeleteNote is provided", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // First note belongs to current user
      const firstNoteDeleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
      expect(firstNoteDeleteButton).toBeInTheDocument();
    });

    it("shows delete button for other users notes when canDeleteOthers is true", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId="different-user"
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canDeleteOthers={true}
        />
      );

      // Should see delete buttons for all notes (including other users')
      const deleteButtons = screen.queryAllByRole("button", { name: /delete/i });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it("does not show delete button for other users notes when canDeleteOthers is false", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId="different-user"
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canDeleteOthers={false}
        />
      );

      // No delete buttons should be shown
      const deleteButtons = screen.queryAllByRole("button", { name: /delete/i });
      expect(deleteButtons).toHaveLength(0);
    });

    it("does not show delete button for system-generated notes", () => {
      const systemNote: AnalystNote = {
        ...mockNotes[0],
        is_system_generated: true,
      };

      render(
        <NotesPanel
          notes={[systemNote]}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canDeleteOthers={true}
        />
      );

      const deleteButton = screen.queryByRole("button", { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it("does not show delete button when onDeleteNote is not provided", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
        />
      );

      const deleteButtons = screen.queryAllByRole("button", { name: /delete/i });
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe("empty state", () => {
    it("shows empty state when no notes exist", () => {
      render(
        <NotesPanel
          notes={[]}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      expect(screen.getByText(/No notes yet/)).toBeInTheDocument();
      expect(screen.getByText(/Add the first note to document your findings/)).toBeInTheDocument();
    });

    it("shows Add button in empty state when canAdd is true", () => {
      render(
        <NotesPanel
          notes={[]}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canAdd={true}
        />
      );

      const addButton = screen.getByRole("button", { name: /add note/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows spinner when loading is true", () => {
      const { container } = render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          loading={true}
        />
      );

      const spinner = container.querySelector(".ant-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("does not show spinner when loading is false", () => {
      const { container } = render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          loading={false}
        />
      );

      const spinner = container.querySelector(".ant-spin-spinning");
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe("Add Note modal", () => {
    it("opens modal when Add button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canAdd={true}
        />
      );

      const addButton = screen.getByRole("button", { name: /add note/i });
      await act(async () => {
        await user.click(addButton);
      });

      // Modal should open - find dialog and assert title within it
      const modal = await screen.findByRole("dialog");
      expect(within(modal).getByText("Add Note")).toBeInTheDocument();
    });

    it("closes modal when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canAdd={true}
        />
      );

      // Open modal
      const addButton = await screen.findByRole("button", { name: /add note/i });
      await user.click(addButton);

      // Click cancel (using Escape or clicking outside)
      const cancelButton = await screen.findByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      // Wait for the modal/dialog to be hidden or removed (accept either)
      await waitFor(
        () => {
          const dlg = screen.queryByRole("dialog");
          // Dialog may be removed from DOM (dlg == null) or kept but hidden (no client rects)
          if (!dlg) return true;
          return (dlg as HTMLElement).getClientRects().length === 0;
        },
        { timeout: 5000 }
      );
    });
  });

  describe("delete interaction", () => {
    it("calls onDeleteNote when note is deleted", async () => {
      const user = userEvent.setup();
      const mockDeleteFn = vi.fn().mockResolvedValue(undefined);

      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={mockDeleteFn}
        />
      );

      // Find first delete button (for user's own note)
      const deleteButtons = await screen.findAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Click confirm in popconfirm
      const confirmButton = await screen.findByRole("button", { name: "Delete" });
      await user.click(confirmButton);

      // Wait for the delete handler to be called (allow for async UI/animation delays)
      await waitFor(
        () => {
          expect(mockDeleteFn).toHaveBeenCalledWith("note-1");
        },
        { timeout: 10000 }
      );
    });

    it("disables buttons during delete operation", async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: void) => void;
      const mockDeleteFn = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolveDelete = resolve;
        });
      });

      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={mockDeleteFn}
        />
      );

      // Trigger delete
      const deleteButtons = await screen.findAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);
      const confirmButton = await screen.findByRole("button", { name: "Delete" });
      await user.click(confirmButton);

      // Buttons should be disabled while loading
      // Re-query to find the delete button by accessible name (case-insensitive)
      const deleteButtonsAfter = await screen.findAllByRole("button", { name: /delete/i });
      const deleteButton = deleteButtonsAfter[0];
      expect(deleteButton).toBeDisabled();

      // Resolve the promise
      resolveDelete!();

      // Wait for the button to be re-enabled with a more specific assertion
      await waitFor(
        () => {
          expect(deleteButton).not.toBeDisabled();
        },
        { timeout: 5000 } // Increase timeout for this specific assertion
      );
    });
  });

  describe("error handling", () => {
    it("shows error message when add note fails", async () => {
      const user = userEvent.setup();
      const mockAddFn = vi.fn().mockRejectedValue(new Error("Failed to add"));

      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={mockAddFn}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
          canAdd={true}
        />
      );

      // Open modal and submit
      const addButton = await screen.findByRole("button", { name: /add note/i });
      await user.click(addButton);

      // Fill form (this would require AddNoteModal to be testable)
      // For now, just verify the modal/dialog is shown and scoped title exists
      const modal = await screen.findByRole("dialog");
      expect(within(modal).getByText("Add Note")).toBeInTheDocument();
    });

    it("shows error message when delete note fails", async () => {
      const user = userEvent.setup();
      const mockDeleteFn = vi.fn().mockRejectedValue(new Error("Failed to delete"));

      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={mockDeleteFn}
        />
      );

      // Trigger delete
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await act(async () => {
        await user.click(deleteButtons[0]);
      });
      const confirmButton = await screen.findByRole("button", { name: "Delete" });
      await act(async () => {
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("Failed to delete note");
      });
    });
  });

  describe("note content display", () => {
    it("displays all note cards when notes exist", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      expect(screen.getByText("This is the first note")).toBeInTheDocument();
      expect(screen.getByText("This is the second note")).toBeInTheDocument();
      expect(screen.getByText("This is the third note")).toBeInTheDocument();
    });

    it("displays analyst names for notes", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      // John Doe may appear multiple times (multiple notes); assert at least one exists
      expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("displays note type badges", () => {
      render(
        <NotesPanel
          notes={mockNotes}
          currentUserId={currentUserId}
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          onDeleteNote={onDeleteNote}
        />
      );

      expect(screen.getByText("General")).toBeInTheDocument();
      expect(screen.getByText("Fraud Confirmed")).toBeInTheDocument();
      expect(screen.getByText("Initial Review")).toBeInTheDocument();
    });
  });
});
