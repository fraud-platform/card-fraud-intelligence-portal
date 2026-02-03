/**
 * NotesPanel Component
 *
 * Panel for displaying and managing analyst notes on a transaction.
 */

import React, { useState } from "react";
import { Card, Space, Button, Empty, Typography, Spin, message } from "antd";
import { PlusOutlined, CommentOutlined } from "@ant-design/icons";
import type { AnalystNote, NoteCreateRequest, NoteUpdateRequest } from "../../types/notes";
import NoteCard from "./NoteCard";
import AddNoteModal from "./AddNoteModal";
import EditNoteModal from "./EditNoteModal";

const { Text } = Typography;

interface NotesPanelProps {
  readonly notes: AnalystNote[];
  readonly currentUserId?: string;
  readonly onAddNote?: (note: NoteCreateRequest) => Promise<void>;
  readonly onEditNote?: (noteId: string, note: NoteUpdateRequest) => Promise<void>;
  readonly onDeleteNote?: (noteId: string) => Promise<void>;
  readonly loading?: boolean;
  readonly canAdd?: boolean;
  readonly canDeleteOthers?: boolean;
}

/**
 * Panel for managing transaction notes
 */
export function NotesPanel({
  notes,
  currentUserId,
  onAddNote,
  onEditNote,
  onDeleteNote,
  loading = false,
  canAdd = true,
  canDeleteOthers = false,
}: NotesPanelProps): React.ReactElement {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<AnalystNote | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAddNote = (note: NoteCreateRequest): void => {
    if (onAddNote == null) return;
    setActionLoading(true);
    onAddNote(note)
      .then(() => {
        void message.success("Note added successfully");
        setAddModalOpen(false);
      })
      .catch(() => {
        void message.error("Failed to add note");
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const handleDeleteNote = (noteId: string): void => {
    if (onDeleteNote == null) return;
    setActionLoading(true);
    onDeleteNote(noteId)
      .then(() => {
        void message.success("Note deleted");
      })
      .catch(() => {
        void message.error("Failed to delete note");
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const handleEditNote = (noteId: string, note: NoteUpdateRequest): void => {
    if (onEditNote == null) return;
    setActionLoading(true);
    onEditNote(noteId, note)
      .then(() => {
        void message.success("Note updated");
        setEditModalOpen(false);
        setNoteToEdit(null);
      })
      .catch(() => {
        void message.error("Failed to update note");
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const canEditNote = (note: AnalystNote): boolean => {
    return note.analyst_id === currentUserId && !note.is_system_generated;
  };

  const canDeleteNote = (note: AnalystNote): boolean => {
    if (note.is_system_generated) return false;
    return note.analyst_id === currentUserId || canDeleteOthers;
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <>
      <Card
        size="small"
        title={
          <Space>
            <CommentOutlined />
            Notes ({notes.length})
          </Space>
        }
        extra={
          canAdd &&
          onAddNote != null && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setAddModalOpen(true)}
            >
              Add Note
            </Button>
          )
        }
      >
        <Spin spinning={loading}>
          {sortedNotes.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">
                  No notes yet. Add the first note to document your findings.
                </Text>
              }
            />
          ) : (
            sortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                canEdit={canEditNote(note) && onEditNote != null}
                canDelete={canDeleteNote(note) && onDeleteNote != null}
                onEdit={(target) => {
                  setNoteToEdit(target);
                  setEditModalOpen(true);
                }}
                onDelete={handleDeleteNote}
                loading={actionLoading}
              />
            ))
          )}
        </Spin>
      </Card>

      <AddNoteModal
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onSubmit={handleAddNote}
        loading={actionLoading}
      />

      <EditNoteModal
        open={editModalOpen}
        note={noteToEdit}
        onCancel={() => {
          setEditModalOpen(false);
          setNoteToEdit(null);
        }}
        onSubmit={handleEditNote}
        loading={actionLoading}
      />
    </>
  );
}

export default NotesPanel;
