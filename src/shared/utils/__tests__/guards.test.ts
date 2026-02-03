import { describe, it, expect } from "vitest";
import {
  isGroupNode,
  isPredicateNode,
  isVelocityPredicateNode,
  isVelocityField,
  isLogicalOperator,
  isPersistedConditionTree,
  isNonEmptyString,
  isNonEmptyArray,
  isValidNumber,
  isValidDateString,
  isApiError,
} from "../guards";
import type { GroupNode, PredicateNode, VelocityPredicateNode } from "../../../types/domain";
import { Operator, LogicalOperator } from "../../../types/enums";

describe("isGroupNode", () => {
  it("returns true for group nodes", () => {
    const node: GroupNode = { kind: "group", op: LogicalOperator.AND, children: [] };
    expect(isGroupNode(node)).toBe(true);
  });

  it("returns false for predicate nodes", () => {
    const node: PredicateNode = { kind: "predicate", field: "a", op: Operator.EQ, value: 1 };
    expect(isGroupNode(node)).toBe(false);
  });

  it("returns false for invalid objects", () => {
    expect(isGroupNode({ kind: "group" } as any)).toBe(false);
    expect(isGroupNode({} as any)).toBe(false);
    expect(isGroupNode("string" as any)).toBe(false);
  });
});

describe("isPredicateNode", () => {
  it("returns true for predicate nodes", () => {
    const node: PredicateNode = { kind: "predicate", field: "a", op: Operator.EQ, value: 1 };
    expect(isPredicateNode(node)).toBe(true);
  });

  it("returns false for group nodes", () => {
    const node: GroupNode = { kind: "group", op: LogicalOperator.AND, children: [] };
    expect(isPredicateNode(node)).toBe(false);
  });

  it("returns false for invalid objects", () => {
    expect(isPredicateNode({ kind: "predicate" } as any)).toBe(false);
  });
});

describe("isVelocityPredicateNode", () => {
  it("returns true for velocity predicate nodes", () => {
    const node: VelocityPredicateNode = {
      kind: "predicate",
      field: {
        type: "VELOCITY",
        aggregation: "COUNT",
        window: { value: 1, unit: "HOURS" },
        group_by: ["card_hash"],
      },
      op: Operator.GT,
      value: 5,
    };
    expect(isVelocityPredicateNode(node)).toBe(true);
  });

  it("returns false for regular predicate nodes", () => {
    const node: PredicateNode = { kind: "predicate", field: "amount", op: Operator.GT, value: 100 };
    expect(isVelocityPredicateNode(node)).toBe(false);
  });
});

describe("isVelocityField", () => {
  it("returns true for velocity field objects", () => {
    const field = {
      type: "VELOCITY",
      aggregation: "COUNT",
      window: { value: 24, unit: "HOURS" },
      group_by: ["card_hash"],
    };
    expect(isVelocityField(field)).toBe(true);
  });

  it("returns false for non-velocity fields", () => {
    expect(isVelocityField({ type: "STRING" })).toBe(false);
    expect(isVelocityField(null)).toBe(false);
    expect(isVelocityField("string")).toBe(false);
  });

  it("returns false for incomplete velocity fields", () => {
    expect(isVelocityField({ type: "VELOCITY", aggregation: "COUNT" })).toBe(false);
  });
});

describe("isLogicalOperator", () => {
  it("returns true for valid operators", () => {
    expect(isLogicalOperator("and")).toBe(true);
    expect(isLogicalOperator("or")).toBe(true);
  });

  it("returns false for invalid operators", () => {
    expect(isLogicalOperator("AND")).toBe(false);
    expect(isLogicalOperator("invalid")).toBe(false);
    expect(isLogicalOperator(null)).toBe(false);
  });
});

describe("isPersistedConditionTree", () => {
  it("returns true for and/or tree", () => {
    expect(isPersistedConditionTree({ and: [] })).toBe(true);
    expect(isPersistedConditionTree({ or: [] })).toBe(true);
    expect(isPersistedConditionTree({ and: [{ field: "a", op: Operator.EQ, value: 1 }] })).toBe(
      true
    );
  });

  it("returns true for predicate shape", () => {
    expect(isPersistedConditionTree({ field: "a", op: Operator.EQ, value: 1 })).toBe(true);
  });

  it("returns false for invalid shapes", () => {
    expect(isPersistedConditionTree(null)).toBe(false);
    expect(isPersistedConditionTree({})).toBe(false);
    expect(isPersistedConditionTree({ unknown: "value" })).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  it("returns true for non-empty strings", () => {
    expect(isNonEmptyString("test")).toBe(true);
    expect(isNonEmptyString("a")).toBe(true);
    expect(isNonEmptyString("  test  ")).toBe(true);
  });

  it("returns false for empty strings", () => {
    expect(isNonEmptyString("")).toBe(false);
    expect(isNonEmptyString("   ")).toBe(false);
  });

  it("returns false for non-strings", () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
  });
});

describe("isNonEmptyArray", () => {
  it("returns true for non-empty arrays", () => {
    expect(isNonEmptyArray([1, 2, 3])).toBe(true);
    expect(isNonEmptyArray(["a"])).toBe(true);
  });

  it("returns false for empty arrays", () => {
    expect(isNonEmptyArray([])).toBe(false);
  });

  it("returns false for non-arrays", () => {
    expect(isNonEmptyArray(null)).toBe(false);
    expect(isNonEmptyArray("string")).toBe(false);
    expect(isNonEmptyArray({ length: 0 })).toBe(false);
  });
});

describe("isValidNumber", () => {
  it("returns true for valid numbers", () => {
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(42)).toBe(true);
    expect(isValidNumber(-5)).toBe(true);
    expect(isValidNumber(3.14)).toBe(true);
  });

  it("returns false for NaN", () => {
    expect(isValidNumber(NaN)).toBe(false);
  });

  it("returns false for Infinity", () => {
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber(-Infinity)).toBe(false);
  });

  it("returns false for non-numbers", () => {
    expect(isValidNumber("42")).toBe(false);
    expect(isValidNumber(null)).toBe(false);
    expect(isValidNumber(undefined)).toBe(false);
  });
});

describe("isValidDateString", () => {
  it("returns true for valid ISO date strings", () => {
    expect(isValidDateString("2024-01-15")).toBe(true);
    expect(isValidDateString("2024-01-15T10:30:00Z")).toBe(true);
    expect(isValidDateString("2024-12-31T23:59:59")).toBe(true);
  });

  it("returns false for invalid date strings", () => {
    expect(isValidDateString("not-a-date")).toBe(false);
    expect(isValidDateString("")).toBe(false);
  });

  it("returns false for non-strings", () => {
    expect(isValidDateString(null)).toBe(false);
    expect(isValidDateString(123)).toBe(false);
  });
});

describe("isApiError", () => {
  it("returns true for objects with string message", () => {
    expect(isApiError({ message: "Error occurred" })).toBe(true);
    expect(isApiError({ message: "Error", status: 500 })).toBe(true);
  });

  it("returns false for objects without message", () => {
    expect(isApiError({ error: "Error" })).toBe(false);
    expect(isApiError({})).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isApiError("string error")).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
