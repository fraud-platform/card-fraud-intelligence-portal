/**
 * PriorityBadge Component
 *
 * Displays priority level (1-5) with appropriate color coding.
 */

import React from "react";
import { Tag } from "antd";
import { PRIORITY_CONFIG } from "../../types/worklist";

interface PriorityBadgeProps {
  priority: number;
  size?: "default" | "small";
  showLabel?: boolean;
}

/**
 * Priority badge with color coding (1=Critical, 5=Minimal)
 */
export function PriorityBadge({
  priority,
  size = "default",
  showLabel = true,
}: PriorityBadgeProps): React.ReactElement {
  const config = PRIORITY_CONFIG[priority] ?? {
    label: `P${priority}`,
    color: "default",
  };

  return (
    <Tag
      color={config.color}
      style={size === "small" ? { fontSize: 11, padding: "0 4px" } : undefined}
    >
      {showLabel ? config.label : `P${priority}`}
    </Tag>
  );
}

export default PriorityBadge;
