import { LogicalOperator, Operator } from "../../../../types/enums";
import type { RuleField } from "../../../../types/domain";
import type { UiConditionNode, UiGroupNode, UiPredicateNode } from "./nodeTypes";

export function isNoValueOperator(op: Operator): boolean {
  return op === Operator.IS_NULL || op === Operator.IS_NOT_NULL;
}

export function isRangeOperator(op: Operator): boolean {
  return op === Operator.BETWEEN;
}

export function isMultiOperator(op: Operator): boolean {
  return op === Operator.IN || op === Operator.NOT_IN;
}

export function createUiId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureGroupRoot(root?: UiConditionNode): UiGroupNode {
  // Use optional chaining here for clarity; this is safe because we're only doing an equality check

  if (root?.kind === "group") return root;
  return {
    kind: "group",
    op: LogicalOperator.AND,
    uiId: createUiId(),
    children: root == null ? [] : [root],
  };
}

export function hydrate(node: UiConditionNode): UiConditionNode {
  if (node.kind === "group") {
    const g = node;
    return { ...g, uiId: createUiId(), children: g.children.map(hydrate) };
  }
  const p = node;
  return { ...p, uiId: createUiId() };
}

export function strip(node: UiConditionNode): unknown {
  if (node.kind === "group") {
    return { kind: "group", op: node.op, children: node.children.map(strip) };
  }

  const p = node;
  if (typeof p.field !== "string") {
    return { kind: "predicate", field: p.field, op: p.op, value: p.value as number };
  }

  return { kind: "predicate", field: p.field, op: p.op, value: p.value };
}

export function findAndUpdate(
  node: UiConditionNode,
  nodeId: string,
  updater: (n: UiConditionNode) => UiConditionNode
): UiConditionNode {
  if (node.uiId === nodeId) return updater(node);
  if (node.kind === "group") {
    const g = node;
    return {
      ...g,
      children: g.children.map((c: UiConditionNode) => findAndUpdate(c, nodeId, updater)),
    };
  }
  return node;
}

export function deleteNode(root: UiConditionNode, nodeId: string): UiConditionNode {
  if (root.kind !== "group") return root;
  const filterChildren = (children: UiConditionNode[]): UiConditionNode[] => {
    return children
      .filter((c) => c.uiId !== nodeId)
      .map((c) => {
        if (c.kind === "group") {
          const g = c;
          return { ...g, children: filterChildren(g.children) };
        }
        return c;
      });
  };

  const g = root;
  return { ...g, children: filterChildren(g.children) };
}

export function moveChild(
  root: UiConditionNode,
  parentId: string,
  childId: string,
  direction: "up" | "down"
): UiConditionNode {
  return findAndUpdate(root, parentId, (n) => {
    if (n.kind !== "group") return n;
    const g = n;
    const idx = g.children.findIndex((c: UiConditionNode) => c.uiId === childId);
    if (idx < 0) return g;
    const nextIndex = direction === "up" ? idx - 1 : idx + 1;
    if (nextIndex < 0 || nextIndex >= g.children.length) return g;

    const children = [...g.children];
    const current = children[idx];
    const other = children[nextIndex];
    if (current == null || other == null) return g;
    children[idx] = other;
    children[nextIndex] = current;
    return { ...g, children };
  });
}

export function newPredicate(): UiPredicateNode {
  return {
    kind: "predicate",
    uiId: createUiId(),
    field: "",
    op: Operator.EQ,
    value: "",
  } as UiPredicateNode;
}

export function newGroup(op: LogicalOperator): UiGroupNode {
  return { kind: "group", uiId: createUiId(), op, children: [] } as UiGroupNode;
}

// Validation implementation moved to `api.ts` to avoid exporting non-component helpers from the component file.

export function extractPredicateRowState(
  node: UiPredicateNode,
  fields: RuleField[]
): {
  isVelocityPredicate: boolean;
  selectedFieldSafe?: RuleField;
  hasErrors: boolean;
  hasFieldError: boolean;
  hasOperatorError: boolean;
} {
  const isVelocityPredicate = typeof node.field !== "string";
  const selectedFieldSafe =
    typeof node.field === "string" ? fields.find((f) => f.field_key === node.field) : undefined;

  const hasErrors = (node.validationErrors?.length ?? 0) > 0;
  const fieldErrors = node.validationErrors?.filter((e) => e.field === "field") ?? [];
  const operatorErrors = node.validationErrors?.filter((e) => e.field === "operator") ?? [];

  return {
    isVelocityPredicate,
    selectedFieldSafe,
    hasErrors,
    hasFieldError: fieldErrors.length > 0,
    hasOperatorError: operatorErrors.length > 0,
  };
}
