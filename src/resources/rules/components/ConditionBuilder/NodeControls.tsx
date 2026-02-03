/**
 * Node Control Components
 *
 * Extracted from ConditionBuilder for maintainability.
 * Provides UI controls for condition nodes.
 */

import React from "react";
import { Alert, Button, Select, Space } from "antd";
import "./condition-builder.css";
import { MinusCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { RuleField } from "../../../../types/domain";
import { Operator } from "../../../../types/enums";
import type { ValidationError } from "./validation";
import type { UiConditionNode, UiPredicateNode } from "./nodeTypes";

export function ErrorAlert({
  errors,
}: Readonly<{ errors: ValidationError[] }>): React.ReactElement | null {
  if (errors == null || errors.length === 0) return null;
  return (
    <Alert
      message="Validation Errors"
      description={
        <ul className="error-list">
          {errors.map((err, idx) => (
            <li key={`${err.code ?? idx}-${err.message}`}>{err.message}</li>
          ))}
        </ul>
      }
      type="error"
      showIcon
      closable={false}
    />
  );
}

export interface NodeControlsProps {
  nodeId: string;
  readOnly: boolean;
  parentId?: string;
  index?: number;
  siblingsCount?: number;
  onMove: (parentId: string, nodeId: string, dir: "up" | "down") => void;
  onDelete: (nodeId: string) => void;
}

export function NodeControls({
  nodeId,
  readOnly,
  parentId,
  index,
  siblingsCount,
  onMove,
  onDelete,
}: Readonly<NodeControlsProps>): React.ReactElement {
  return (
    <Space>
      <Button
        size="small"
        icon={<ArrowUpOutlined />}
        disabled={readOnly === true || parentId == null || index === 0}
        onClick={() => {
          if (parentId != null) onMove(parentId, nodeId, "up");
        }}
      />
      <Button
        size="small"
        icon={<ArrowDownOutlined />}
        disabled={
          readOnly === true ||
          parentId == null ||
          index === undefined ||
          typeof siblingsCount !== "number" ||
          index >= siblingsCount - 1
        }
        onClick={() => {
          if (parentId != null) onMove(parentId, nodeId, "down");
        }}
      />
      <Button
        size="small"
        danger
        icon={<MinusCircleOutlined />}
        disabled={readOnly}
        onClick={() => onDelete(nodeId)}
      />
    </Space>
  );
}

export interface FieldSelectorProps {
  node: UiPredicateNode;
  fields: RuleField[];
  readOnly: boolean;
  onUpdate: (id: string, u: (n: UiConditionNode) => UiConditionNode) => void;
  hasFieldError?: boolean;
}

export function FieldSelector({
  node,
  fields,
  readOnly,
  onUpdate,
  hasFieldError,
}: Readonly<FieldSelectorProps>): React.ReactElement {
  return (
    <Select
      disabled={readOnly}
      showSearch
      placeholder="Select field"
      className="select-min-width-240"
      value={typeof node.field === "string" && node.field !== "" ? node.field : undefined}
      optionFilterProp="label"
      options={fields.map((f) => ({
        label: `${f.display_name} (${f.field_key})`,
        value: f.field_key,
        disabled: f.is_active === false,
      }))}
      onChange={(fieldKey) => {
        const field = fields.find((f) => f.field_key === fieldKey);
        const allowedOps = field?.allowed_operators;
        const op = allowedOps?.[0] ?? Operator.EQ;
        const nextValue = op === Operator.IS_NULL || op === Operator.IS_NOT_NULL ? null : "";
        onUpdate(node.uiId, (n) =>
          n.kind === "predicate" ? { ...n, field: fieldKey, op, value: nextValue } : n
        );
      }}
      status={hasFieldError === true ? "error" : undefined}
    />
  );
}

export interface OperatorSelectorProps {
  node: UiPredicateNode;
  readOnly: boolean;
  isVelocityPredicate: boolean;
  selectedFieldSafe?: RuleField;
  onUpdate: (id: string, u: (n: UiConditionNode) => UiConditionNode) => void;
  hasOperatorError?: boolean;
}

export function OperatorSelector({
  node,
  readOnly,
  isVelocityPredicate,
  selectedFieldSafe,
  onUpdate,
  hasOperatorError,
}: Readonly<OperatorSelectorProps>): React.ReactElement {
  const operatorOptions = (selectedFieldSafe?.allowed_operators ?? Object.values(Operator)).map(
    (op) => ({ label: op, value: op })
  );
  return (
    <Select
      disabled={Boolean(
        readOnly === true || isVelocityPredicate === true || selectedFieldSafe == null
      )}
      placeholder="Select operator"
      className="select-w-160"
      value={node.op}
      options={operatorOptions}
      onChange={(op) => {
        onUpdate(node.uiId, (n) => {
          if (n.kind !== "predicate") return n;
          const nextValue = op === Operator.IS_NULL || op === Operator.IS_NOT_NULL ? null : n.value;
          return { ...n, op, value: nextValue };
        });
      }}
      status={hasOperatorError === true ? "error" : undefined}
    />
  );
}
