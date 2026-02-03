import { describe, it, expect } from "vitest";
import { conditionNodeToPersistedTree, persistedTreeToConditionNode } from "./conditionTree";
import { LogicalOperator, Operator } from "../../types/enums";
import type { ConditionNode, PersistedConditionTree } from "../../types/domain";

describe("conditionNodeToPersistedTree", () => {
  it("returns empty AND tree for undefined root", () => {
    expect(conditionNodeToPersistedTree(undefined)).toEqual({ and: [] });
  });

  it("converts a predicate root into an AND wrapped persisted tree", () => {
    const root: ConditionNode = { kind: "predicate", field: "age", op: Operator.GTE, value: 18 };
    expect(conditionNodeToPersistedTree(root)).toEqual({
      and: [{ field: "age", op: Operator.GTE, value: 18 }],
    });
  });

  it("converts an OR group to persisted OR shape", () => {
    const root: ConditionNode = {
      kind: "group",
      op: LogicalOperator.OR,
      children: [{ kind: "predicate", field: "country", op: Operator.EQ, value: "US" }],
    };

    expect(conditionNodeToPersistedTree(root)).toEqual({
      or: [{ field: "country", op: Operator.EQ, value: "US" }],
    });
  });

  it("converts nested groups and predicates", () => {
    const root: ConditionNode = {
      kind: "group",
      op: LogicalOperator.AND,
      children: [
        { kind: "predicate", field: "a", op: Operator.EQ, value: 1 },
        {
          kind: "group",
          op: LogicalOperator.OR,
          children: [{ kind: "predicate", field: "b", op: Operator.LT, value: 10 }],
        },
      ],
    };

    expect(conditionNodeToPersistedTree(root)).toEqual({
      and: [
        { field: "a", op: Operator.EQ, value: 1 },
        { or: [{ field: "b", op: Operator.LT, value: 10 }] },
      ],
    });
  });
});

describe("persistedTreeToConditionNode", () => {
  it("returns empty AND group for undefined tree", () => {
    expect(persistedTreeToConditionNode(undefined)).toEqual({
      kind: "group",
      op: LogicalOperator.AND,
      children: [],
    });
  });

  it("converts an AND persisted tree to a group with predicate child", () => {
    const tree: PersistedConditionTree = { and: [{ field: "age", op: Operator.GTE, value: 18 }] };
    const result = persistedTreeToConditionNode(tree);
    expect(result.kind).toBe("group");
    expect(result.op).toBe(LogicalOperator.AND);
    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toEqual({
      kind: "predicate",
      field: "age",
      op: Operator.GTE,
      value: 18,
    });
  });

  it("converts an OR persisted tree to an OR group", () => {
    const tree: PersistedConditionTree = {
      or: [{ field: "country", op: Operator.EQ, value: "US" }],
    };
    const result = persistedTreeToConditionNode(tree);
    expect(result.kind).toBe("group");
    expect(result.op).toBe(LogicalOperator.OR);
    expect(result.children[0]).toEqual({
      kind: "predicate",
      field: "country",
      op: Operator.EQ,
      value: "US",
    });
  });

  it("handles non-array and/or by treating them as empty", () => {
    const tree = { and: "not-an-array" } as any;
    const result = persistedTreeToConditionNode(tree);
    expect(result.kind).toBe("group");
    expect(result.children).toHaveLength(0);
  });

  it("handles numeric/non-string field values in predicate nodes", () => {
    const tree: PersistedConditionTree = {
      and: [{ field: 123 as any, op: Operator.EQ, value: 1 }],
    };
    const result = persistedTreeToConditionNode(tree) as any;
    expect(result.kind).toBe("group");
    expect(result.children[0].kind).toBe("predicate");
    expect(result.children[0].field).toBe(123);
    expect(result.children[0].value).toBe(1);
  });

  it("falls back to empty group for unknown shapes", () => {
    const bad = {} as any as PersistedConditionTree;
    const result = persistedTreeToConditionNode(bad);
    expect(result).toEqual({ kind: "group", op: LogicalOperator.AND, children: [] });
  });
});
