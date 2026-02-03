/**
 * WorklistStatsCards Component
 *
 * Statistics cards showing worklist metrics.
 */

import type { FC } from "react";
import { Card, Col, Row, Statistic } from "antd";
import { ClockCircleOutlined, UserOutlined, FundOutlined } from "@ant-design/icons";
import "./worklist-stats.css";
import type { WorklistStats } from "../../../types/worklist";

export interface WorklistStatsCardsProps {
  stats: WorklistStats | null;
}

/**
 * Worklist stats cards component
 */
export const WorklistStatsCards: FC<WorklistStatsCardsProps> = ({ stats }) => {
  if (stats === null) return null;

  return (
    <Row gutter={16} className="stats-row">
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="Unassigned"
            value={stats.unassigned_total}
            prefix={<ClockCircleOutlined />}
            className="stat-blue"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="Assigned to me"
            value={stats.my_assigned_total}
            prefix={<UserOutlined />}
            className="stat-purple"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="Resolved Today"
            value={stats.resolved_today}
            prefix={<FundOutlined />}
            className="stat-green"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="Avg resolution (min)"
            value={stats.avg_resolution_minutes?.toFixed(1) ?? "N/A"}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
};
