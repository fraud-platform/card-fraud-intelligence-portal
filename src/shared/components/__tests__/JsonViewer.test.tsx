import React from "react";
import { render } from "@testing-library/react";
import { JsonViewer } from "../JsonViewer";

describe("JsonViewer component", () => {
  it("renders raw JSON without title in a simple container", () => {
    const { container, getByText } = render(<JsonViewer data={{ a: 1 }} copyable={false} />);
    expect(getByText(/"a": 1/)).toBeTruthy();
    // when no title given, should not render AntD Card header
    expect(container.querySelector(".ant-card")).toBeFalsy();
  });

  it("renders inside a Card when title provided", () => {
    const { container } = render(<JsonViewer data={{ a: 1 }} title="T" />);
    // AntD Card should be present
    expect(container.querySelector(".ant-card")).toBeTruthy();
  });
});
