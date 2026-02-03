import type {
  ConditionNode,
  PersistedConditionNode,
  PersistedConditionTree,
  VelocityField,
} from "../../types/domain";
import { LogicalOperator } from "../../types/enums";

function isAndGroup(
  node: PersistedConditionNode
): node is PersistedConditionTree & { and: PersistedConditionNode[] } {
  return typeof node === "object" && node !== null && "and" in node && Array.isArray(node.and);
}

function isOrGroup(
  node: PersistedConditionNode
): node is PersistedConditionTree & { or: PersistedConditionNode[] } {
  return typeof node === "object" && node !== null && "or" in node && Array.isArray(node.or);
}

function isPersistedGroup(node: PersistedConditionNode): node is PersistedConditionTree {
  return isAndGroup(node) || isOrGroup(node);
}

function isPersistedPredicate(
  node: PersistedConditionNode
): node is Exclude<PersistedConditionNode, PersistedConditionTree> {
  return typeof node === "object" && node !== null && "field" in node && "op" in node;
}

function isVelocityField(field: string | VelocityField): field is VelocityField {
  return (
    typeof field === "object" && field !== null && "type" in field && field.type === "VELOCITY"
  );
}

export function conditionNodeToPersistedTree(
  root: ConditionNode | undefined
): PersistedConditionTree {
  if (root == null) {
    return { and: [] };
  }

  const toPersistedNode = (node: ConditionNode): PersistedConditionNode => {
    if (node.kind === "group") {
      const children = node.children.map(toPersistedNode);
      return node.op === LogicalOperator.OR ? { or: children } : { and: children };
    }

    return { field: node.field, op: node.op, value: node.value };
  };

  const persisted = toPersistedNode(root);

  // Ensure the root is a tree shape
  if (isPersistedGroup(persisted)) {
    return persisted;
  }

  return { and: [persisted] };
}

export function persistedTreeToConditionNode(
  tree: PersistedConditionTree | undefined
): ConditionNode {
  if (tree == null) {
    return { kind: "group", op: LogicalOperator.AND, children: [] };
  }

  const toConditionNode = (node: PersistedConditionNode): ConditionNode => {
    if (isOrGroup(node)) {
      return { kind: "group", op: LogicalOperator.OR, children: node.or.map(toConditionNode) };
    }

    if (isAndGroup(node)) {
      return { kind: "group", op: LogicalOperator.AND, children: node.and.map(toConditionNode) };
    }

    if (isPersistedPredicate(node)) {
      // Handle velocity fields separately from regular string fields
      if (isVelocityField(node.field)) {
        return {
          kind: "predicate",
          field: node.field,
          op: node.op,
          value: typeof node.value === "number" ? node.value : 0, // Velocity predicates require numeric value
        };
      }
      // Regular string field predicate
      return {
        kind: "predicate",
        field: node.field,
        op: node.op,
        value: node.value,
      };
    }

    // Fallback: unknown node shape becomes empty AND group
    return { kind: "group", op: LogicalOperator.AND, children: [] };
  };

  return toConditionNode(tree);
}
