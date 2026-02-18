import type { FC, ReactNode } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Collapse,
  Descriptions,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { ExperimentOutlined, ReloadOutlined } from "@ant-design/icons";
import { useOpsAnalystInsights } from "../../../hooks/useOpsAnalystInsights";
import { useInvestigationRun } from "../../../hooks/useInvestigationRun";
import type { InsightDetail, OpsAgentSeverity, EvidenceItem } from "../../../types/opsAnalyst";

const { Text, Paragraph } = Typography;

const SEVERITY_COLOR: Record<OpsAgentSeverity, string> = {
  LOW: "green",
  MEDIUM: "orange",
  HIGH: "red",
  CRITICAL: "purple",
};

interface Props {
  transactionId: string;
}

// eslint-disable-next-line complexity -- Component intentionally handles multiple async UI states
export const OpsAnalystInsightPanel: FC<Props> = ({ transactionId }) => {
  const { insights, loading, error, reload } = useOpsAnalystInsights(transactionId);
  const { run, loading: running, error: runError, lastResult } = useInvestigationRun();

  const handleRunInvestigation = (): void => {
    run({ transaction_id: transactionId, mode: "quick" })
      .then(() => reload())
      .catch(console.error);
  };

  const latestInsight = insights[0] ?? lastResult?.insight ?? null;

  const renderEvidence = (evidence: EvidenceItem[] | undefined): ReactNode => {
    if (evidence == null || evidence.length === 0) {
      return null;
    }
    return (
      <Collapse
        size="small"
        items={evidence.map((ev) => ({
          key: ev.evidence_id,
          label: (
            <Text>
              Evidence: <strong>{ev.evidence_kind}</strong>
            </Text>
          ),
          children: (
            <Descriptions size="small" column={1}>
              {Object.entries(ev.evidence_payload).map(([k, v]) => (
                <Descriptions.Item key={k} label={k}>
                  {String(v)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ),
        }))}
      />
    );
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Space>
        <Button
          icon={<ExperimentOutlined />}
          onClick={handleRunInvestigation}
          loading={running}
          type="primary"
          ghost
        >
          Run Investigation
        </Button>
        <Button icon={<ReloadOutlined />} onClick={reload} loading={loading}>
          Refresh
        </Button>
      </Space>

      {error != null && error !== "" && <Alert type="error" message={error} showIcon />}
      {runError != null && runError !== "" && (
        <Alert type="warning" message={`Run failed: ${runError}`} showIcon />
      )}

      {loading && <Spin />}

      {latestInsight != null && (
        <Card
          size="small"
          title={
            <Space>
              <Badge color={SEVERITY_COLOR[latestInsight.severity]} text={latestInsight.severity} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {new Date(latestInsight.generated_at).toLocaleString()}
              </Text>
              {"model_mode" in latestInsight && latestInsight.model_mode != null && (
                <Tag color={latestInsight.model_mode === "hybrid" ? "blue" : "default"}>
                  {latestInsight.model_mode === "hybrid" ? "AI-assisted" : "Deterministic"}
                </Tag>
              )}
            </Space>
          }
        >
          <Paragraph>{latestInsight.summary}</Paragraph>

          {"evidence" in latestInsight
            ? renderEvidence((latestInsight as InsightDetail).evidence)
            : null}
        </Card>
      )}

      {!loading && latestInsight == null && (
        <Alert
          type="info"
          message="No insights yet"
          description="Click 'Run Investigation' to generate an AI-assisted fraud analysis for this transaction."
          showIcon
        />
      )}

      {insights.length > 1 && (
        <Collapse
          size="small"
          items={[
            {
              key: "history",
              label: `Previous insights (${insights.length - 1})`,
              children: insights.slice(1).map((ins) => (
                <Card key={ins.insight_id} size="small" style={{ marginBottom: 8 }}>
                  <Space>
                    <Badge color={SEVERITY_COLOR[ins.severity]} text={ins.severity} />
                    <Text type="secondary">{new Date(ins.generated_at).toLocaleString()}</Text>
                  </Space>
                  <Paragraph style={{ marginTop: 8 }}>{ins.summary}</Paragraph>
                </Card>
              )),
            },
          ]}
        />
      )}
    </Space>
  );
};
