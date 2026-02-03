/**
 * Field Registry Status Widget Component
 *
 * Displays the current field registry version and status.
 * Shows registry version number, field count, and publication timestamp.
 * Intended for use on dashboards and overview screens.
 */

import React, { useEffect, useState, type FC } from "react";
import {
  Card,
  Descriptions,
  Space,
  Tag,
  Typography,
  Statistic,
  Row,
  Col,
  type CardProps,
} from "antd";
import "./status-widget.css";
import {
  CloudServerOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { FieldRegistryManifest } from "../../types/fieldDefinitions";
import { fieldDefinitionsApi } from "../../api/fieldDefinitions";

const { Text } = Typography;

export interface FieldRegistryStatusWidgetProps {
  /** Whether to show detailed information */
  detailed?: boolean;
  /** Custom card size */
  size?: CardProps["size"];
}

/* eslint-disable complexity, @typescript-eslint/strict-boolean-expressions */
/* TODO: Refactor `FieldRegistryStatusWidget` to reduce complexity and remove this eslint disable */
export const FieldRegistryStatusWidget: FC<FieldRegistryStatusWidgetProps> = ({
  detailed = false,
  size = "small",
}) => {
  const [registry, setRegistry] = useState<FieldRegistryManifest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistry = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await fieldDefinitionsApi.getRegistry();
      setRegistry(data);
    } catch (error) {
      console.error("Failed to fetch field registry:", error);
      setRegistry(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRegistry();
  }, []);

  if (isLoading) {
    return (
      <Card size={size} loading={isLoading}>
        <Space>
          <SyncOutlined spin />
          <Text type="secondary">Loading field registry status...</Text>
        </Space>
      </Card>
    );
  }

  const isPublished = registry !== null;

  // Avoid nested ternary expressions by computing content ahead of render
  let bodyContent: React.ReactNode;

  if (isPublished) {
    if (detailed) {
      bodyContent = (
        <Descriptions size="small" column={2} bordered>
          <Descriptions.Item label="Version">
            <Tag color="blue">v{registry?.registry_version ?? "-"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Field Count">{registry?.field_count ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Checksum" span={2}>
            <Text code copyable className="code-small">
              {registry?.checksum ?? "-"}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Artifact URI" span={2}>
            <Text code ellipsis className="code-small">
              {registry?.artifact_uri ?? "-"}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Created By">{registry?.created_by ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Created At">
            {registry?.created_at ? new Date(registry.created_at).toLocaleString() : "-"}
          </Descriptions.Item>
        </Descriptions>
      );
    } else {
      bodyContent = (
        <Row gutter={16}>
          <Col span={8}>
            <div className="stat-value-18">
              <Statistic title="Version" value={registry?.registry_version ?? "-"} prefix="v" />
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-value-18">
              <Statistic title="Fields" value={registry?.field_count ?? "-"} />
            </div>
          </Col>
          <Col span={8}>
            <div className="stat-value-14">
              <Statistic
                title="Published"
                value={
                  registry?.created_at ? new Date(registry.created_at).toLocaleDateString() : "-"
                }
              />
            </div>
          </Col>
        </Row>
      );
    }
  } else {
    bodyContent = (
      <Space direction="vertical" size="small">
        <Text type="secondary">
          No field registry has been published yet. Publish a registry to make approved field
          versions available for use in rules.
        </Text>
      </Space>
    );
  }

  return (
    <Card
      size={size}
      title={
        <Space>
          <CloudServerOutlined />
          <span>Field Registry</span>
        </Space>
      }
      extra={
        isPublished ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Published
          </Tag>
        ) : (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Not Published
          </Tag>
        )
      }
    >
      {bodyContent}
    </Card>
  );
};

export default FieldRegistryStatusWidget;
