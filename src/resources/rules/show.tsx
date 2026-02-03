/**
 * Rules Show
 *
 * Displays rule details including condition tree, AST preview,
 * and human-readable summary. Accessible to both makers and checkers.
 */

import { useState, useEffect, useCallback, useMemo, type FC, type ReactElement } from "react";
import { Show } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import { Alert, Button, Card, Space, Tag, Typography } from "antd";
import { Descriptions, Table } from "../../shared/compat/antdCompat";
import { useLocation, useParams } from "react-router";
import type { Rule, RuleVersion, RuleWithVersion } from "../../types/domain";
import type {
  RuleDetailResponse,
  RuleSummaryResponse,
  RuleSimulateResponse,
} from "../../api/types";
import { get } from "../../api/httpClient";
import { RULES, RULE_VERSIONS } from "../../api/endpoints";
import { getDecisionColor, getRuleTypeColor, getStatusColor } from "../../theme/tokens";
import { extractRuleDetail } from "../../shared/utils/ruleHelpers";
import { AstPreview } from "./components/AstPreview";
import { HumanSummary } from "./components/HumanSummary";
import { SimulationModal } from "./components/SimulationModal";
import "./rules.css";

type RuleDetailLike = RuleDetailResponse | (Rule & { version_details?: RuleVersion });

const { Text } = Typography;

function renderScope(scope: RuleVersion["scope"]): ReactElement {
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
}

function VersionDetailsCard({
  title,
  version,
  rule,
}: Readonly<{ title: string; version: RuleVersion | null; rule: Rule | null }>): ReactElement {
  return (
    <Card title={title} size="small" variant="outlined">
      {version == null ? (
        <Typography.Text type="secondary">No version details available.</Typography.Text>
      ) : (
        <Space direction="vertical" className="full-width" size="middle">
          {rule != null && (
            <HumanSummary rule={{ ...rule, version_details: version } as RuleWithVersion} />
          )}
          <Descriptions size="small" column={2} variant="outlined">
            <Descriptions.Item label="Version">
              <Tag color="blue">v{version.version}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(version.status)}>{version.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag>{version.priority}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Version ID">
              <Typography.Text code>{version.rule_version_id}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Created By">{version.created_by ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Created At">{version.created_at ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Approved By">{version.approved_by ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Approved At">{version.approved_at ?? "-"}</Descriptions.Item>
          </Descriptions>
          <div>
            <Text strong>Scope</Text>
            <div className="mt-8">{renderScope(version.scope ?? null)}</div>
          </div>
          <AstPreview ast={version.condition_tree ?? null} title="Condition Tree" maxHeight={500} />
        </Space>
      )}
    </Card>
  );
}

function RuleSummaryCard({
  summary,
  loading,
}: Readonly<{ summary: RuleSummaryResponse | null; loading: boolean }>): ReactElement {
  return (
    <Card title="Analyst Summary" size="small" variant="outlined" loading={loading}>
      {summary == null ? (
        <Typography.Text type="secondary">Summary not available yet.</Typography.Text>
      ) : (
        <Descriptions size="small" column={2} variant="outlined">
          <Descriptions.Item label="Rule Name">{summary.rule_name}</Descriptions.Item>
          <Descriptions.Item label="Rule Type">
            <Tag color={getRuleTypeColor(summary.rule_type)}>{summary.rule_type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(summary.status)}>{summary.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Latest Version">
            {summary.latest_version == null ? (
              <Typography.Text type="secondary">-</Typography.Text>
            ) : (
              <Tag color="blue">v{summary.latest_version}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            {summary.priority == null ? (
              <Typography.Text type="secondary">-</Typography.Text>
            ) : (
              <Tag>{summary.priority}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Action">
            {summary.action == null ? (
              <Typography.Text type="secondary">-</Typography.Text>
            ) : (
              <Tag color={getDecisionColor(summary.action)}>{summary.action}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Latest Version ID" span={2}>
            {summary.latest_version_id == null ? (
              <Typography.Text type="secondary">-</Typography.Text>
            ) : (
              <Typography.Text code>{summary.latest_version_id}</Typography.Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
}

function VersionsCard({
  versions,
  selectedVersionId,
}: Readonly<{ versions: RuleVersion[]; selectedVersionId: string | null }>): ReactElement {
  if (versions.length === 0) return <></>;
  return (
    <Card title="Versions" size="small" variant="outlined">
      <Table
        dataSource={versions}
        size="small"
        variant="outlined"
        rowKey={(v) => v?.rule_version_id ?? ""}
        pagination={false}
        scroll={{ x: true }}
      >
        <Table.Column<RuleVersion>
          dataIndex="version"
          title="Version"
          render={(version: number, record) => (
            <Tag color={record.rule_version_id === selectedVersionId ? "blue" : "default"}>
              v{version}
            </Tag>
          )}
        />
        <Table.Column<RuleVersion>
          dataIndex="status"
          title="Status"
          render={(v: string) => <Tag color={getStatusColor(v)}>{v}</Tag>}
        />
        <Table.Column<RuleVersion> dataIndex="priority" title="Priority" />
        <Table.Column<RuleVersion> dataIndex="created_by" title="Created By" />
        <Table.Column<RuleVersion> dataIndex="created_at" title="Created At" />
      </Table>
    </Card>
  );
}

/* eslint-disable-next-line max-lines-per-function, complexity */
export const RuleShow: FC = () => {
  const params = useParams();
  const ruleId = params.id;
  const { open } = useNotification();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const versionIdParam = searchParams.get("versionId") ?? searchParams.get("version_id");
  const versionParam = searchParams.get("version");
  const versionNumber = versionParam == null ? null : Number(versionParam);

  const [loading, setLoading] = useState(true);
  const [rule, setRule] = useState<Rule | null>(null);
  const [currentVersion, setCurrentVersion] = useState<RuleVersion | null>(null);
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<RuleVersion | null>(null);
  const [summary, setSummary] = useState<RuleSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<RuleSimulateResponse | null>(null);
  const [selectedVersionLoading, setSelectedVersionLoading] = useState(false);

  const fetchRuleDetail = useCallback(async () => {
    if (ruleId == null || ruleId === "") return;
    setLoading(true);
    try {
      const data = await get<RuleDetailLike>(RULES.GET(ruleId));
      const extracted = extractRuleDetail(data);
      setRule(extracted.rule);
      setCurrentVersion(extracted.currentVersion);
      setVersions(extracted.versions);
    } catch (error) {
      open?.({
        type: "error",
        message: "Failed to load rule",
        description: (error as { message?: string }).message,
      });
    } finally {
      setLoading(false);
    }
  }, [ruleId, open]);

  const fetchRuleSummary = useCallback(async () => {
    if (ruleId == null || ruleId === "") return;
    setSummaryLoading(true);
    try {
      const data = await get<RuleSummaryResponse>(RULES.SUMMARY(ruleId));
      setSummary(data);
    } catch (error) {
      setSummary(null);
      open?.({
        type: "error",
        message: "Unable to load summary",
        description: (error as { message?: string }).message,
      });
    } finally {
      setSummaryLoading(false);
    }
  }, [ruleId, open]);

  const fetchVersionDetail = useCallback(
    async (ruleVersionId: string) => {
      setSelectedVersionLoading(true);
      try {
        const data = await get<RuleVersion>(RULE_VERSIONS.DETAIL(ruleVersionId));
        setSelectedVersion(data);
      } catch (error) {
        open?.({
          type: "error",
          message: "Unable to load requested version",
          description: (error as { message?: string }).message,
        });
        setSelectedVersion(currentVersion);
      } finally {
        setSelectedVersionLoading(false);
      }
    },
    [open, currentVersion]
  );

  useEffect(() => {
    void fetchRuleDetail();
    void fetchRuleSummary();
    return () => undefined;
  }, [fetchRuleDetail, fetchRuleSummary]);

  useEffect(() => {
    if (versionIdParam != null) {
      const matched = versions.find((v) => v.rule_version_id === versionIdParam);
      if (matched != null) {
        setSelectedVersion(matched);
        return;
      }
      void fetchVersionDetail(versionIdParam);
      return;
    }

    if (versionNumber != null && !Number.isNaN(versionNumber)) {
      const matched = versions.find((v) => v.version === versionNumber);
      if (matched != null) {
        setSelectedVersion(matched);
        return;
      }
    }

    setSelectedVersion(currentVersion);
  }, [versionIdParam, versionNumber, versions, currentVersion, fetchVersionDetail]);

  return (
    <Show isLoading={loading} contentProps={{ variant: "outlined", size: "small" }}>
      <Space direction="vertical" className="full-width" size="middle">
        <Descriptions size="small" column={1} variant="outlined">
          <Descriptions.Item label="Rule Name">{rule?.rule_name ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Rule Type">
            {rule?.rule_type == null ? (
              "-"
            ) : (
              <Tag color={getRuleTypeColor(rule.rule_type)}>{rule.rule_type}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {rule?.status == null ? (
              "-"
            ) : (
              <Tag color={getStatusColor(rule.status)}>{rule.status}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Current Version">
            {rule?.current_version ?? "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">{rule?.created_by ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Created At">{rule?.created_at ?? "-"}</Descriptions.Item>
        </Descriptions>

        <RuleSummaryCard summary={summary} loading={summaryLoading} />

        <VersionDetailsCard
          title={
            versionIdParam != null || (versionNumber != null && !Number.isNaN(versionNumber))
              ? "Selected Version"
              : "Current Version"
          }
          version={selectedVersion}
          rule={rule}
        />

        {selectedVersionLoading && (
          <Alert type="info" message="Loading selected rule version..." showIcon />
        )}

        <Card title="Simulation" size="small" variant="outlined">
          <Space direction="vertical" className="full-width">
            <Text type="secondary">
              Simulate this rule against historical transactions to validate coverage.
            </Text>
            <Button
              type="primary"
              onClick={() => setSimulationOpen(true)}
              disabled={rule == null || selectedVersion == null}
            >
              Run Simulation
            </Button>
            {simulationResult != null && (
              <Descriptions size="small" column={2} variant="outlined">
                <Descriptions.Item label="Match Count">
                  {simulationResult.match_count}
                </Descriptions.Item>
                <Descriptions.Item label="Simulation ID">
                  {simulationResult.simulation_id ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Sample Transactions" span={2}>
                  {simulationResult.sample_transactions != null &&
                  simulationResult.sample_transactions.length > 0 ? (
                    <Space wrap>
                      {simulationResult.sample_transactions.map((id) => (
                        <Tag key={id}>{id}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <Typography.Text type="secondary">-</Typography.Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Space>
        </Card>

        <VersionsCard
          versions={versions}
          selectedVersionId={selectedVersion?.rule_version_id ?? null}
        />
      </Space>

      <SimulationModal
        open={simulationOpen}
        onCancel={() => setSimulationOpen(false)}
        rule={rule}
        selectedVersion={selectedVersion}
        onSimulationComplete={setSimulationResult}
      />
    </Show>
  );
};

export default RuleShow;
