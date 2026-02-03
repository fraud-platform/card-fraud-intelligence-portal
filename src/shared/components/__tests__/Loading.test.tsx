import { render, screen } from "@testing-library/react";
import React from "react";
import { Loading } from "../Loading";

describe("Loading", () => {
  it("renders message when provided and centers fullPage", () => {
    render(<Loading message="Loading data" fullPage />);

    expect(screen.getByText("Loading data")).toBeInTheDocument();

    const parent = screen.getByText("Loading data").parentElement?.parentElement;
    // fullPage wrapper should have fixed positioning and use the app-loading-fullpage class
    expect(parent).toBeTruthy();
    expect(parent).toHaveClass("app-loading-fullpage");
  });

  it("does not render message when message is empty or undefined", () => {
    const { rerender } = render(<Loading />);
    expect(screen.queryByText("Loading data")).not.toBeInTheDocument();

    rerender(<Loading message="" />);
    expect(screen.queryByText("Loading data")).not.toBeInTheDocument();
  });
});
