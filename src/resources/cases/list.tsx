/**
 * Cases List Page
 *
 * List and manage transaction investigation cases.
 */

import { useState, useMemo, useCallback, type ReactElement } from "react";
import { Card, Table, Space, Button, Select, Typography, Tag, Tooltip } from "antd";
import { PlusOutlined, ReloadOutlined, EyeOutlined, FolderOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useGo } from "@refinedev/core";
import {
  CASE_TYPE_CONFIG,
  CASE_STATUS_CONFIG,
  type TransactionCase,
  type CaseType,
  type CaseStatus,
} from "../../types/case";
import type { RiskLevel } from "../../types/review";
import { useCasesList } from "../../hooks";
import { RiskLevelBadge } from "../../components/review";
import "../../shared/styles/widths.css";
import "./list.css";

const { Title, Text } = Typography;

/**
 * Format currency amount
 */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Cases List Page
 */

const STATUS_OPTIONS = Object.entries(CASE_STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

const TYPE_OPTIONS = Object.entries(CASE_TYPE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

function buildColumns(handleViewCase: (caseId: string) => void): ColumnsType<TransactionCase> {
  return [
    {
      title: "Case #",
      dataIndex: "case_number",
      key: "case_number",
      width: 140,
      render: (caseNumber: string) => (
        <Text strong className="mono-text">
          {caseNumber}
        </Text>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: true,
      render: (title: string) => (
        <Tooltip title={title}>
          <Text>{title}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Type",
      dataIndex: "case_type",
      key: "case_type",
      width: 130,
      render: (type: CaseType) => {
        const config = CASE_TYPE_CONFIG[type];
        return <Tag color={config?.color}>{config?.label ?? type}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "case_status",
      key: "case_status",
      width: 120,
      render: (status: CaseStatus) => {
        const config = CASE_STATUS_CONFIG[status];
        return <Tag color={config?.color}>{config?.label ?? status}</Tag>;
      },
    },
    {
      title: "Risk",
      dataIndex: "risk_level",
      key: "risk_level",
      width: 90,
      render: (level: RiskLevel | null) => <RiskLevelBadge level={level} size="small" />,
    },
    {
      title: "Transactions",
      dataIndex: "total_transaction_count",
      key: "total_transaction_count",
      width: 100,
      align: "center",
    },
    {
      title: "Total Amount",
      dataIndex: "total_transaction_amount",
      key: "total_transaction_amount",
      width: 130,
      render: (amount: number) => formatAmount(amount),
      sorter: (a, b) => a.total_transaction_amount - b.total_transaction_amount,
    },
    {
      title: "Assigned To",
      dataIndex: "assigned_analyst_name",
      key: "assigned_analyst_name",
      width: 150,
      render: (name: string | null) => name ?? <Text type="secondary">Unassigned</Text>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 110,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewCase(record.id)}
        >
          View
        </Button>
      ),
    },
  ];
}

export default function CasesList(): ReactElement {
  const go = useGo();
  const [statusFilter, setStatusFilter] = useState<CaseStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<CaseType | null>(null);

  const { cases, total, isLoading, refetch } = useCasesList({
    filters: {
      case_status: statusFilter ?? undefined,
      case_type: typeFilter ?? undefined,
    },
  });

  // Memoize handlers to prevent unnecessary column re-renders
  const handleViewCase = useCallback(
    (caseId: string) => {
      go({ to: `/cases/show/${caseId}` });
    },
    [go]
  );

  const handleCreateCase = useCallback(() => {
    go({ to: "/cases/create" });
  }, [go]);

  const columns = useMemo(() => buildColumns(handleViewCase), [handleViewCase]);

  return (
    <Space direction="vertical" size="middle" className="cases-container">
      <Space className="cases-actions-space">
        <Title level={4} className="cases-title">
          <FolderOutlined className="folder-icon" />
          Cases
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCase}>
          New Case
        </Button>
      </Space>

      <Card size="small">
        <Space className="filter-space">
          <Select
            placeholder="Status"
            aria-label="Status"
            allowClear
            className="w-140"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          <Select
            placeholder="Type"
            aria-label="Type"
            allowClear
            className="w-160"
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_OPTIONS}
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Refresh
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={cases}
          rowKey="id"
          loading={isLoading}
          size="small"
          scroll={{ x: 1400 }}
          pagination={{
            total,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `${total} cases`,
          }}
        />
      </Card>
    </Space>
  );
}
