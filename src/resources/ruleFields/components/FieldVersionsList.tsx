/**
 * Field Versions List Component
 *
 * Displays all versions of a field definition with status badges and actions.
 * Shows version history in a table format with filters for different statuses.
 */

import React, { useEffect, useState, type FC } from "react";
import { useGo } from "@refinedev/core";
import { Button, Card, Space, Table, Tag, Typography } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import {
  FieldVersionStatus,
  FIELD_VERSION_STATUS_BADGES,
  canEditFieldVersion,
  type FieldVersion,
} from "../../../types/fieldDefinitions";
import { fieldDefinitionsApi } from "../../../api/fieldDefinitions";

const { Text } = Typography;

interface FieldVersionsListProps {
  fieldKey: string;
}

export const FieldVersionsList: FC<FieldVersionsListProps> = ({ fieldKey }) => {
  const [versions, setVersions] = useState<FieldVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const go = useGo();

  useEffect(() => {
    const fetchVersions = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const data = await fieldDefinitionsApi.getVersions(fieldKey);
        setVersions(data);
      } catch (error) {
        console.error("Failed to fetch field versions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchVersions();
  }, [fieldKey]);

  const handleEdit = (versionId: string): void => {
    go({
      to: { resource: "rule-fields", action: "edit", id: versionId },
    });
  };

  const handleView = (versionId: string): void => {
    go({
      to: { resource: "rule-field-versions", action: "show", id: versionId },
    });
  };

  const getStatusTag = (status: FieldVersionStatus): React.ReactNode => {
    const badge = FIELD_VERSION_STATUS_BADGES[status];
    return <Tag color={badge.color}>{badge.label}</Tag>;
  };

  const columns = [
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
      width: 70,
      render: (v: number) => <Tag>v{v}</Tag>,
    },
    {
      title: "Field ID",
      dataIndex: "field_id",
      key: "field_id",
      width: 70,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: "Display Name",
      dataIndex: "display_name",
      key: "display_name",
      ellipsis: true,
    },
    {
      title: "Data Type",
      dataIndex: "data_type",
      key: "data_type",
      width: 100,
      render: (v: string) => <Tag color="cyan">{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: FieldVersionStatus) => getStatusTag(status),
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      width: 120,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: FieldVersion) => (
        <Space size="small">
          {canEditFieldVersion(record.status) && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.rule_field_version_id)}
            >
              Edit
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.rule_field_version_id)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card size="small" title="Version History">
      <Table
        columns={columns}
        dataSource={versions}
        rowKey="rule_field_version_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        size="small"
        scroll={{ x: 800 }}
      />
    </Card>
  );
};

export default FieldVersionsList;
