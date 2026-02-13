/**
 * Analyst Home
 *
 * Landing page for fraud analysts with worklist summary, quick actions,
 * and saved views.
 */

import { useMemo, type FC } from "react";
import { useNavigate } from "react-router";
import { Card, Col, List, Row, Space, Typography, Button, Tag, Empty } from "antd";
import { ThunderboltOutlined, FilterOutlined, BarChartOutlined } from "@ant-design/icons";
import type { RiskLevel, TransactionStatus } from "../../types/review";
import { useWorklistStats } from "../../hooks";
import { PRIORITY_CONFIG, RISK_LEVEL_CONFIG } from "../../types/worklist";
import "./analyst-home.css";

const { Title, Text } = Typography;

type SavedView = {
  key: string;
  label: string;
  description: string;
  filters: {
    status?: TransactionStatus;
    risk?: RiskLevel;
    priority?: number;
    assignedOnly?: boolean;
  };
};

const SAVED_VIEWS: SavedView[] = [
  {
    key: "my-queue",
    label: "Assigned to me",
    description: "Assigned to me, ready to review.",
    filters: { assignedOnly: true },
  },
  {
    key: "critical",
    label: "Critical Priority",
    description: "P1, highest risk reviews first.",
    filters: { priority: 1, risk: "CRITICAL" },
  },
  {
    key: "high-risk",
    label: "High Risk",
    description: "High risk across all priorities.",
    filters: { risk: "HIGH" },
  },
  {
    key: "escalated",
    label: "Escalations",
    description: "Escalated reviews waiting on action.",
    filters: { status: "ESCALATED" },
  },
];

const buildWorklistQuery = (filters: SavedView["filters"]): string => {
  const params = new URLSearchParams();
  if (filters.status != null) params.set("status", filters.status);
  if (filters.risk != null) params.set("risk_level_filter", filters.risk);
  if (filters.priority != null) params.set("priority_filter", String(filters.priority));
  if (filters.assignedOnly === true) params.set("assigned_only", "true");
  const query = params.toString();
  return query.length > 0 ? `?${query}` : "";
};

export const AnalystHome: FC = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useWorklistStats(true, 60000);

  const prioritySummary = useMemo(
    () =>
      Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
        label: config.label,
        value: Number(value),
        color: config.color,
        count: stats?.unassigned_by_priority?.[value] ?? 0,
      })),
    [stats?.unassigned_by_priority]
  );

  const riskSummary = useMemo(
    () =>
      Object.entries(RISK_LEVEL_CONFIG).map(([level, config]) => ({
        level: level as RiskLevel,
        label: config.label,
        color: config.color,
        count: stats?.unassigned_by_risk?.[level as RiskLevel] ?? 0,
      })),
    [stats?.unassigned_by_risk]
  );

  const handleOpenView = (filters: SavedView["filters"]): void => {
    void navigate(`/worklist${buildWorklistQuery(filters)}`);
  };

  return (
    <Space direction="vertical" size="large" className="analyst-home-root">
      <Space direction="vertical" size={4} className="stats-vertical">
        <Title level={3} className="title-no-margin">
          Analyst Home
        </Title>
        <Text type="secondary">
          Prioritize reviews, monitor queues, and jump into critical work fast.
        </Text>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card size="small" title="Queue Overview" loading={isLoading}>
            <Space direction="vertical" size={8} className="stats-vertical">
              <div className="stats-row">
                <Text>Unassigned</Text>
                <Text strong>{stats?.unassigned_total ?? 0}</Text>
              </div>
              <div className="stats-row">
                <Text>Assigned to me</Text>
                <Text strong>{stats?.my_assigned_total ?? 0}</Text>
              </div>
              <div className="stats-row">
                <Text>Resolved today</Text>
                <Text strong>{stats?.resolved_today ?? 0}</Text>
              </div>
              <div className="stats-row">
                <Text>Avg resolution</Text>
                <Text strong>{stats?.avg_resolution_minutes ?? 0}m</Text>
              </div>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => {
                  void navigate("/worklist");
                }}
                block
              >
                Go to Worklist
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card size="small" title="Priority Backlog" loading={isLoading}>
            <List
              dataSource={prioritySummary}
              renderItem={(item) => (
                <List.Item>
                  <div className="stats-row">
                    <Tag color={item.color} className="tag-no-margin">
                      {item.label}
                    </Tag>
                    <Text strong>{item.count}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card size="small" title="Risk Distribution" loading={isLoading}>
            <List
              dataSource={riskSummary}
              renderItem={(item) => (
                <List.Item>
                  <div className="stats-row">
                    <Tag color={item.color} className="tag-no-margin">
                      {item.label}
                    </Tag>
                    <Text strong>{item.count}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Saved Views" extra={<FilterOutlined />}>
        <List
          dataSource={SAVED_VIEWS}
          locale={{
            emptyText: (
              <Empty description="No saved views yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
          }}
          renderItem={(view) => (
            <List.Item
              actions={[
                <Button
                  key="open"
                  type="link"
                  onClick={() => {
                    handleOpenView(view.filters);
                  }}
                >
                  Open
                </Button>,
              ]}
            >
              <List.Item.Meta title={view.label} description={view.description} />
            </List.Item>
          )}
        />
      </Card>

      <Card size="small">
        <Space direction="vertical" size={4}>
          <Text strong>Metrics</Text>
          <Text type="secondary">
            Monitor overall trends and decision breakdowns in the metrics view.
          </Text>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => {
              void navigate("/transaction-metrics");
            }}
          >
            Open Metrics
          </Button>
        </Space>
      </Card>
    </Space>
  );
};

export default AnalystHome;
