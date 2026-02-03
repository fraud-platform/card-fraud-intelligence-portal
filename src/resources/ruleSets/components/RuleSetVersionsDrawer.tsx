/**
 * RuleSet Versions Drawer Component
 *
 * Displays all versions of a ruleset in a drawer when the version toggle button is clicked.
 */

import { useState, type FC } from "react";
import { Button, Drawer, Table, Tag, Empty } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { RuleSetVersionResponse, RuleVersionInRulesetResponse } from "../../../api/types";
import { RuleSetStatus } from "../../../types/enums";
import { getStatusColor, compactTableProps, columnWidths } from "../../../theme/tokens";
import { useList } from "@refinedev/core";

interface RuleSetVersionsDrawerProps {
  rulesetId: string;
  rulesetName: string | null;
  currentVersion: number;
}

export const RuleSetVersionsDrawer: FC<RuleSetVersionsDrawerProps> = ({
  rulesetId,
  rulesetName,
  currentVersion,
}) => {
  const [open, setOpen] = useState(false);
  const { result: versions } = useList<RuleSetVersionResponse>({
    resource: "ruleset-versions",
    filters: [{ field: "ruleset_id", operator: "eq", value: rulesetId }],
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
      render: (v: string) => <Tag color={getStatusColor(v as RuleSetStatus)}>{v}</Tag>,
    },
    {
      title: "Rules",
      dataIndex: "rule_versions",
      width: 100,
      render: (ruleVersions: RuleVersionInRulesetResponse[]) => ruleVersions?.length ?? 0,
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
    {
      title: "Activated",
      dataIndex: "activated_at",
      width: columnWidths.date,
      render: (v: string | null) => v ?? "-",
    },
  ];

  return (
    <>
      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={() => setOpen(true)}
        aria-label={`View versions for ${rulesetName ?? rulesetId}`}
      >
        v{currentVersion}
      </Button>
      <Drawer
        title={`Versions: ${rulesetName ?? rulesetId}`}
        width={720}
        open={open}
        onClose={() => setOpen(false)}
      >
        {Array.isArray(versions?.data) && versions.data.length > 0 ? (
          <Table
            {...compactTableProps}
            dataSource={versions.data}
            columns={columns}
            rowKey="ruleset_version_id"
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

export default RuleSetVersionsDrawer;
