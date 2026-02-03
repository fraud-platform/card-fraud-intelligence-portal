import { useState, useCallback, type FC } from "react";
import { Modal, Space, Input, Alert, Typography } from "antd";
import { useNotification } from "@refinedev/core";
import type { Rule, RuleVersion } from "../../../types/domain";
import type { RuleSimulateResponse } from "../../../api/types";
import { post } from "../../../api/httpClient";
import { RULES } from "../../../api/endpoints";
import { parseSimulationQuery, buildSimulationPayload } from "../utils/simulation";

const { Text } = Typography;

const DEFAULT_SIMULATION_QUERY = `{
  "from_date": "",
  "to_date": "",
  "risk_level": "HIGH"
}`;

interface SimulationModalProps {
  open: boolean;
  onCancel: () => void;
  rule: Rule | null;
  selectedVersion: RuleVersion | null;
  onSimulationComplete: (result: RuleSimulateResponse) => void;
}

export const SimulationModal: FC<SimulationModalProps> = ({
  open,
  onCancel,
  rule,
  selectedVersion,
  onSimulationComplete,
}) => {
  const { open: notify } = useNotification();
  const [simulationQuery, setSimulationQuery] = useState(DEFAULT_SIMULATION_QUERY);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);

  const handleSimulate = useCallback(async () => {
    if (rule == null || selectedVersion == null) {
      setSimulationError("Rule version not available for simulation.");
      return;
    }

    // Use helpers to parse query and build payload
    setSimulationError(null);
    const parsed = parseSimulationQuery(simulationQuery);
    if (parsed.error != null) {
      setSimulationError(parsed.error);
      return;
    }

    const payload = buildSimulationPayload(
      rule.rule_type,
      selectedVersion.condition_tree,
      selectedVersion?.scope ?? undefined,
      parsed.query ?? {}
    );

    setSimulationLoading(true);
    try {
      const response = await post<RuleSimulateResponse>(RULES.SIMULATE, payload);
      onSimulationComplete(response);
      notify?.({
        type: "success",
        message: "Simulation completed",
        description: `Matches found: ${response.match_count}`,
      });
      onCancel(); // Close modal on success
    } catch (error) {
      const message = (error as { message?: string }).message ?? "Simulation failed";
      setSimulationError(message);
      notify?.({
        type: "error",
        message: "Simulation failed",
        description: message,
      });
    } finally {
      setSimulationLoading(false);
    }
  }, [rule, selectedVersion, simulationQuery, notify, onCancel, onSimulationComplete]);

  return (
    <Modal
      title="Simulate Rule"
      open={open}
      onCancel={onCancel}
      onOk={() => void handleSimulate()}
      okText="Run Simulation"
      confirmLoading={simulationLoading}
    >
      <Space direction="vertical" className="full-width" size="middle">
        <Text>
          Provide a JSON query to simulate historical matching. The rule condition and scope are
          taken from the selected version.
        </Text>
        <Input.TextArea
          value={simulationQuery}
          onChange={(event) => setSimulationQuery(event.target.value)}
          rows={8}
          autoSize={{ minRows: 6, maxRows: 12 }}
        />
        {simulationError != null && <Alert type="error" message={simulationError} />}
      </Space>
    </Modal>
  );
};
