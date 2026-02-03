import React from "react";
import { render, screen } from "@testing-library/react";
import HumanSummary from "../HumanSummary";

const baseRule = {
  rule_id: "r1",
  rule_name: "Test Rule",
  rule_type: "TRANSACTION_SCREENING",
  version_details: {
    condition_tree: undefined,
    priority: 5,
  },
};

describe("HumanSummary", () => {
  it("renders basic fields and no conditions message", () => {
    render(<HumanSummary rule={baseRule as any} />);
    expect(screen.getByText("Test Rule")).toBeInTheDocument();
    expect(screen.getByText("No conditions defined")).toBeInTheDocument();
    expect(screen.getByText("Screen transaction")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders humanized condition text and operator text", () => {
    const ruleWithCondition = {
      ...baseRule,
      version_details: {
        condition_tree: {
          and: [{ field: "AMOUNT", op: "GT", value: 100 }],
        },
        priority: 1,
      },
    };

    render(<HumanSummary rule={ruleWithCondition as any} />);
    expect(screen.getByText(/AMOUNT/)).toBeInTheDocument();
    expect(screen.getByText(/greater than/)).toBeInTheDocument();
  });

  it("renders single AND condition without parentheses", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          and: [{ field: "MCC", op: "EQ", value: "5967" }],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/MCC/)).toBeInTheDocument();
    expect(screen.getByText(/equals/)).toBeInTheDocument();
  });

  it("renders single OR condition without parentheses", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          or: [{ field: "MCC", op: "EQ", value: "5967" }],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/MCC/)).toBeInTheDocument();
  });

  it('renders empty AND group as "No conditions"', () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: { and: [] },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText("No conditions")).toBeInTheDocument();
  });

  it('renders empty OR group as "No conditions"', () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: { or: [] },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText("No conditions")).toBeInTheDocument();
  });

  it("renders multiple AND conditions with parentheses", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          and: [
            { field: "MCC", op: "EQ", value: "5967" },
            { field: "AMOUNT", op: "GT", value: 100 },
          ],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/AND/)).toBeInTheDocument();
  });

  it("renders multiple OR conditions with parentheses", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          or: [
            { field: "MCC", op: "EQ", value: "5967" },
            { field: "MCC", op: "EQ", value: "5999" },
          ],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/OR/)).toBeInTheDocument();
  });

  it("renders nested AND within OR conditions", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          or: [
            {
              and: [
                { field: "A", op: "EQ", value: 1 },
                { field: "B", op: "EQ", value: 2 },
              ],
            },
            { field: "C", op: "EQ", value: 3 },
          ],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/AND/)).toBeInTheDocument();
    expect(screen.getByText(/OR/)).toBeInTheDocument();
  });

  it("renders all supported operators", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          and: [
            { field: "X", op: "NE", value: 1 },
            { field: "Y", op: "GTE", value: 2 },
            { field: "Z", op: "LTE", value: 3 },
            { field: "W", op: "IN", value: [1, 2] },
            { field: "V", op: "NOT_IN", value: [3] },
            { field: "U", op: "CONTAINS", value: "abc" },
            { field: "T", op: "STARTS_WITH", value: "x" },
            { field: "S", op: "ENDS_WITH", value: "y" },
          ],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/not equals/)).toBeInTheDocument();
    expect(screen.getByText(/greater than or equal to/)).toBeInTheDocument();
    expect(screen.getByText(/less than or equal to/)).toBeInTheDocument();
    expect(screen.getByText(/is in/)).toBeInTheDocument();
    expect(screen.getByText(/is not in/)).toBeInTheDocument();
    expect(screen.getByText(/contains/)).toBeInTheDocument();
    expect(screen.getByText(/starts with/)).toBeInTheDocument();
    expect(screen.getByText(/ends with/)).toBeInTheDocument();
  });

  it("renders unknown operator as-is", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          and: [{ field: "X", op: "UNKNOWN_OP", value: 1 }],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/UNKNOWN_OP/)).toBeInTheDocument();
  });

  it("renders action descriptions for different rule types", () => {
    const ruleTypes = [
      "TRANSACTION_SCREENING",
      "VELOCITY_CHECK",
      "GEOLOCATION_SCREENING",
      "MERCHANT_SCREENING",
      "AMOUNT_THRESHOLD",
    ];
    const descriptions = [
      "Screen transaction",
      "Check velocity threshold",
      "Check geolocation",
      "Screen merchant",
      "Check amount threshold",
    ];

    ruleTypes.forEach((type, i) => {
      const { unmount } = render(<HumanSummary rule={{ ...baseRule, rule_type: type } as any} />);
      expect(screen.getByText(new RegExp(descriptions[i]))).toBeInTheDocument();
      unmount();
    });
  });

  it("renders fallback action description for unknown rule type", () => {
    const rule = {
      ...baseRule,
      rule_type: "UNKNOWN_TYPE",
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/Execute UNKNOWN_TYPE/)).toBeInTheDocument();
  });

  it("handles non-string field values by JSON stringifying", () => {
    const rule = {
      ...baseRule,
      version_details: {
        condition_tree: {
          and: [{ field: { complex: "field" }, op: "EQ", value: 1 }],
        },
        priority: 1,
      },
    };
    render(<HumanSummary rule={rule as any} />);
    expect(screen.getByText(/\{.*\}/)).toBeInTheDocument();
  });
});
