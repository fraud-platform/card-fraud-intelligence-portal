/**
 * NoteCard Component
 *
 * Displays a single analyst note with metadata.
 */

import React from "react";
import { Card, Space, Typography, Button, Tooltip, Popconfirm } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  LockOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { AnalystNote } from "../../types/notes";
import NoteTypeBadge from "./NoteTypeBadge";
import "./note-card.css";

const { Text, Paragraph } = Typography;

interface NoteCardProps {
  note: AnalystNote;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (note: AnalystNote) => void;
  onDelete?: (noteId: string) => void;
  loading?: boolean;
}

/**
 * Card displaying a single analyst note
 */
export function NoteCard({
  note,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  loading = false,
}: NoteCardProps): React.ReactElement {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      size="small"
      className="note-card-root"
      extra={
        <Space size="small">
          {canEdit && onEdit != null && (
            <Tooltip title="Edit note">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(note)}
                disabled={loading}
              />
            </Tooltip>
          )}
          {canDelete && onDelete != null && (
            <Popconfirm
              title="Delete this note?"
              onConfirm={() => onDelete(note.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete note">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  disabled={loading}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <Space direction="vertical" size="small" className="note-card-content">
        <Space size="small" wrap>
          <NoteTypeBadge type={note.note_type} size="small" />
          {note.is_private && (
            <Tooltip title="Private note - only visible to you">
              <LockOutlined className="note-lock-icon" />
            </Tooltip>
          )}
          {note.is_system_generated && (
            <Text type="secondary" className="note-system-text">
              (System)
            </Text>
          )}
        </Space>

        <Paragraph className="note-paragraph">{note.note_content}</Paragraph>

        <Space size="large" className="note-meta">
          <Space size={4}>
            <UserOutlined />
            <Text type="secondary" className="note-meta-text">
              {note.analyst_name ?? note.analyst_id}
            </Text>
          </Space>
          <Space size={4}>
            <ClockCircleOutlined />
            <Text type="secondary" className="note-meta-text">
              {formatDate(note.created_at)}
            </Text>
          </Space>
        </Space>
      </Space>
    </Card>
  );
}

export default NoteCard;
