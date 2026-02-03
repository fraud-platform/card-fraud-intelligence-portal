import { Card, Space, Descriptions, Typography, Tag } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import { RiskLevelBadge } from "../../components/review";
import type { TransactionCase } from "../../types/case";
import type { ReactElement } from "react";
import { formatAmount, formatDateTime } from "./utils";
import "./case-header.css";

const { Title, Text, Paragraph } = Typography;

export default function CaseHeader({
  caseData,
  typeConfig,
  statusConfig,
}: Readonly<{
  caseData: TransactionCase;
  typeConfig?: { label: string; color: string };
  statusConfig?: { label: string; color: string };
}>): ReactElement {
  return (
    <Card size="small">
      <Space direction="vertical" size="middle" className="case-header-root">
        <Space className="case-header-row">
          <Space>
            <FolderOutlined className="case-header-icon" />
            <div>
              <Title level={4} className="case-header-title">
                {caseData.case_number}
              </Title>
              <Text type="secondary">{caseData.title}</Text>
            </div>
          </Space>
          <Space>
            <Tag color={typeConfig?.color}>{typeConfig?.label}</Tag>
            <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
            <RiskLevelBadge level={caseData.risk_level} />
          </Space>
        </Space>

        {caseData.description !== null && caseData.description !== undefined && (
          <Paragraph className="case-header-paragraph">{caseData.description}</Paragraph>
        )}
        <Descriptions size="small" column={4} bordered>
          <Descriptions.Item label="Transactions">
            {caseData.total_transaction_count}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            {formatAmount(caseData.total_transaction_amount)}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">
            {caseData.assigned_analyst_name ?? <Text type="secondary">Unassigned</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {formatDateTime(caseData.created_at)}
          </Descriptions.Item>
          {caseData.resolved_at !== null && caseData.resolved_at !== undefined && (
            <>
              <Descriptions.Item label="Resolved By">{caseData.resolved_by}</Descriptions.Item>
              <Descriptions.Item label="Resolved At">
                {formatDateTime(caseData.resolved_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Resolution" span={2}>
                {caseData.resolution_summary}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Space>
    </Card>
  );
}
