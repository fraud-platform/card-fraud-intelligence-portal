/**
 * ReviewActionButtons Component
 *
 * Action buttons for transaction review: Assign, Resolve, Escalate.
 * Buttons are enabled/disabled based on workflow state and permissions.
 */

import React from "react";
import { Space, Button } from "antd";
import { UserAddOutlined, CheckCircleOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { ActionAvailability } from "../../shared/utils/reviewWorkflow";
import { usePermissions } from "../../hooks/usePermissions";

interface ReviewActionButtonsProps {
  actionAvailability: ActionAvailability;
  onAssignClick: () => void;
  onResolveClick: () => void;
  onEscalateClick: () => void;
  /** Whether assign handler is available */
  hasAssignHandler: boolean;
  /** Whether resolve handler is available */
  hasResolveHandler: boolean;
  /** Whether escalate handler is available */
  hasEscalateHandler: boolean;
  /** Disable all buttons */
  disabled?: boolean;
}

/**
 * Renders the action buttons for review workflows
 */
export function ReviewActionButtons({
  actionAvailability,
  onAssignClick,
  onResolveClick,
  onEscalateClick,
  hasAssignHandler,
  hasResolveHandler,
  hasEscalateHandler,
  disabled = false,
}: ReviewActionButtonsProps): React.ReactElement {
  const perms = usePermissions();
  const canReviewTransactions = perms?.capabilities?.canReviewTransactions ?? false;

  return (
    <Space>
      <Button
        icon={<UserAddOutlined />}
        onClick={onAssignClick}
        disabled={
          disabled || !actionAvailability.canAssign || !hasAssignHandler || !canReviewTransactions
        }
        size="small"
      >
        Assign
      </Button>
      <Button
        icon={<CheckCircleOutlined />}
        type="primary"
        onClick={onResolveClick}
        disabled={
          disabled || !actionAvailability.canResolve || !hasResolveHandler || !canReviewTransactions
        }
        size="small"
      >
        Resolve
      </Button>
      <Button
        icon={<ArrowUpOutlined />}
        onClick={onEscalateClick}
        disabled={
          disabled ||
          !actionAvailability.canEscalate ||
          !hasEscalateHandler ||
          !canReviewTransactions
        }
        size="small"
        danger
      >
        Escalate
      </Button>
    </Space>
  );
}

export default ReviewActionButtons;
