/**
 * Rule Fields Show
 *
 * Detail view for a rule field with tabs for Overview, Version History, and Activity.
 * Shows field metadata, current version status, and approval actions.
 */

import { useState, useEffect, type FC } from "react";
import { Show } from "@refinedev/antd";
import { useCan, useNotification } from "@refinedev/core";
import { Alert, Badge, Card, Descriptions, Space, Tabs, Tag, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useParams } from "react-router";
import type { RuleField } from "../../types/domain";
import { DataType, Operator } from "../../types/enums";
import { labelForEnumValue } from "../../shared/utils/format";
import { FieldVersionsList } from "./components/FieldVersionsList";
import { SubmitApprovalButton } from "./components/SubmitApprovalButton";
import "./rule-field-show.css";

const { Title, Text } = Typography;

/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/strict-boolean-expressions, max-lines-per-function, complexity */
/* TODO: Refactor `RuleFieldShow` into smaller components to reduce complexity and length */
export const RuleFieldShow: FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [record, setRecord] = useState<RuleField | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams<{ id: string }>();
  const { open } = useNotification();

  const { data: canEditData } = useCan({
    resource: "rule-fields",
    action: "edit",
    params: { record },
  });

  useEffect(() => {
    const fetchField = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/v1/rule-fields/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch field");
        }
        const data = (await response.json()) as RuleField;
        setRecord(data);
      } catch {
        open?.({
          type: "error",
          message: "Failed to load field",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchField();
  }, [id, open]);

  // Get current version info from record if available
  const currentStatus = record?.current_status;
  const currentVersion = record?.current_version;
  const currentVersionId = record?.current_version_id;

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig: Record<string, { color: string; label: string }> = {
      DRAFT: { color: "default", label: "Draft" },
      PENDING_APPROVAL: { color: "warning", label: "Pending Approval" },
      APPROVED: { color: "success", label: "Approved" },
      REJECTED: { color: "error", label: "Rejected" },
      SUPERSEDED: { color: "info", label: "Superseded" },
    };

    const config = statusConfig[status] ?? { color: "default", label: status };
    return <Badge color={config.color} text={config.label} />;
  };

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <Space direction="vertical" size="middle" className="full-width">
          {/* Current Status Card */}
          {currentStatus && (
            <Card title="Current Status" size="small" extra={getStatusBadge(currentStatus)}>
              <Descriptions size="small" column={3}>
                <Descriptions.Item label="Version">
                  <Tag>{currentVersion ?? "-"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {getStatusBadge(currentStatus)}
                </Descriptions.Item>
                <Descriptions.Item label="Actions">
                  {currentStatus === "DRAFT" && currentVersionId && canEditData?.can && (
                    <SubmitApprovalButton
                      versionId={currentVersionId}
                      fieldKey={record?.field_key}
                    />
                  )}
                  {currentStatus === "PENDING_APPROVAL" && (
                    <Text type="secondary">Awaiting checker approval</Text>
                  )}
                  {currentStatus === "APPROVED" && (
                    <Space>
                      <CheckCircleOutlined className="status-live-icon" />
                      <Text type="success">Live in registry</Text>
                    </Space>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Field Details */}
          <Card title="Field Details" size="small">
            <Descriptions size="small" column={2} bordered>
              <Descriptions.Item label="Field ID">
                <Tag color="blue">{record?.field_id ?? "-"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Field Key">
                <Tag color="blue">{record?.field_key}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Display Name" span={2}>
                {record?.display_name}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {record?.description ?? <Text type="secondary">No description</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Data Type">
                <Tag color="cyan">{labelForEnumValue(record?.data_type as DataType)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Version">
                <Tag>v{record?.current_version ?? record?.version ?? 1}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Allowed Operators" span={2}>
                <Space wrap size={4}>
                  {(record?.allowed_operators as Operator[])?.map((op) => (
                    <Tag key={op}>{op}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Multi-value Allowed">
                {record?.multi_value_allowed ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Sensitive">
                {record?.is_sensitive ? <Tag color="orange">Yes</Tag> : <Tag>No</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Active">
                {record?.is_active ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">{record?.created_by ?? "-"}</Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>
                {record?.created_at ? new Date(record.created_at).toLocaleString() : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At" span={2}>
                {record?.updated_at ? new Date(record.updated_at).toLocaleString() : "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      ),
    },
    {
      key: "versions",
      label: "Version History",
      children: record?.field_key ? (
        <FieldVersionsList fieldKey={record.field_key} />
      ) : (
        <Alert message="Field key not available" type="error" />
      ),
    },
    {
      key: "activity",
      label: "Activity",
      children: (
        <Card size="small">
          <Alert
            message="Activity Log Coming Soon"
            description="Audit log for field changes will be displayed here."
            type="info"
            showIcon
          />
        </Card>
      ),
    },
  ];

  return (
    <Show isLoading={isLoading} contentProps={{ variant: "outlined", size: "small" }}>
      <Space direction="vertical" size="middle" className="full-width">
        <Title level={4} className="title-no-margin">
          {record?.display_name ?? "Field Details"}
        </Title>
        <Text type="secondary">{record?.field_key}</Text>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Space>
    </Show>
  );
};

export default RuleFieldShow;
