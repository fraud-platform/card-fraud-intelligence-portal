/**
 * StatusBadge Component
 *
 * Displays transaction review status with appropriate color coding.
 */

import React from "react";
import { Tag } from "antd";
import type { TransactionStatus } from "../../types/review";
import { TRANSACTION_STATUS_CONFIG } from "../../types/worklist";

interface StatusBadgeProps {
  status: TransactionStatus;
  size?: "default" | "small";
}

/**
 * Status badge for transaction review workflow
 */
export function StatusBadge({ status, size = "default" }: StatusBadgeProps): React.ReactElement {
  const config = TRANSACTION_STATUS_CONFIG[status] ?? {
    label: status,
    color: "default",
  };

  return (
    <Tag
      color={config.color}
      style={size === "small" ? { fontSize: 11, padding: "0 4px" } : undefined}
    >
      {config.label}
    </Tag>
  );
}

export default StatusBadge;
