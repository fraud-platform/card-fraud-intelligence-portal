/**
 * Condition Builder Component
 *
 * Visual builder for creating rule condition trees.
 * Supports AND/OR grouping, nested conditions, and various operators.
 * Includes comprehensive input validation and XSS protection.
 */

import { useCallback, useMemo, useState, type FC } from "react";
import { Alert, Card, Divider, Typography } from "antd";
import { useList } from "@refinedev/core";
import type { ConditionNode, RuleField } from "../../../../types/domain";
import { LogicalOperator } from "../../../../types/enums";
import type { UiConditionNode, UiGroupNode } from "./nodeTypes";
import { MAX_STRING_LENGTH, validateTree, hasValidationErrors } from "./validation";
import {
  createUiId,
  ensureGroupRoot as ensureGroupRootHelper,
  hydrate,
  strip,
  findAndUpdate,
  deleteNode,
  moveChild,
  newPredicate,
  newGroup,
} from "./helpers";
import { NodeRow } from "./ConditionNodes";
import { RangeValueEditor, MultiValueEditor, SingleValueEditor } from "./ValueEditor";

export interface ConditionBuilderProps {
  /** Current condition tree */
  value?: ConditionNode;
  /** Callback when condition tree changes */
  onChange?: (value: ConditionNode) => void;
  /** Whether the builder is read-only */
  readOnly?: boolean;
}

function ensureGroupRoot(root?: ConditionNode): UiGroupNode {
  const result = ensureGroupRootHelper(root as UiConditionNode | undefined);
  return result;
}

/**
 * ConditionBuilder component for visual rule authoring with input validation
 */
export const ConditionBuilder: FC<ConditionBuilderProps> = ({
  value,
  onChange,
  readOnly = false,
}) => {
  const root = useMemo(() => ensureGroupRoot(value), [value]);

  function ensureUiGroup(node: UiConditionNode): UiGroupNode {
    if (node.kind === "group") return node;
    return { kind: "group", uiId: createUiId(), op: LogicalOperator.AND, children: [node] };
  }

  const [uiRoot, setUiRoot] = useState<UiGroupNode>(() => ensureUiGroup(hydrate(root)));

  const { result: fieldsResult } = useList<RuleField>({
    resource: "rule-fields",
    pagination: { mode: "off" },
    filters: [{ field: "is_active", operator: "eq", value: true }],
  });

  const fields = useMemo(() => fieldsResult?.data ?? [], [fieldsResult?.data]);

  // Validate the entire tree and get a validated version with error annotations
  const validatedRoot = useMemo(() => {
    return validateTree(uiRoot, fields);
  }, [uiRoot, fields]);

  // Check if there are any validation errors in the tree
  const hasErrors = useMemo(() => {
    return hasValidationErrors(validatedRoot);
  }, [validatedRoot]);

  const pushChange = useCallback(
    (next: UiGroupNode) => {
      setUiRoot(next);
      onChange?.(strip(next) as ConditionNode);
    },
    [onChange]
  );

  const onUpdate = useCallback(
    (nodeId: string, updater: (node: UiConditionNode) => UiConditionNode) => {
      const next = ensureUiGroup(findAndUpdate(uiRoot, nodeId, updater));
      pushChange(next);
    },
    [pushChange, uiRoot]
  );

  const onDelete = useCallback(
    (nodeId: string) => {
      const next = ensureUiGroup(deleteNode(uiRoot, nodeId));
      pushChange(next);
    },
    [pushChange, uiRoot]
  );

  const onAddPredicate = useCallback(
    (parentId: string) => {
      const next = ensureUiGroup(
        findAndUpdate(uiRoot, parentId, (n) => {
          if (n.kind !== "group") return n;
          return { ...n, children: [...n.children, newPredicate()] };
        })
      );
      pushChange(next);
    },
    [pushChange, uiRoot]
  );

  const onAddGroup = useCallback(
    (parentId: string, op: LogicalOperator) => {
      const next = ensureUiGroup(
        findAndUpdate(uiRoot, parentId, (n) => {
          if (n.kind !== "group") return n;
          return { ...n, children: [...n.children, newGroup(op)] };
        })
      );
      pushChange(next);
    },
    [pushChange, uiRoot]
  );

  const onMove = useCallback(
    (parentId: string, nodeId: string, dir: "up" | "down") => {
      const next = ensureUiGroup(moveChild(uiRoot, parentId, nodeId, dir));
      pushChange(next);
    },
    [pushChange, uiRoot]
  );

  return (
    <Card title="Condition Builder" size="small" variant="outlined">
      {readOnly ? (
        <Typography.Paragraph type="secondary" className="control-space">
          Read-only mode
        </Typography.Paragraph>
      ) : null}

      {hasErrors && !readOnly && (
        <Alert
          message="Validation Required"
          description="Some conditions have validation errors. Please fix all errors before saving the rule."
          type="warning"
          showIcon
          className="alert-spaced"
        />
      )}

      <Typography.Paragraph type="secondary" className="paragraph-no-top">
        Build nested AND/OR groups with field/operator/value predicates.
        {!readOnly && (
          <>
            <br />
            All inputs are validated for security. String values are limited to {
              MAX_STRING_LENGTH
            }{" "}
            characters.
          </>
        )}
      </Typography.Paragraph>

      <Divider className="divider-spaced" />

      <NodeRow
        node={validatedRoot}
        fields={fields}
        readOnly={readOnly}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddPredicate={onAddPredicate}
        onAddGroup={onAddGroup}
        onMove={onMove}
      />
    </Card>
  );
};

/**
 * Public API: validateConditionTree is implemented in a separate module
 * to avoid exporting non-component helpers from this component file.
 */

// Export only UI subcomponents used by tests and other components
export { RangeValueEditor, MultiValueEditor, SingleValueEditor };

export default ConditionBuilder;
