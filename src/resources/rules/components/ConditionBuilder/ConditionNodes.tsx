/**
 * Condition Node Components
 *
 * Extracted from ConditionBuilder for maintainability.
 * Provides visual representation of condition tree nodes.
 */

import React from "react";
import { Button, Card, Select, Space, Typography } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { RuleField } from "../../../../types/domain";
import { LogicalOperator } from "../../../../types/enums";
import type { UiConditionNode, UiGroupNode, UiPredicateNode } from "./nodeTypes";
import { extractPredicateRowState } from "./helpers";
import { ValueEditor } from "./ValueEditor";
import { ErrorAlert, FieldSelector, OperatorSelector, NodeControls } from "./NodeControls";
import "./condition-builder.css";

export interface NodeRowProps {
  node: UiConditionNode;
  fields: RuleField[];
  readOnly: boolean;
  onUpdate: (nodeId: string, updater: (node: UiConditionNode) => UiConditionNode) => void;
  onDelete: (nodeId: string) => void;
  onAddPredicate: (parentId: string) => void;
  onAddGroup: (parentId: string, op: LogicalOperator) => void;
  onMove: (parentId: string, nodeId: string, dir: "up" | "down") => void;
  parentId?: string;
  index?: number;
  siblingsCount?: number;
}

export function GroupNodeRow({
  node,
  fields,
  readOnly,
  onUpdate,
  onDelete,
  onAddPredicate,
  onAddGroup,
  onMove,
  parentId,
  index,
  siblingsCount,
}: Readonly<NodeRowProps & { node: UiGroupNode }>): React.ReactElement {
  const isRoot = parentId == null;

  return (
    <Card
      size="small"
      variant="outlined"
      className="condition-card"
      title={
        <Space>
          <Typography.Text strong>Group</Typography.Text>
          <Select
            disabled={readOnly}
            value={node.op}
            className="select-w-120"
            options={[
              { label: "AND", value: LogicalOperator.AND },
              { label: "OR", value: LogicalOperator.OR },
            ]}
            onChange={(next) =>
              onUpdate(node.uiId, (n) => (n.kind === "group" ? { ...n, op: next } : n))
            }
          />
        </Space>
      }
      extra={
        isRoot ? null : (
          <Space>
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={readOnly || parentId == null || index === 0}
              onClick={() => {
                if (parentId != null) onMove(parentId, node.uiId, "up");
              }}
            />
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={
                readOnly ||
                parentId == null ||
                index === undefined ||
                typeof siblingsCount !== "number" ||
                index >= siblingsCount - 1
              }
              onClick={() => {
                if (parentId != null) onMove(parentId, node.uiId, "down");
              }}
            />
            <Button
              size="small"
              danger
              icon={<MinusCircleOutlined />}
              disabled={readOnly}
              onClick={() => onDelete(node.uiId)}
            />
          </Space>
        )
      }
    >
      <Space wrap className="control-space">
        <Button
          size="small"
          icon={<PlusOutlined />}
          disabled={readOnly}
          onClick={() => onAddPredicate(node.uiId)}
        >
          Add Condition
        </Button>
        <Button
          size="small"
          icon={<PlusOutlined />}
          disabled={readOnly}
          onClick={() => onAddGroup(node.uiId, LogicalOperator.AND)}
        >
          Add AND Group
        </Button>
        <Button
          size="small"
          icon={<PlusOutlined />}
          disabled={readOnly}
          onClick={() => onAddGroup(node.uiId, LogicalOperator.OR)}
        >
          Add OR Group
        </Button>
      </Space>

      {node.children.length === 0 ? (
        <Typography.Text type="secondary">No conditions yet.</Typography.Text>
      ) : (
        node.children.map((child, idx) => (
          <NodeRow
            key={child.uiId}
            node={child}
            fields={fields}
            readOnly={readOnly}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddPredicate={onAddPredicate}
            onAddGroup={onAddGroup}
            onMove={onMove}
            parentId={node.uiId}
            index={idx}
            siblingsCount={node.children.length}
          />
        ))
      )}
    </Card>
  );
}

export function PredicateNodeRow({
  node,
  fields,
  readOnly,
  onUpdate,
  onDelete,
  onMove,
  parentId,
  index,
  siblingsCount,
}: Readonly<NodeRowProps & { node: UiPredicateNode }>): React.ReactElement {
  const { isVelocityPredicate, selectedFieldSafe, hasErrors, hasFieldError, hasOperatorError } =
    extractPredicateRowState(node, fields);

  return (
    <Card
      size="small"
      variant="outlined"
      className={hasErrors ? "condition-card error-border" : "condition-card"}
      title={
        <Space>
          <Typography.Text strong>Condition</Typography.Text>
          {hasErrors && <ExclamationCircleOutlined className="error-icon" />}
        </Space>
      }
      extra={
        <NodeControls
          nodeId={node.uiId}
          readOnly={readOnly}
          parentId={parentId}
          index={index}
          siblingsCount={siblingsCount}
          onMove={onMove}
          onDelete={onDelete}
        />
      }
    >
      <Space direction="vertical" className="condition-row">
        <ErrorAlert errors={node.validationErrors ?? []} />

        <Space wrap>
          <FieldSelector
            node={node}
            fields={fields}
            readOnly={readOnly}
            hasFieldError={hasFieldError}
            onUpdate={onUpdate}
          />

          <OperatorSelector
            node={node}
            readOnly={readOnly}
            isVelocityPredicate={isVelocityPredicate}
            selectedFieldSafe={selectedFieldSafe}
            hasOperatorError={hasOperatorError}
            onUpdate={onUpdate}
          />

          <ValueEditor
            field={selectedFieldSafe}
            operator={node.op}
            value={node.value}
            disabled={Boolean(
              readOnly === true || isVelocityPredicate === true || selectedFieldSafe == null
            )}
            onChange={(v) =>
              onUpdate(node.uiId, (n) => (n.kind === "predicate" ? { ...n, value: v } : n))
            }
            validationErrors={node.validationErrors}
          />

          {isVelocityPredicate && (
            <Typography.Text type="secondary">
              Velocity predicates are currently read-only in the visual builder.
            </Typography.Text>
          )}
        </Space>
      </Space>
    </Card>
  );
}

export function NodeRow(props: Readonly<NodeRowProps>): React.ReactElement {
  const {
    node,
    fields,
    readOnly,
    onUpdate,
    onDelete,
    onAddPredicate,
    onAddGroup,
    onMove,
    parentId,
    index,
    siblingsCount,
  } = props;

  if (node.kind === "group") {
    return (
      <GroupNodeRow
        node={node}
        fields={fields}
        readOnly={readOnly}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddPredicate={onAddPredicate}
        onAddGroup={onAddGroup}
        onMove={onMove}
        parentId={parentId}
        index={index}
        siblingsCount={siblingsCount}
      />
    );
  }

  return (
    <PredicateNodeRow
      node={node}
      fields={fields}
      readOnly={readOnly}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddPredicate={onAddPredicate}
      onAddGroup={onAddGroup}
      onMove={onMove}
      parentId={parentId}
      index={index}
      siblingsCount={siblingsCount}
    />
  );
}
