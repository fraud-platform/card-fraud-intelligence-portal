/**
 * DecisionDetailsPanel Component
 *
 * Collapsible panel showing decision details.
 */

import type { FC } from "react";
import { Descriptions, Tag, Typography } from "antd";
import {
  getDecisionColor,
  getDecisionReasonColor,
  getEvaluationTypeColor,
} from "../../../theme/tokens";
import "./decision-details-panel.css";
import type { Transaction } from "../../../types/transaction";

const { Text } = Typography;

export interface DecisionDetailsPanelProps {
  transaction: Transaction;
}

/**
 * Decision details panel component
 */
export const DecisionDetailsPanel: FC<DecisionDetailsPanelProps> = ({ transaction }) => {
  return (
    <Descriptions size="small" column={2}>
      <Descriptions.Item label="Decision">
        <Tag color={getDecisionColor(transaction.decision)} className="tag-lg">
          {transaction.decision}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Evaluation Type">
        {transaction.evaluation_type != null ? (
          <Tag color={getEvaluationTypeColor(transaction.evaluation_type)} className="tag-sm">
            {transaction.evaluation_type}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Reason">
        <Tag color={getDecisionReasonColor(transaction.decision_reason)} className="tag-sm">
          {transaction.decision_reason}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Ruleset ID">
        <Text code>{transaction.ruleset_id}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Ruleset Version">
        <Text code>v{transaction.ruleset_version}</Text>
      </Descriptions.Item>
    </Descriptions>
  );
};
