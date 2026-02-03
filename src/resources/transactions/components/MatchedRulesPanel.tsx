/**
 * MatchedRulesPanel Component
 *
 * Collapsible panel showing matched rules with expandable details.
 */

import type { FC, ReactElement } from "react";
import { Button, Collapse, Descriptions, Divider, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useGo } from "@refinedev/core";
import { JsonViewer } from "../../../shared/components/JsonViewer";
import "./matched-rules-panel.css";
import type { MatchedRule } from "../../../types/transaction";
import { formatDateTime } from "../../../shared/utils/format";
import { getDecisionColor, getRuleTypeColor } from "../../../theme/tokens";

const { Panel } = Collapse;
const { Text } = Typography;

export interface MatchedRulesPanelProps {
  matchedRules: MatchedRule[];
}

/**
 * Expanded row component for rule details
 */
const ExpandedRuleDetails: FC<{ record: MatchedRule }> = ({ record }) => (
  <Collapse defaultActiveKey={["details"]}>
    <Panel header="Rule Details" key="details">
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Rule ID">
          <Typography.Text code>{record.rule_id}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Rule Version">
          <Typography.Text code>
            {record.rule_version == null ? "-" : `v${record.rule_version}`}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Rule Type">
          {record.rule_type == null ? (
            <Typography.Text type="secondary">-</Typography.Text>
          ) : (
            <Tag color={getRuleTypeColor(record.rule_type)}>{record.rule_type}</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Rule Action">
          {record.rule_action == null ? (
            <Typography.Text type="secondary">-</Typography.Text>
          ) : (
            <Tag color={getDecisionColor(record.rule_action)}>{record.rule_action}</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Matched At">
          {record.matched_at == null ? "-" : formatDateTime(record.matched_at)}
        </Descriptions.Item>
        <Descriptions.Item label="Version ID">
          {record.rule_version_id == null ? (
            <Typography.Text type="secondary">-</Typography.Text>
          ) : (
            <Typography.Text code>{record.rule_version_id}</Typography.Text>
          )}
        </Descriptions.Item>
      </Descriptions>

      {(record.match_reason_text != null || record.match_reason != null) && (
        <>
          <Divider className="divider-compact" />
          <Typography.Text strong>Match Reason:</Typography.Text>
          <div>{record.match_reason_text ?? record.match_reason}</div>
        </>
      )}

      {record.conditions_met != null && record.conditions_met.length > 0 && (
        <>
          <Divider className="divider-compact" />
          <Typography.Text strong>Conditions Met:</Typography.Text>
          <ul className="conditions-list">
            {record.conditions_met.map((condition) => (
              <li key={condition}>
                <Typography.Text>{condition}</Typography.Text>
              </li>
            ))}
          </ul>
        </>
      )}

      {record.condition_values != null && (
        <>
          <Divider className="divider-compact" />
          <Typography.Text strong>Condition Values:</Typography.Text>
          <JsonViewer data={record.condition_values} />
        </>
      )}

      <Divider className="divider-compact" />
      <Typography.Text strong>Scope Configuration:</Typography.Text>
      <JsonViewer data={record.scope} />
    </Panel>
  </Collapse>
);

/**
 * Matched rules columns definition
 */
function getSummaryText(rule: MatchedRule): string | null {
  const conditions = rule.conditions_met?.filter((c) => c != null && c !== "");
  if (conditions != null && conditions.length > 0) {
    const preview = conditions.slice(0, 2).join(" | ");
    const more = conditions.length > 2 ? ` +${conditions.length - 2} more` : "";
    return `${preview}${more}`;
  }

  return rule.match_reason_text ?? rule.match_reason ?? null;
}

function useMatchedRulesColumns(
  onOpenRule: (ruleId: string, ruleVersionId?: string | null, ruleVersion?: number | null) => void
): ColumnsType<MatchedRule> {
  return [
    {
      title: "Rule Name",
      dataIndex: "rule_name",
      render: (name: MatchedRule["rule_name"], record: MatchedRule) => (
        <Space direction="vertical" size={0}>
          <Space size={6} wrap>
            <Text strong>{name ?? "Unnamed Rule"}</Text>
            {record.rule_type == null ? null : (
              <Tag color={getRuleTypeColor(record.rule_type)}>{record.rule_type}</Tag>
            )}
            {record.rule_action != null && (
              <Tag color={getDecisionColor(record.rule_action)}>{record.rule_action}</Tag>
            )}
          </Space>
          <Typography.Text type="secondary" className="muted-small">
            ID: {record.rule_id.slice(0, 8)}...{" "}
            {record.rule_version == null ? "" : `| v${record.rule_version}`}
          </Typography.Text>
          {getSummaryText(record) != null && (
            <Typography.Text type="secondary" className="muted-small">
              {getSummaryText(record)}
            </Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      width: 80,
      align: "center" as const,
      render: (p: number | null | undefined) =>
        p == null ? (
          <Typography.Text type="secondary">-</Typography.Text>
        ) : (
          <Typography.Text code>{p}</Typography.Text>
        ),
    },
    {
      title: "Scope",
      dataIndex: "scope",
      render: (scope: MatchedRule["scope"]) => {
        if (scope == null || Object.keys(scope).length === 0) {
          return <Typography.Text type="secondary">Country-only</Typography.Text>;
        }
        return (
          <Space wrap>
            {scope.network != null && <Tag>Network: {scope.network.join(", ")}</Tag>}
            {scope.bin != null && <Tag>BIN: {scope.bin.join(", ")}</Tag>}
            {scope.mcc != null && <Tag>MCC: {scope.mcc.join(", ")}</Tag>}
            {scope.logo != null && <Tag>Logo: {scope.logo.join(", ")}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() =>
            onOpenRule(record.rule_id, record.rule_version_id ?? null, record.rule_version ?? null)
          }
        >
          Open Rule
        </Button>
      ),
    },
  ];
}

/**
 * Render function for expanded row
 */
function renderExpandedRow(record: MatchedRule): ReactElement {
  return <ExpandedRuleDetails record={record} />;
}

/**
 * Matched rules panel component
 */
export const MatchedRulesPanel: FC<MatchedRulesPanelProps> = ({ matchedRules }) => {
  const go = useGo();
  const columns = useMatchedRulesColumns((ruleId, ruleVersionId, ruleVersion) => {
    let query = "";
    if (ruleVersionId != null) {
      query = `?versionId=${encodeURIComponent(ruleVersionId)}`;
    } else if (ruleVersion != null) {
      query = `?version=${encodeURIComponent(String(ruleVersion))}`;
    }
    go({ to: `/rules/show/${ruleId}${query}` });
  });

  if (matchedRules.length === 0) {
    return <Text type="secondary">No rule matches</Text>;
  }

  return (
    <Table
      dataSource={matchedRules}
      rowKey="rule_id"
      size="small"
      pagination={false}
      columns={columns}
      expandable={{
        expandedRowRender: renderExpandedRow,
      }}
    />
  );
};
