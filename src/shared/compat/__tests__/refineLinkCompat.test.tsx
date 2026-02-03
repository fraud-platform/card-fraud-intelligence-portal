import React from "react";
import { render, screen } from "@/test/utils";
import { Link } from "@refinedev/core";

describe("refineLinkCompat shim", () => {
  it("does not forward `replace` prop to DOM anchors when no router is present", () => {
    render(
      <div>
        <Link data-testid="rl" href="/path" replace={false}>
          Click
        </Link>
      </div>
    );

    const anchor = screen.getByRole("link", { name: /Click/ });
    // Ensure `replace` is not present as an attribute on the rendered anchor
    expect(anchor.getAttribute("replace")).toBeNull();
  });
});
