/**
 * WorklistFilters Component
 *
 * Filter controls for the worklist including status, risk level, and assigned filter.
 */

import { useMemo, type FC } from "react";
import { Button, Select, Space } from "antd";
import "./worklist-filters.css";
import "../../../shared/styles/widths.css";
import { UserOutlined, ReloadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import type { TransactionStatus, RiskLevel } from "../../../types/review";
import { PRIORITY_CONFIG } from "../../../types/worklist";

export interface WorklistFiltersProps {
  statusFilter: TransactionStatus | null;
  onStatusFilterChange: (value: TransactionStatus | null) => void;
  riskFilter: RiskLevel | null;
  onRiskFilterChange: (value: RiskLevel | null) => void;
  priorityFilter: number | null;
  onPriorityFilterChange: (value: number | null) => void;
  assignedToMe: boolean;
  onAssignedToMeToggle: () => void;
  isLoading: boolean;
  onRefresh: () => void;
  isClaiming: boolean;
  onClaimNext: () => void;
}

/**
 * Filter controls component for worklist
 */
export const WorklistFilters: FC<WorklistFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  riskFilter,
  onRiskFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  assignedToMe,
  onAssignedToMeToggle,
  isLoading,
  onRefresh,
  isClaiming,
  onClaimNext,
}) => {
  const statusOptions = useMemo(
    () => [
      { value: "PENDING" as const, label: "Pending" },
      { value: "IN_REVIEW" as const, label: "In Review" },
      { value: "ESCALATED" as const, label: "Escalated" },
    ],
    []
  );

  const riskOptions = useMemo(
    () => [
      { value: "CRITICAL" as const, label: "Critical" },
      { value: "HIGH" as const, label: "High" },
      { value: "MEDIUM" as const, label: "Medium" },
      { value: "LOW" as const, label: "Low" },
    ],
    []
  );

  const priorityOptions = useMemo(
    () =>
      Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
        value: Number(value),
        label: config.label,
      })),
    []
  );

  return (
    <Space className="filters-space">
      <Space className="filters-left">
        <Select
          placeholder="Status"
          allowClear
          className="w-140"
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={statusOptions}
        />
        <Select
          placeholder="Priority"
          allowClear
          className="w-140"
          value={priorityFilter}
          onChange={onPriorityFilterChange}
          options={priorityOptions}
        />
        <Select
          placeholder="Risk Level"
          allowClear
          className="w-120"
          value={riskFilter}
          onChange={onRiskFilterChange}
          options={riskOptions}
        />
        <Button
          type={assignedToMe ? "primary" : "default"}
          onClick={onAssignedToMeToggle}
          icon={<UserOutlined />}
        >
          {assignedToMe ? "Assigned to me" : "All reviews"}
        </Button>
      </Space>

      <Space>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={isLoading}>
          Refresh
        </Button>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={onClaimNext}
          loading={isClaiming}
        >
          Claim Next
        </Button>
      </Space>
    </Space>
  );
};
