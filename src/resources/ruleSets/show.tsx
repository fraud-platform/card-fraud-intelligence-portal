/**
 * RuleSets Show
 *
 * Displays rule set details including associated rules.
 * Accessible to both makers and checkers.
 */

import { useState, useEffect, type FC, type ReactNode } from "react";
import { Show } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import { Card, Tag } from "antd";
import { Descriptions, Table } from "../../shared/compat/antdCompat";
import { useParams } from "react-router";
import type { RuleSet, RuleSetWithRules, RuleVersion } from "../../types/domain";
import type { RuleSetDetailResponse } from "../../api/types";
import { get } from "../../api/httpClient";
import { RULESETS } from "../../api/endpoints";
import { getRuleTypeColor, getStatusColor } from "../../theme/tokens";
import { extractRuleSetDetail } from "../../shared/utils/ruleHelpers";
import "./rule-sets.css";

type RuleSetDetailLike = RuleSetDetailResponse | RuleSetWithRules;

export const RuleSetShow: FC = () => {
  const params = useParams();
  const rulesetId = params.id;
  const { open } = useNotification();

  const [loading, setLoading] = useState(true);
  const [ruleset, setRuleset] = useState<RuleSet | null>(null);
  const [rules, setRules] = useState<RuleVersion[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      if (rulesetId == null || rulesetId === "") return;

      try {
        const response = await get<RuleSetDetailLike>(RULESETS.GET(rulesetId));
        if (cancelled) return;

        const { ruleset: rs, rules: r } = extractRuleSetDetail(response);
        setRuleset(rs);
        setRules(r);
      } catch (error) {
        if (cancelled) return;
        open?.({
          type: "error",
          message: "Failed to load rule set",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [rulesetId, open]);

  if (loading) {
    return <Show isLoading contentProps={{ variant: "outlined", size: "small" }} />;
  }

  if (ruleset === null) {
    return (
      <Show title="Rule Set not found" contentProps={{ variant: "outlined", size: "small" }} />
    );
  }

  return (
    <Show
      title={`Rule Set: ${ruleset.ruleset_id}`}
      contentProps={{ variant: "outlined", size: "small" }}
    >
      <Card title="Details" size="small" variant="outlined">
        <Descriptions column={2} size="small" variant="outlined">
          <Descriptions.Item label="RuleSet ID">{ruleset.ruleset_id}</Descriptions.Item>
          <Descriptions.Item label="Name">
            {ruleset.name ?? <span className="muted-999">No name</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {ruleset.description ?? <span className="muted-999">No description</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Rule Type">
            <Tag color={getRuleTypeColor(ruleset.rule_type)}>{ruleset.rule_type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Version">{ruleset.version}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(ruleset.status)}>{ruleset.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created By">{ruleset.created_by}</Descriptions.Item>
          {ruleset.approved_by != null && (
            <Descriptions.Item label="Approved By">{ruleset.approved_by}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Rules" size="small" className="card-spaced" variant="outlined">
        <Table
          dataSource={rules}
          size="small"
          variant="outlined"
          rowKey="rule_version_id"
          pagination={false}
          scroll={{ x: true }}
        >
          <Table.Column<RuleVersion> dataIndex="rule_name" title="Rule Name" />
          <Table.Column<RuleVersion> dataIndex="version" title="Version" />
          <Table.Column<RuleVersion>
            dataIndex="status"
            title="Status"
            render={(v): ReactNode => <Tag color={getStatusColor(String(v))}>{String(v)}</Tag>}
          />
          <Table.Column<RuleVersion> dataIndex="created_at" title="Created At" />
        </Table>
      </Card>
    </Show>
  );
};

export default RuleSetShow;
