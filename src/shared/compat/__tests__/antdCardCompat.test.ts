import React from "react";
import { describe, it, expect } from "vitest";
import * as antd from "antd";

describe("antdCardCompat shim", () => {
  it('maps bordered: true to variant: "outlined" when variant is undefined', () => {
    const el = React.createElement(
      (antd as any).Card,
      { bordered: true, "data-testid": "card" },
      null
    ) as any;
    expect(el.props.variant).toBe("outlined");
    expect(el.props.bordered).toBeUndefined();
  });

  it("does not set variant when bordered is false", () => {
    const el = React.createElement((antd as any).Card, { bordered: false }, null) as any;
    expect(el.props.variant).toBeUndefined();
    expect(el.props.bordered).toBeUndefined();
  });

  it("preserves explicit variant prop", () => {
    const el = React.createElement((antd as any).Card, { variant: "outlined" }, null) as any;
    expect(el.props.variant).toBe("outlined");
  });
});
