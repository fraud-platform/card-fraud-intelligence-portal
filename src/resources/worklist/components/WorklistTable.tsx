/**
 * WorklistTable Component
 *
 * Table component for displaying worklist items with all columns.
 */

import { useMemo, type FC } from "react";
import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { WorklistItem } from "../../../types/worklist";
import type { TransactionStatus, RiskLevel } from "../../../types/review";
import { StatusBadge, RiskLevelBadge, PriorityBadge } from "../../../components/review";
import { getDecisionColor } from "../../../theme/tokens";
import { formatCurrency, formatTimeInQueue } from "../../../shared/utils/format";

const { Text } = Typography;

export interface WorklistTableProps {
  items: WorklistItem[];
  total: number;
  isLoading: boolean;
  onViewTransaction: (transactionId: string) => void;
  onAssignToMe: (transactionId: string) => void;
  onStartReview: (transactionId: string) => void;
}

/**
 * Worklist table component with memoized columns to prevent unnecessary re-renders
 */
function buildWorklistColumns(
  onViewTransaction: (transactionId: string) => void,
  onAssignToMe: (transactionId: string) => void,
  onStartReview: (transactionId: string) => void
): ColumnsType<WorklistItem> {
  return [
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 90,
      render: (priority: number) => <PriorityBadge priority={priority} />,
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: TransactionStatus) => <StatusBadge status={status} />,
    },
    {
      title: "Risk",
      dataIndex: "risk_level",
      key: "risk_level",
      width: 90,
      render: (level: RiskLevel | null) => <RiskLevelBadge level={level} size="small" />,
    },
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      width: 140,
      render: (id: string) => (
        <Tooltip title={id}>
          <Text copyable className="muted-small">
            {id.slice(0, 12)}...
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Amount",
      dataIndex: "transaction_amount",
      key: "transaction_amount",
      width: 120,
      render: (amount: number, record) => formatCurrency(amount, record.transaction_currency),
      sorter: (a, b) => a.transaction_amount - b.transaction_amount,
    },
    {
      title: "Decision",
      dataIndex: "decision",
      key: "decision",
      width: 100,
      render: (decision: string) => <Tag color={getDecisionColor(decision)}>{decision}</Tag>,
    },
    {
      title: "Reason",
      dataIndex: "decision_reason",
      key: "decision_reason",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Card",
      dataIndex: "card_last4",
      key: "card_last4",
      width: 80,
      render: (last4: string | null) =>
        last4 == null ? <Text type="secondary">-</Text> : `****${last4}`,
    },
    {
      title: "Time in Queue",
      dataIndex: "time_in_queue_seconds",
      key: "time_in_queue",
      width: 100,
      render: (seconds: number | undefined) => formatTimeInQueue(seconds),
    },
    {
      title: "Case",
      dataIndex: "case_number",
      key: "case_number",
      width: 120,
      render: (caseNumber: string | null) =>
        caseNumber == null ? (
          <Text type="secondary">-</Text>
        ) : (
          <Text type="secondary">{caseNumber}</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewTransaction(record.transaction_id)}
          >
            View
          </Button>
          {record.assigned_analyst_id == null && (
            <Button size="small" onClick={() => onAssignToMe(record.transaction_id)}>
              Assign to me
            </Button>
          )}
          {(record.status === "PENDING" || record.status === "ESCALATED") && (
            <Button size="small" onClick={() => onStartReview(record.transaction_id)}>
              Start Review
            </Button>
          )}
        </Space>
      ),
    },
  ];
}

export const WorklistTable: FC<WorklistTableProps> = ({
  items,
  total,
  isLoading,
  onViewTransaction,
  onAssignToMe,
  onStartReview,
}) => {
  const columns = useMemo(
    () => buildWorklistColumns(onViewTransaction, onAssignToMe, onStartReview),
    [onViewTransaction, onAssignToMe, onStartReview]
  );

  return (
    <Table
      columns={columns}
      dataSource={items}
      rowKey="review_id"
      loading={isLoading}
      size="small"
      scroll={{ x: 1200, y: 600 }}
      virtual={true}
      pagination={{
        total,
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (totalItems: number) => `${totalItems} items`,
      }}
    />
  );
};
