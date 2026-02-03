/**
 * Rule Versions Drawer Component
 *
 * Displays all versions of a rule in a drawer when the version toggle button is clicked.
 */

import { useState, type FC } from "react";
import { Button, Drawer, Table, Tag, Typography, Empty } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { RuleVersion } from "../../../types/domain";
import { RuleStatus } from "../../../types/enums";
import { getStatusColor, compactTableProps, columnWidths } from "../../../theme/tokens";
import { useList } from "@refinedev/core";

interface RuleVersionsDrawerProps {
  ruleId: string;
  ruleName: string;
  currentVersion: number;
}

export const RuleVersionsDrawer: FC<RuleVersionsDrawerProps> = ({
  ruleId,
  ruleName,
  currentVersion,
}) => {
  const [open, setOpen] = useState(false);
  const { result: versions } = useList<RuleVersion>({
    resource: "rule-versions",
    filters: [{ field: "rule_id", operator: "eq", value: ruleId }],
    queryOptions: { enabled: open },
  });

  const columns = [
    {
      title: "Version",
      dataIndex: "version",
      width: columnWidths.version,
      align: "center" as const,
      render: (v: number) => <Tag color={v === currentVersion ? "blue" : "default"}>v{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: columnWidths.status,
      render: (v: RuleStatus) => <Tag color={getStatusColor(v)}>{v}</Tag>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      width: 100,
    },
    {
      title: "Scope",
      dataIndex: "scope",
      width: 150,
      render: (scope: RuleVersion["scope"]) => {
        if (scope == null) return <Typography.Text type="secondary">Country</Typography.Text>;
        const parts: string[] = [];
        if (scope.network != null && scope.network.length > 0)
          parts.push(`Net: ${scope.network.length}`);
        if (scope.bin != null && scope.bin.length > 0) parts.push(`BIN: ${scope.bin.length}`);
        if (scope.mcc != null && scope.mcc.length > 0) parts.push(`MCC: ${scope.mcc.length}`);
        if (scope.logo != null && scope.logo.length > 0) parts.push(`Logo: ${scope.logo.length}`);
        return parts.length > 0 ? (
          <Typography.Text type="secondary">{parts.join(", ")}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">Custom</Typography.Text>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "created_at",
      width: columnWidths.date,
    },
    {
      title: "Approved By",
      dataIndex: "approved_by",
      width: columnWidths.user,
      render: (v: string | null) => v ?? "-",
    },
  ];

  return (
    <>
      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={() => setOpen(true)}
        aria-label={`View versions for ${ruleName}`}
      >
        v{currentVersion}
      </Button>
      <Drawer
        title={`Versions: ${ruleName}`}
        width={720}
        open={open}
        onClose={() => setOpen(false)}
      >
        {Array.isArray(versions?.data) && versions.data.length > 0 ? (
          <Table
            {...compactTableProps}
            dataSource={versions.data}
            columns={columns}
            rowKey="rule_version_id"
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description="No versions found" />
        )}
      </Drawer>
    </>
  );
};
