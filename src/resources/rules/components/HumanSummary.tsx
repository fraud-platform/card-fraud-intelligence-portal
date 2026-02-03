/**
 * HumanSummary Component
 *
 * Displays a human-readable summary of a rule's conditions and actions.
 * Converts AST/condition structure into plain English.
 */

import type { FC } from "react";
import { Typography, Space } from "antd";
import "../rules.css";
import type { RuleWithVersion, PersistedConditionTree } from "../../../types/domain";

const { Text } = Typography;

interface HumanSummaryProps {
  rule: RuleWithVersion;
}

/**
 * Convert a rule condition to human-readable text
 */
function conditionToText(condition: PersistedConditionTree): string {
  if (condition == null) {
    return "No conditions defined";
  }

  // Handle AND conditions
  if ("and" in condition && Array.isArray(condition.and)) {
    const conditions = condition.and;
    if (conditions.length === 0) {
      return "No conditions";
    }
    if (conditions.length === 1) {
      return nodeToText(conditions[0]);
    }
    const parts = conditions.map((c) => nodeToText(c));
    return `(${parts.join(" AND ")})`;
  }

  // Handle OR conditions
  if ("or" in condition && Array.isArray(condition.or)) {
    const conditions = condition.or;
    if (conditions.length === 0) {
      return "No conditions";
    }
    if (conditions.length === 1) {
      return nodeToText(conditions[0]);
    }
    const parts = conditions.map((c) => nodeToText(c));
    return `(${parts.join(" OR ")})`;
  }

  return "No conditions defined";
}

/**
 * Convert a condition node to text
 */
function nodeToText(node: unknown): string {
  if (node == null || typeof node !== "object") {
    return String(node);
  }

  const obj = node as Record<string, unknown>;

  // Recursive handling of nested AND/OR
  if ("and" in obj && Array.isArray(obj.and)) {
    const parts = obj.and.map((c) => nodeToText(c));
    return `(${parts.join(" AND ")})`;
  }

  if ("or" in obj && Array.isArray(obj.or)) {
    const parts = obj.or.map((c) => nodeToText(c));
    return `(${parts.join(" OR ")})`;
  }

  // Handle predicate nodes
  if ("field" in obj && "op" in obj && "value" in obj) {
    const field = typeof obj.field === "string" ? obj.field : JSON.stringify(obj.field);
    const operator = String(obj.op);
    const value = JSON.stringify(obj.value);

    const operatorText: Record<string, string> = {
      EQ: "equals",
      NE: "not equals",
      GT: "greater than",
      GTE: "greater than or equal to",
      LT: "less than",
      LTE: "less than or equal to",
      IN: "is in",
      NOT_IN: "is not in",
      CONTAINS: "contains",
      STARTS_WITH: "starts with",
      ENDS_WITH: "ends with",
    };

    const opText = operatorText[operator] ?? operator;
    return `${field} ${opText} ${value}`;
  }

  return JSON.stringify(node);
}

/**
 * Get action description based on rule type
 */
function getActionDescription(ruleType: string): string {
  const actionMap: Record<string, string> = {
    TRANSACTION_SCREENING: "Screen transaction",
    VELOCITY_CHECK: "Check velocity threshold",
    GEOLOCATION_SCREENING: "Check geolocation",
    MERCHANT_SCREENING: "Screen merchant",
    AMOUNT_THRESHOLD: "Check amount threshold",
  };
  return actionMap[ruleType] ?? `Execute ${ruleType}`;
}

/**
 * HumanSummary component
 */
export const HumanSummary: FC<HumanSummaryProps> = ({ rule }) => {
  const conditionText = conditionToText(rule.version_details.condition_tree);
  const actionText = getActionDescription(rule.rule_type);

  return (
    <Space direction="vertical" size="small" className="full-width">
      <div>
        <Text strong>Rule: </Text>
        <Text>{rule.rule_name}</Text>
      </div>
      <div>
        <Text strong>If: </Text>
        <Text>{conditionText}</Text>
      </div>
      <div>
        <Text strong>Then: </Text>
        <Text>{actionText}</Text>
      </div>
      <div>
        <Text strong>Priority: </Text>
        <Text>{rule.version_details.priority}</Text>
      </div>
    </Space>
  );
};

export default HumanSummary;
