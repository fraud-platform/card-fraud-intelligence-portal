import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("../../app/auth0Client", () => ({
  isAuth0Enabled: vi.fn(),
}));

vi.mock("@refinedev/core", () => ({
  useLogin: vi.fn(),
}));

import { isAuth0Enabled } from "../../app/auth0Client";
import { useLogin } from "@refinedev/core";
import LoginPage from "../Login";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Auth0 button when Auth0 is enabled and calls login with returnTo", () => {
    (isAuth0Enabled as any).mockReturnValue(true);
    const mutate = vi.fn();
    (useLogin as any).mockReturnValue({ mutate, isPending: false });

    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /Continue with Google Workspace/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google Workspace/i }));

    expect(mutate).toHaveBeenCalledWith({ returnTo: "/" });
  });

  it("renders role form when Auth0 is disabled and submits values", async () => {
    (isAuth0Enabled as any).mockReturnValue(false);
    const mutate = vi.fn();
    (useLogin as any).mockReturnValue({ mutate, isPending: false });

    const { container } = render(<LoginPage />);

    // Ensure Role checkboxes and username input are present
    expect(screen.getByRole("checkbox", { name: /Rule Maker/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();

    // Fill in username and select Roles
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "alice" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Rule Checker/i }));

    // Submit the form directly to ensure it triggers AntD form handlers
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    // Expect login to be called with username and roles array
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const calledWith = (mutate as any).mock.calls[0][0];
    expect(calledWith).toMatchObject({
      username: expect.any(String),
      roles: expect.arrayContaining([expect.any(String)]),
    });
  });
});
