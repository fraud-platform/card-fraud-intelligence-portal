import React from "react";
import { screen } from "@/test/utils";
import { customRender, userEvent } from "@/test/utils";
import { vi } from "vitest";

vi.mock("@refinedev/core", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGetIdentity: vi.fn(),
    useLogout: vi.fn(),
  };
});

import { useGetIdentity, useLogout } from "@refinedev/core";
import Header from "../Header";

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user display name and role badge", () => {
    (useGetIdentity as any).mockReturnValue({
      data: { display_name: "Jane Doe", username: "jdoe", roles: ["RULE_CHECKER"] },
    });
    (useLogout as any).mockReturnValue({ mutate: vi.fn(), isLoading: false });

    customRender(<Header />);

    // Display name is visible in the header
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    // Role badge shows primary role (system role)
    expect(screen.getByText("Rule Checker")).toBeInTheDocument();
  });

  it("calls logout when logout menu item is clicked", async () => {
    const mutate = vi.fn();
    (useGetIdentity as any).mockReturnValue({
      data: { display_name: "Jane Doe", username: "jdoe", roles: ["RULE_CHECKER"] },
    });
    (useLogout as any).mockReturnValue({ mutate, isLoading: false });

    customRender(<Header />);

    const user = userEvent.setup();

    // Click the header button to open the dropdown
    await user.click(screen.getByText("Jane Doe"));

    // Click the logout menu item
    const logout = await screen.findByText("Logout");
    await user.click(logout);

    expect(mutate).toHaveBeenCalled();
  });
});
