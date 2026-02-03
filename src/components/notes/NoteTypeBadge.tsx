/**
 * NoteTypeBadge Component
 *
 * Displays note type with appropriate color coding.
 */

import React from "react";
import { Tag } from "antd";
import { NOTE_TYPE_CONFIG, type NoteType } from "../../types/notes";

interface NoteTypeBadgeProps {
  type: NoteType;
  size?: "default" | "small";
}

/**
 * Note type badge with color coding
 */
export function NoteTypeBadge({ type, size = "default" }: NoteTypeBadgeProps): React.ReactElement {
  const config = NOTE_TYPE_CONFIG[type] ?? { label: type, color: "default" };

  return (
    <Tag
      color={config.color}
      style={size === "small" ? { fontSize: 11, padding: "0 4px" } : undefined}
    >
      {config.label}
    </Tag>
  );
}

export default NoteTypeBadge;
