/**
 * RiskLevelBadge Component
 *
 * Displays risk level with appropriate color coding.
 */

import React from "react";
import { Tag } from "antd";
import type { RiskLevel } from "../../types/review";
import { RISK_LEVEL_CONFIG } from "../../types/worklist";

interface RiskLevelBadgeProps {
  level: RiskLevel | null | undefined;
  size?: "default" | "small";
  showLabel?: boolean;
}

/**
 * Risk level badge with color coding
 */
export function RiskLevelBadge({
  level,
  size = "default",
  showLabel = true,
}: RiskLevelBadgeProps): React.ReactElement {
  if (level == null) {
    return (
      <Tag color="default" style={size === "small" ? { fontSize: 11 } : undefined}>
        N/A
      </Tag>
    );
  }

  const config = RISK_LEVEL_CONFIG[level] ?? { label: level, color: "default" };

  return (
    <Tag
      color={config.color}
      style={size === "small" ? { fontSize: 11, padding: "0 4px" } : undefined}
    >
      {showLabel ? config.label : level}
    </Tag>
  );
}

export default RiskLevelBadge;
