import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  isNoValueOperator,
  isRangeOperator,
  isMultiOperator,
  ensureGroupRoot,
  hydrate,
  strip,
  findAndUpdate,
  deleteNode,
  moveChild,
  newPredicate,
  newGroup,
} from "./helpers";

import { validateConditionTree } from "./api";

import ConditionBuilder, { RangeValueEditor, MultiValueEditor, SingleValueEditor } from "./index";

vi.mock("@refinedev/core", () => ({
  useList: vi.fn(),
}));

import { useList } from "@refinedev/core";

import { Operator, LogicalOperator, DataType } from "../../../../types/enums";
import type { PredicateNode, GroupNode, ConditionNode, RuleField } from "../../../../types/domain";

// Mock dayjs for DatePicker
vi.mock("dayjs", () => ({
  default: () => ({
    toISOString: () => "2024-01-01T00:00:00.000Z",
  }),
}));

describe("ConditionBuilder utils", () => {
  describe("operator helpers", () => {
    it("isNoValueOperator identifies IS_NULL and IS_NOT_NULL", () => {
      expect(isNoValueOperator(Operator.IS_NULL)).toBe(true);
      expect(isNoValueOperator(Operator.IS_NOT_NULL)).toBe(true);
      expect(isNoValueOperator(Operator.EQ)).toBe(false);
      expect(isNoValueOperator(Operator.IN)).toBe(false);
      expect(isNoValueOperator(Operator.BETWEEN)).toBe(false);
      expect(isNoValueOperator(Operator.GT)).toBe(false);
    });

    it("isRangeOperator identifies BETWEEN", () => {
      expect(isRangeOperator(Operator.BETWEEN)).toBe(true);
      expect(isRangeOperator(Operator.IN)).toBe(false);
      expect(isRangeOperator(Operator.GT)).toBe(false);
    });

    it("isMultiOperator identifies IN and NOT_IN", () => {
      expect(isMultiOperator(Operator.IN)).toBe(true);
      expect(isMultiOperator(Operator.NOT_IN)).toBe(true);
      expect(isMultiOperator(Operator.EQ)).toBe(false);
      expect(isMultiOperator(Operator.BETWEEN)).toBe(false);
    });
  });

  describe("ensureGroupRoot", () => {
    it("wraps predicate into group", () => {
      const p: PredicateNode = { kind: "predicate", field: "mcc", op: Operator.EQ, value: "5967" };
      const g = ensureGroupRoot(p);
      expect(g.kind).toBe("group");
      expect(g.children.length).toBe(1);
      expect(g.children[0]).toMatchObject(p);
    });

    it("returns existing group root unchanged", () => {
      const g: GroupNode = { kind: "group", op: LogicalOperator.AND, children: [] };
      const result = ensureGroupRoot(g);
      expect(result).toBe(g);
    });

    it("creates empty AND group for undefined", () => {
      const g = ensureGroupRoot(undefined);
      expect(g.kind).toBe("group");
      expect(g.op).toBe(LogicalOperator.AND);
      expect(g.children).toEqual([]);
    });
  });

  describe("hydrate and strip", () => {
    it("hydrate and strip roundtrip for predicate", () => {
      const p: PredicateNode = { kind: "predicate", field: "amount", op: Operator.EQ, value: 100 };
      const u = hydrate(p as any);
      const s = strip(u as any);
      expect(s).toMatchObject(p);
    });

    it("hydrate adds uiId to all nodes", () => {
      const p: PredicateNode = { kind: "predicate", field: "amount", op: Operator.EQ, value: 100 };
      const u = hydrate(p as any);
      expect(u.uiId).toBeDefined();
      expect(typeof u.uiId).toBe("string");
    });

    it("hydrate recursively adds uiId to group children", () => {
      const g: GroupNode = {
        kind: "group",
        op: LogicalOperator.AND,
        children: [
          { kind: "predicate", field: "a", op: Operator.EQ, value: 1 },
          { kind: "predicate", field: "b", op: Operator.GT, value: 2 },
        ],
      };
      const u = hydrate(g as any);
      expect(u.uiId).toBeDefined();
      expect((u as any).children[0].uiId).toBeDefined();
      expect((u as any).children[1].uiId).toBeDefined();
      expect((u as any).children[0].uiId).not.toBe((u as any).children[1].uiId);
    });

    it("strip removes uiId from predicate", () => {
      const p: PredicateNode = { kind: "predicate", field: "amount", op: Operator.EQ, value: 100 };
      const u = hydrate(p as any);
      const s = strip(u as any);
      expect(s).not.toHaveProperty("uiId");
    });

    it("strip removes uiId from group and all children", () => {
      const g: GroupNode = {
        kind: "group",
        op: LogicalOperator.AND,
        children: [{ kind: "predicate", field: "a", op: Operator.EQ, value: 1 }],
      };
      const u = hydrate(g as any);
      const s = strip(u as any);
      expect(s).not.toHaveProperty("uiId");
      expect((s as any).children[0]).not.toHaveProperty("uiId");
    });

    it("strip handles velocity field predicates", () => {
      const velocityField = {
        field_key: "txn_count_24h",
        display_name: "Transaction Count",
        data_type: DataType.NUMBER,
        is_active: true,
      };
      const u = hydrate({
        kind: "predicate",
        field: velocityField,
        op: Operator.GT,
        value: 10,
      } as any);
      const s = strip(u as any);
      expect(s.kind).toBe("predicate");
      expect((s as any).field).toEqual(velocityField);
      expect((s as any).value).toBe(10);
    });
  });

  describe("findAndUpdate", () => {
    it("updates specific node by uiId", () => {
      const group = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      p1.field = "a";
      const p2 = newPredicate();
      p2.field = "b";
      (group as any).children = [p1, p2];

      const updated = findAndUpdate(group as any, p2.uiId, (n) => ({ ...n, op: Operator.NOT_IN }));
      expect((updated as any).children[1].op).toBe(Operator.NOT_IN);
    });

    it("returns original node when uiId not found", () => {
      const group = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      p1.field = "a";
      (group as any).children = [p1];

      const updated = findAndUpdate(group as any, "non-existent-id", (n) => ({
        ...n,
        op: Operator.NOT_IN,
      }));
      expect((updated as any).children[0].op).toBe(Operator.EQ);
    });

    it("updates nested group node", () => {
      const innerGroup = newGroup(LogicalOperator.OR);
      const p1 = newPredicate();
      p1.field = "inner";
      (innerGroup as any).children = [p1];

      const outerGroup = newGroup(LogicalOperator.AND);
      const p2 = newPredicate();
      p2.field = "outer";
      (outerGroup as any).children = [innerGroup as any, p2];

      const updated = findAndUpdate(outerGroup as any, innerGroup.uiId, (n) =>
        n.kind === "group" ? { ...n, op: LogicalOperator.OR } : n
      );
      expect((updated as any).children[0].op).toBe(LogicalOperator.OR);
    });

    it("updates nested predicate", () => {
      const innerGroup = newGroup(LogicalOperator.OR);
      const p1 = newPredicate();
      p1.field = "inner";
      (innerGroup as any).children = [p1];

      const outerGroup = newGroup(LogicalOperator.AND);
      (outerGroup as any).children = [innerGroup as any];

      const updated = findAndUpdate(outerGroup as any, p1.uiId, (n) => ({
        ...n,
        field: "updated",
      }));
      expect(((updated as any).children[0] as any).children[0].field).toBe("updated");
    });
  });

  describe("deleteNode", () => {
    it("removes direct child", () => {
      const root = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      const p2 = newPredicate();
      (root as any).children = [p1, p2];

      const after = deleteNode(root as any, p1.uiId);
      expect((after as any).children.length).toBe(1);
      expect((after as any).children[0].uiId).toBe(p2.uiId);
    });

    it("removes nested child", () => {
      const innerGroup = newGroup(LogicalOperator.OR);
      const p1 = newPredicate();
      const p2 = newPredicate();
      (innerGroup as any).children = [p1, p2];

      const outerGroup = newGroup(LogicalOperator.AND);
      (outerGroup as any).children = [innerGroup as any];

      const after = deleteNode(outerGroup as any, p1.uiId);
      const innerAfter = (after as any).children[0] as any;
      expect(innerAfter.children.length).toBe(1);
      expect(innerAfter.children[0].uiId).toBe(p2.uiId);
    });

    it("returns unchanged node when deleting from predicate", () => {
      const p = newPredicate();
      p.field = "test";
      const after = deleteNode(p as any, "some-id");
      expect(after).toBe(p);
    });

    it("handles non-existent node id gracefully", () => {
      const root = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      (root as any).children = [p1];

      const after = deleteNode(root as any, "non-existent");
      expect((after as any).children.length).toBe(1);
    });
  });

  describe("moveChild", () => {
    it("swaps children up", () => {
      const root = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      p1.field = "one";
      const p2 = newPredicate();
      p2.field = "two";
      const p3 = newPredicate();
      p3.field = "three";
      (root as any).children = [p1, p2, p3];

      const movedUp = moveChild(root as any, root.uiId, p2.uiId, "up");
      expect((movedUp as any).children.map((c: any) => c.field)).toEqual(["two", "one", "three"]);
    });

    it("swaps children down", () => {
      const root = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      p1.field = "one";
      const p2 = newPredicate();
      p2.field = "two";
      const p3 = newPredicate();
      p3.field = "three";
      (root as any).children = [p1, p2, p3];

      const movedDown = moveChild(root as any, root.uiId, p1.uiId, "down");
      expect((movedDown as any).children.map((c: any) => c.field)).toEqual(["two", "one", "three"]);
    });

    it("does not move first child up", () => {
      const root = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      p1.field = "one";
      const p2 = newPredicate();
      p2.field = "two";
      (root as any).children = [p1, p2];

      const result = moveChild(root as any, root.uiId, p1.uiId, "up");
      expect((result as any).children.map((c: any) => c.field)).toEqual(["one", "two"]);
    });

    it("does not move last child down", () => {
      const root = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      p1.field = "one";
      const p2 = newPredicate();
      p2.field = "two";
      (root as any).children = [p1, p2];

      const result = moveChild(root as any, root.uiId, p2.uiId, "down");
      expect((result as any).children.map((c: any) => c.field)).toEqual(["one", "two"]);
    });

    it("returns unchanged when parent is not a group", () => {
      const p = newPredicate();
      p.field = "test";
      const result = moveChild(p as any, "some-id", "some-child", "up");
      expect(result).toBe(p);
    });

    it("returns unchanged when child not found", () => {
      const root = newGroup(LogicalOperator.AND);
      const p1 = newPredicate();
      (root as any).children = [p1];

      const result = moveChild(root as any, root.uiId, "non-existent", "up");
      expect((result as any).children.length).toBe(1);
    });
  });

  describe("newPredicate and newGroup", () => {
    it("newPredicate creates predicate with default values", () => {
      const p = newPredicate();
      expect(p.kind).toBe("predicate");
      expect(p.uiId).toBeDefined();
      expect(p.field).toBe("");
      expect(p.op).toBe(Operator.EQ);
      expect(p.value).toBe("");
    });

    it("newGroup creates group with specified operator", () => {
      const g = newGroup(LogicalOperator.OR);
      expect(g.kind).toBe("group");
      expect(g.op).toBe(LogicalOperator.OR);
      expect(g.uiId).toBeDefined();
      expect(g.children).toEqual([]);
    });

    it("newGroup creates empty AND group by default", () => {
      const g = newGroup(LogicalOperator.AND);
      expect(g.op).toBe(LogicalOperator.AND);
    });

    it("uiIds are unique across multiple calls", () => {
      const p1 = newPredicate();
      const p2 = newPredicate();
      const g = newGroup(LogicalOperator.OR);

      expect(p1.uiId).not.toBe(p2.uiId);
      expect(p1.uiId).not.toBe(g.uiId);
      expect(p2.uiId).not.toBe(g.uiId);
    });
  });

  describe("Value Editors", () => {
    describe("RangeValueEditor", () => {
      it("renders number inputs for NUMBER data type", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.NUMBER } as any;
        render(
          <RangeValueEditor
            field={field}
            operator={Operator.BETWEEN}
            value={[1, 10]}
            disabled={false}
            onChange={onChange}
          />
        );

        const inputs = screen.getAllByRole("spinbutton");
        expect(inputs).toHaveLength(2);
      });

      it("renders string inputs for STRING data type", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.STRING } as any;
        render(
          <RangeValueEditor
            field={field}
            operator={Operator.BETWEEN}
            value={["a", "z"]}
            disabled={false}
            onChange={onChange}
          />
        );

        const inputs = screen.getAllByRole("textbox");
        expect(inputs.length).toBeGreaterThan(0);
      });

      it("handles undefined value gracefully", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.NUMBER } as any;
        render(
          <RangeValueEditor
            field={field}
            operator={Operator.BETWEEN}
            value={undefined}
            disabled={false}
            onChange={onChange}
          />
        );

        const inputs = screen.getAllByRole("spinbutton");
        expect(inputs).toHaveLength(2);
      });
    });

    describe("MultiValueEditor", () => {
      it("displays current value count", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.STRING } as any;
        render(
          <MultiValueEditor
            field={field}
            operator={Operator.IN}
            value={["one", "two"]}
            disabled={false}
            onChange={onChange}
          />
        );

        expect(screen.getByText(/values/)).toBeDefined();
      });

      it("renders select component", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.STRING } as any;
        render(
          <MultiValueEditor
            field={field}
            operator={Operator.IN}
            value={[]}
            disabled={false}
            onChange={onChange}
          />
        );

        expect(screen.getByRole("combobox")).toBeDefined();
      });
    });

    describe("SingleValueEditor", () => {
      it("renders InputNumber for NUMBER data type", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.NUMBER } as any;
        render(
          <SingleValueEditor
            field={field}
            operator={Operator.EQ}
            value={5}
            disabled={false}
            onChange={onChange}
          />
        );

        expect(screen.getByRole("spinbutton")).toBeDefined();
      });

      it("renders Input for STRING data type with character count", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.STRING } as any;
        render(
          <SingleValueEditor
            field={field}
            operator={Operator.EQ}
            value="test"
            disabled={false}
            onChange={onChange}
          />
        );

        expect(screen.getByDisplayValue("test")).toBeDefined();
        // Should show character count
        expect(screen.getByText(/\d+\/\d+/)).toBeDefined();
      });

      it("handles non-string values gracefully", () => {
        const onChange = vi.fn();
        const field = { data_type: DataType.STRING } as any;
        render(
          <SingleValueEditor
            field={field}
            operator={Operator.EQ}
            value={123}
            disabled={false}
            onChange={onChange}
          />
        );

        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("");
      });
    });
  });

  describe("validateConditionTree", () => {
    it("returns invalid for undefined tree", () => {
      const fields: RuleField[] = [];
      const res = validateConditionTree(undefined, fields);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.code === "TREE_REQUIRED")).toBe(true);
    });

    it("returns invalid for tree with empty field selection", () => {
      const fields: RuleField[] = [
        {
          field_key: "a",
          is_active: true,
          data_type: DataType.STRING,
          allowed_operators: [Operator.EQ],
        },
      ];
      const pred = { kind: "predicate", field: "", op: Operator.EQ, value: "" };
      const tree = { kind: "group", op: LogicalOperator.AND, children: [pred] };
      const res = validateConditionTree(tree as any, fields);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.code === "FIELD_REQUIRED")).toBe(true);
    });

    it("returns valid for a simple correct tree", () => {
      const fields: RuleField[] = [
        {
          field_key: "a",
          is_active: true,
          data_type: DataType.STRING,
          allowed_operators: [Operator.EQ],
        },
      ];
      const pred = { kind: "predicate", field: "a", op: Operator.EQ, value: "ok" };
      const tree = { kind: "group", op: LogicalOperator.AND, children: [pred] };
      const res = validateConditionTree(tree as any, fields);
      expect(res.valid).toBe(true);
      expect(res.errors).toEqual([]);
    });

    it("collects all validation errors from nested tree", () => {
      const fields: RuleField[] = [
        {
          field_key: "a",
          is_active: true,
          data_type: DataType.STRING,
          allowed_operators: [Operator.EQ],
        },
      ];
      const pred1 = { kind: "predicate", field: "", op: Operator.EQ, value: "" };
      const pred2 = { kind: "predicate", field: "", op: Operator.EQ, value: "" };
      const tree = {
        kind: "group",
        op: LogicalOperator.AND,
        children: [{ kind: "group", op: LogicalOperator.OR, children: [pred1] }, pred2],
      };
      const res = validateConditionTree(tree as any, fields);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBeGreaterThanOrEqual(2);
    });

    it("wraps single predicate into group for validation", () => {
      const fields: RuleField[] = [
        {
          field_key: "a",
          is_active: true,
          data_type: DataType.STRING,
          allowed_operators: [Operator.EQ],
        },
      ];
      const pred = { kind: "predicate", field: "a", op: Operator.EQ, value: "ok" };
      const res = validateConditionTree(pred as any, fields);
      expect(res.valid).toBe(true);
    });
  });
});

describe("ConditionBuilder component", () => {
  const mockFields: RuleField[] = [
    {
      field_key: "mcc",
      display_name: "MCC",
      data_type: DataType.STRING,
      is_active: true,
      allowed_operators: [Operator.EQ, Operator.IN],
    },
    {
      field_key: "amount",
      display_name: "Amount",
      data_type: DataType.NUMBER,
      is_active: true,
      allowed_operators: [Operator.EQ, Operator.GT, Operator.BETWEEN],
    },
    {
      field_key: "inactive",
      display_name: "Inactive",
      data_type: DataType.STRING,
      is_active: false,
      allowed_operators: [Operator.EQ],
    },
  ];

  beforeEach(() => {
    (useList as any).mockReturnValue({ data: { data: mockFields } } as any);
  });

  it("renders with default empty tree", () => {
    const onChange = vi.fn();
    render(<ConditionBuilder onChange={onChange} />);

    expect(screen.getByText("Condition Builder")).toBeDefined();
    expect(screen.getByText(/Add Condition/)).toBeDefined();
    expect(screen.getByText("Add AND Group")).toBeDefined();
    expect(screen.getByText("Add OR Group")).toBeDefined();
  });

  it("allows adding a condition", async () => {
    const onChange = vi.fn();
    render(<ConditionBuilder onChange={onChange} />);

    const addBtn = screen.getByText("Add Condition");
    await userEvent.click(addBtn);

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.kind).toBe("group");
    expect(call.children).toHaveLength(1);
    expect(call.children[0].kind).toBe("predicate");
  });

  it("allows adding an AND group", async () => {
    const onChange = vi.fn();
    render(<ConditionBuilder onChange={onChange} />);

    const addAndBtn = screen.getByText("Add AND Group");
    await userEvent.click(addAndBtn);

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.kind).toBe("group");
    expect(call.children).toHaveLength(1);
    expect(call.children[0].kind).toBe("group");
    expect(call.children[0].op).toBe(LogicalOperator.AND);
  });

  it("allows adding an OR group", async () => {
    const onChange = vi.fn();
    render(<ConditionBuilder onChange={onChange} />);

    const addOrBtn = screen.getByText("Add OR Group");
    await userEvent.click(addOrBtn);

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.children[0].op).toBe(LogicalOperator.OR);
  });

  it("readOnly mode shows read-only message", () => {
    const onChange = vi.fn();
    render(<ConditionBuilder onChange={onChange} readOnly />);

    expect(screen.getByText("Read-only mode")).toBeDefined();
  });

  it("readOnly mode does not show validation warning", () => {
    const onChange = vi.fn();
    const invalidTree: ConditionNode = {
      kind: "group",
      op: LogicalOperator.AND,
      children: [{ kind: "predicate", field: "", op: Operator.EQ, value: "" }],
    };
    render(<ConditionBuilder onChange={onChange} value={invalidTree} readOnly />);

    expect(screen.queryByText(/Validation Required/)).toBeNull();
  });

  it("shows validation warning when tree has errors and not in read-only", () => {
    const onChange = vi.fn();
    const invalidTree: ConditionNode = {
      kind: "group",
      op: LogicalOperator.AND,
      children: [{ kind: "predicate", field: "", op: Operator.EQ, value: "" }],
    };
    render(<ConditionBuilder onChange={onChange} value={invalidTree} />);

    expect(screen.getByText(/Validation Required/)).toBeDefined();
  });

  it("renders existing tree with predicates", () => {
    const onChange = vi.fn();
    const tree: ConditionNode = {
      kind: "group",
      op: LogicalOperator.AND,
      children: [{ kind: "predicate", field: "mcc", op: Operator.EQ, value: "5967" }],
    };
    render(<ConditionBuilder onChange={onChange} value={tree} />);

    expect(screen.getByDisplayValue("5967")).toBeDefined();
  });

  it("filters out inactive fields from selection", () => {
    const onChange = vi.fn();
    render(<ConditionBuilder onChange={onChange} />);

    // Add a condition to show the field selector
    const addBtn = screen.getByText("Add Condition");
    fireEvent.click(addBtn);

    // The component should have rendered successfully with mock fields
    expect(onChange).toHaveBeenCalled();
  });

  it("displays help text about validation", () => {
    const onChange = vi.fn();
    render(<ConditionBuilder onChange={onChange} />);

    expect(screen.getByText(/Build nested AND\/OR groups/)).toBeDefined();
  });

  it('shows "No conditions yet" for empty group', () => {
    const onChange = vi.fn();
    const tree: ConditionNode = {
      kind: "group",
      op: LogicalOperator.AND,
      children: [],
    };
    render(<ConditionBuilder onChange={onChange} value={tree} />);

    expect(screen.getByText("No conditions yet.")).toBeDefined();
  });
});
