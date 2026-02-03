/**
 * NoteCard Component Tests
 *
 * Tests the note card component displays note metadata correctly
 * and handles user interactions for editing and deleting notes.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteCard } from "../NoteCard";
import type { AnalystNote } from "../../../types/notes";

describe("NoteCard", () => {
  const mockNote: AnalystNote = {
    id: "note-1",
    transaction_id: "txn-123",
    note_type: "GENERAL",
    note_content: "This is a test note with important information.",
    is_private: false,
    is_system_generated: false,
    analyst_id: "analyst-1",
    analyst_name: "John Doe",
    analyst_email: "john.doe@example.com",
    case_id: null,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic rendering", () => {
    it("displays note content", () => {
      render(<NoteCard note={mockNote} />);

      expect(screen.getByText(mockNote.note_content)).toBeInTheDocument();
    });

    it("displays analyst name", () => {
      render(<NoteCard note={mockNote} />);

      expect(screen.getByText(mockNote.analyst_name!)).toBeInTheDocument();
    });

    it("displays analyst_id when analyst_name is null", () => {
      const noteWithoutName = { ...mockNote, analyst_name: null };
      render(<NoteCard note={noteWithoutName} />);

      expect(screen.getByText(mockNote.analyst_id)).toBeInTheDocument();
    });

    it("displays formatted timestamp", () => {
      render(<NoteCard note={mockNote} />);

      // Check for partial date string (format may vary by locale)
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    });

    it("displays note type badge", () => {
      render(<NoteCard note={mockNote} />);

      expect(screen.getByText("General")).toBeInTheDocument();
    });
  });

  describe("private note indicator", () => {
    it("shows private icon when note is private", () => {
      const privateNote = { ...mockNote, is_private: true };
      render(<NoteCard note={privateNote} />);

      const lockIcon = document.querySelector(".anticon-lock");
      expect(lockIcon).toBeInTheDocument();
    });

    it("does not show private icon when note is public", () => {
      render(<NoteCard note={mockNote} />);

      const lockIcon = document.querySelector(".anticon-lock");
      expect(lockIcon).not.toBeInTheDocument();
    });
  });

  describe("system-generated indicator", () => {
    it("shows system label when note is system-generated", () => {
      const systemNote = { ...mockNote, is_system_generated: true };
      render(<NoteCard note={systemNote} />);

      expect(screen.getByText("(System)")).toBeInTheDocument();
    });

    it("does not show system label when note is user-generated", () => {
      render(<NoteCard note={mockNote} />);

      expect(screen.queryByText("(System)")).not.toBeInTheDocument();
    });
  });

  describe("edit button visibility", () => {
    it("shows edit button when canEdit is true and onEdit is provided", () => {
      const onEdit = vi.fn();
      render(<NoteCard note={mockNote} canEdit={true} onEdit={onEdit} />);

      const editButton = screen.getByRole("button", { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });

    it("does not show edit button when canEdit is false", () => {
      const onEdit = vi.fn();
      render(<NoteCard note={mockNote} canEdit={false} onEdit={onEdit} />);

      const editButton = screen.queryByRole("button", { name: /edit/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it("does not show edit button when onEdit is not provided", () => {
      render(<NoteCard note={mockNote} canEdit={true} />);

      const editButton = screen.queryByRole("button", { name: /edit/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it("does not show edit button by default", () => {
      render(<NoteCard note={mockNote} />);

      const editButton = screen.queryByRole("button", { name: /edit/i });
      expect(editButton).not.toBeInTheDocument();
    });
  });

  describe("delete button visibility", () => {
    it("shows delete button when canDelete is true and onDelete is provided", () => {
      const onDelete = vi.fn();
      render(<NoteCard note={mockNote} canDelete={true} onDelete={onDelete} />);

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it("does not show delete button when canDelete is false", () => {
      const onDelete = vi.fn();
      render(<NoteCard note={mockNote} canDelete={false} onDelete={onDelete} />);

      const deleteButton = screen.queryByRole("button", { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it("does not show delete button when onDelete is not provided", () => {
      render(<NoteCard note={mockNote} canDelete={true} />);

      const deleteButton = screen.queryByRole("button", { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it("does not show delete button by default", () => {
      render(<NoteCard note={mockNote} />);

      const deleteButton = screen.queryByRole("button", { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  describe("edit interaction", () => {
    it("calls onEdit with note when edit button is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<NoteCard note={mockNote} canEdit={true} onEdit={onEdit} />);

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockNote);
    });

    it("disables edit button when loading", () => {
      const onEdit = vi.fn();
      render(<NoteCard note={mockNote} canEdit={true} onEdit={onEdit} loading={true} />);

      const editButton = screen.getByRole("button", { name: /edit/i });
      expect(editButton).toBeDisabled();
    });
  });

  describe("delete interaction", () => {
    it("shows confirmation popover when delete button is clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<NoteCard note={mockNote} canDelete={true} onDelete={onDelete} />);

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      // Popconfirm should appear with confirmation text
      expect(screen.getByText("Delete this note?")).toBeInTheDocument();
    });

    it("calls onDelete with note id when delete is confirmed", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<NoteCard note={mockNote} canDelete={true} onDelete={onDelete} />);

      // Click delete button to open popconfirm
      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      // Click confirm button in popconfirm
      const confirmButton = screen.getByRole("button", { name: "Delete" });
      await user.click(confirmButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(mockNote.id);
    });

    it("disables delete button when loading", () => {
      const onDelete = vi.fn();
      render(<NoteCard note={mockNote} canDelete={true} onDelete={onDelete} loading={true} />);

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe("combined edit and delete permissions", () => {
    it("shows both buttons when both permissions are granted", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      render(
        <NoteCard
          note={mockNote}
          canEdit={true}
          canDelete={true}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    it("shows neither button when no permissions are granted", () => {
      render(<NoteCard note={mockNote} canEdit={false} canDelete={false} />);

      expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe("different note types", () => {
    it("renders FRAUD_CONFIRMED note type correctly", () => {
      const fraudNote = { ...mockNote, note_type: "FRAUD_CONFIRMED" as const };
      render(<NoteCard note={fraudNote} />);

      expect(screen.getByText("Fraud Confirmed")).toBeInTheDocument();
    });

    it("renders ESCALATION note type correctly", () => {
      const escalationNote = { ...mockNote, note_type: "ESCALATION" as const };
      render(<NoteCard note={escalationNote} />);

      expect(screen.getByText("Escalation")).toBeInTheDocument();
    });

    it("renders RESOLUTION note type correctly", () => {
      const resolutionNote = { ...mockNote, note_type: "RESOLUTION" as const };
      render(<NoteCard note={resolutionNote} />);

      expect(screen.getByText("Resolution")).toBeInTheDocument();
    });
  });

  describe("multi-line content handling", () => {
    it("preserves whitespace in note content", () => {
      const multilineNote = {
        ...mockNote,
        note_content: "Line 1\nLine 2\n\nLine 4",
      };
      const { container } = render(<NoteCard note={multilineNote} />);

      // Paragraph should use the CSS class that preserves whitespace
      const paragraph = container.querySelector(".note-paragraph");
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveClass("note-paragraph");
    });
  });

  describe("card structure", () => {
    it("renders as an Ant Design Card", () => {
      const { container } = render(<NoteCard note={mockNote} />);

      expect(container.querySelector(".ant-card")).toBeInTheDocument();
    });

    it("uses small card size", () => {
      const { container } = render(<NoteCard note={mockNote} />);

      const card = container.querySelector(".ant-card-small");
      expect(card).toBeInTheDocument();
    });
  });
});
