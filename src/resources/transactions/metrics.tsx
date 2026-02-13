/**
 * Transaction Metrics Dashboard
 *
 * Summary statistics and charts for fraud analysts to monitor transaction patterns.
 */

import { useState, useEffect, type FC } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Typography, Spin, Alert, Progress } from "antd";
import {
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { get } from "../../api/httpClient";
import { TRANSACTIONS } from "../../api/endpoints";
import type { TransactionMetricsResponse } from "../../api/types";
import {
  getDecisionColor,
  getDecisionReasonColor,
  getEvaluationTypeColor,
} from "../../theme/tokens";
import { computeTotalCounts, buildDecisionReasonRows } from "./utils/metrics";
import "./metrics.css";

const { Title, Text } = Typography;

function normalizeApiBase(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

function resolveMetricsFallbackUrl(): string | null {
  const txApiEnv =
    (import.meta.env.VITE_API_URL_TRANSACTION_MGMT as string | undefined) ??
    (import.meta.env.VITE_TRANSACTION_API_URL as string | undefined);

  if (txApiEnv != null && txApiEnv !== "") {
    return `${normalizeApiBase(txApiEnv)}/metrics`;
  }

  if (globalThis.location.hostname === "localhost") {
    return "http://localhost:8002/api/v1/metrics";
  }

  return null;
}

function shouldRetryMetricsWithFallback(error: unknown): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { status?: number; message?: string };
  if (maybeError.status === 404) {
    return true;
  }

  return maybeError.message === "Network Error";
}

// Component is intentionally large; split into smaller parts if this grows further
// eslint-disable-next-line max-lines-per-function
export const TransactionMetrics: FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<TransactionMetricsResponse | null>(null);
  const metricsFallbackUrl = resolveMetricsFallbackUrl();

  useEffect(() => {
    const fetchMetrics = async (): Promise<void> => {
      let lastError: unknown;
      try {
        try {
          const response = await get<TransactionMetricsResponse>(TRANSACTIONS.METRICS);
          setMetrics(response);
          return;
        } catch (err) {
          lastError = err;
        }

        if (
          metricsFallbackUrl != null &&
          metricsFallbackUrl !== "" &&
          shouldRetryMetricsWithFallback(lastError)
        ) {
          try {
            const fallbackResponse = await get<TransactionMetricsResponse>(metricsFallbackUrl);
            setMetrics(fallbackResponse);
            setError(null);
            return;
          } catch (fallbackError) {
            lastError = fallbackError;
          }
        }

        const message = lastError instanceof Error ? lastError.message : "Failed to load metrics";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchMetrics();
  }, [metricsFallbackUrl]);

  if (loading) {
    return (
      <Card>
        <div className="metrics-loading">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error != null && error !== "") {
    return <Alert type="error" message="Error loading metrics" description={error} />;
  }

  if (metrics == null) {
    return <Alert type="warning" message="No metrics available" />;
  }

  // Compute totals and percentages using helper utilities
  const {
    total,
    approved: approvedCount,
    declined: declinedCount,
    MONITORING: MONITORINGCount,
    approvePercent,
    declinePercent,
    MONITORINGPercent,
  } = computeTotalCounts(metrics);

  return (
    <div>
      <Title level={4}>Transaction Metrics</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Transactions" value={total} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved"
              value={approvedCount}
              prefix={<CheckCircleOutlined />}
              className="stat-approve"
              suffix={
                <Text type="secondary" className="stat-suffix">
                  ({approvePercent.toFixed(1)}%)
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Declined"
              value={declinedCount}
              prefix={<WarningOutlined />}
              className="stat-decline"
              suffix={
                <Text type="secondary" className="stat-suffix">
                  ({declinePercent.toFixed(1)}%)
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Post-Auth"
              value={MONITORINGCount}
              prefix={<ClockCircleOutlined />}
              className="stat-MONITORING"
              suffix={
                <Text type="secondary" className="stat-suffix">
                  ({MONITORINGPercent.toFixed(1)}%)
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="metrics-row">
        <Col xs={24} md={12}>
          <Card title="Decision Distribution" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <div className="progress-center">
                  <Progress
                    type="circle"
                    percent={approvePercent}
                    size={80}
                    strokeColor={getDecisionColor("APPROVE")}
                  />
                  <div className="progress-caption">
                    <Text strong>Approved</Text>
                    <br />
                    <Text type="secondary">{approvedCount.toLocaleString()}</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="progress-center">
                  <Progress
                    type="circle"
                    percent={declinePercent}
                    size={80}
                    strokeColor={getDecisionColor("DECLINE")}
                  />
                  <div className="progress-caption">
                    <Text strong>Declined</Text>
                    <br />
                    <Text type="secondary">{declinedCount.toLocaleString()}</Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div className="progress-center">
                  <Progress
                    type="circle"
                    percent={MONITORINGPercent}
                    size={80}
                    strokeColor={getEvaluationTypeColor("MONITORING")}
                  />
                  <div className="progress-caption">
                    <Text strong>Post-Auth</Text>
                    <br />
                    <Text type="secondary">{MONITORINGCount.toLocaleString()}</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Decision Reasons" size="small">
            <Table
              dataSource={buildDecisionReasonRows(metrics)}
              rowKey="reason"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "Reason",
                  dataIndex: "reason",
                  render: (reason: string) => (
                    <Tag color={getDecisionReasonColor(reason)} className="reason-tag">
                      {reason}
                    </Tag>
                  ),
                },
                {
                  title: "Count",
                  dataIndex: "count",
                  align: "right",
                },
                {
                  title: "Percentage",
                  dataIndex: "percent",
                  align: "right",
                  render: (percent: number) => `${percent.toFixed(2)}%`,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top Matched Rules" size="small" className="card-spaced">
        <Table
          dataSource={metrics.top_matched_rules ?? []}
          rowKey="rule_id"
          size="small"
          pagination={false}
          columns={[
            {
              title: "Rule Name",
              dataIndex: "rule_name",
            },
            {
              title: "Rule ID",
              dataIndex: "rule_id",
              render: (id: string) => (
                <Text code className="small-code">
                  {id.slice(0, 8)}...
                </Text>
              ),
            },
            {
              title: "Match Count",
              dataIndex: "match_count",
              align: "right",
              sorter: (a: { match_count: number }, b: { match_count: number }) =>
                b.match_count - a.match_count,
            },
          ]}
        />
      </Card>

      <Card title="Transactions Over Time" size="small" className="card-spaced">
        <Table
          dataSource={metrics.transactions_over_time ?? []}
          rowKey="date"
          size="small"
          pagination={false}
          columns={[
            {
              title: "Date",
              dataIndex: "date",
            },
            {
              title: "Total",
              dataIndex: "total",
              align: "right",
            },
            {
              title: "Approved",
              dataIndex: "approve",
              align: "right",
            },
            {
              title: "Declined",
              dataIndex: "decline",
              align: "right",
            },
            {
              title: "Post-Auth",
              dataIndex: "MONITORING",
              align: "right",
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default TransactionMetrics;
