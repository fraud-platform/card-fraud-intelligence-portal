/**
 * StatusDisplaySection Component
 *
 * Displays the current review status information including status,
 * risk level, assignment, priority, and resolution details.
 */

import React from "react";
import { Descriptions, Typography } from "antd";
import type { TransactionReview, TransactionStatus } from "../../types/review";
import StatusBadge from "./StatusBadge";
import RiskLevelBadge from "./RiskLevelBadge";

const { Text } = Typography;

interface StatusDisplaySectionProps {
  review: TransactionReview | null;
  currentStatus: TransactionStatus;
}

/**
 * Displays review status details in a compact description list
 */
export function StatusDisplaySection({
  review,
  currentStatus,
}: StatusDisplaySectionProps): React.ReactElement {
  const isResolved = review?.resolved_at !== undefined && review?.resolved_at !== null;

  return (
    <Descriptions size="small" column={2}>
      <Descriptions.Item label="Status">
        <StatusBadge status={currentStatus} />
      </Descriptions.Item>
      <Descriptions.Item label="Risk Level">
        <RiskLevelBadge level={review?.risk_level} />
      </Descriptions.Item>
      <Descriptions.Item label="Assigned To">
        {review?.assigned_analyst_name ?? <Text type="secondary">Unassigned</Text>}
      </Descriptions.Item>
      <Descriptions.Item label="Priority">{review?.priority ?? 3}</Descriptions.Item>
      {isResolved && (
        <>
          <Descriptions.Item label="Resolution">{review?.resolution_code}</Descriptions.Item>
          <Descriptions.Item label="Resolved By">{review?.resolved_by}</Descriptions.Item>
        </>
      )}
    </Descriptions>
  );
}

export default StatusDisplaySection;
