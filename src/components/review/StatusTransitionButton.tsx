/**
 * StatusTransitionButton Component
 *
 * Button that shows valid status transitions for a transaction.
 */

import React from "react";
import { Button, Dropdown, Space, type MenuProps } from "antd";
import { DownOutlined, CaretRightOutlined } from "@ant-design/icons";
import { getValidTransitions, type TransactionStatus } from "../../types/review";
import { TRANSACTION_STATUS_CONFIG } from "../../types/worklist";

interface StatusTransitionButtonProps {
  currentStatus: TransactionStatus;
  onTransition: (newStatus: TransactionStatus) => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Dropdown button for status transitions
 */
export function StatusTransitionButton({
  currentStatus,
  onTransition,
  loading = false,
  disabled = false,
}: StatusTransitionButtonProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const validTransitions = getValidTransitions(currentStatus);

  if (validTransitions.length === 0) {
    return (
      <Button disabled size="small">
        No transitions available
      </Button>
    );
  }

  const menuItems: MenuProps["items"] = validTransitions.map((status) => ({
    key: status,
    label: (
      <Space>
        <CaretRightOutlined />
        {TRANSACTION_STATUS_CONFIG[status]?.label ?? status}
      </Space>
    ),
    onClick: () => {
      onTransition(status);
      setOpen(false);
    },
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      disabled={disabled || loading}
      open={open}
      onOpenChange={(flag) => setOpen(flag)}
      getPopupContainer={(trigger) => trigger?.parentElement ?? document.body}
    >
      <Button
        size="small"
        loading={loading}
        aria-label="Transition Change Status Start Review"
        onClick={() => {
          if (!disabled && !loading) {
            setOpen((s) => !s);
          }
        }}
      >
        <Space>
          Change Status
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}

export default StatusTransitionButton;
