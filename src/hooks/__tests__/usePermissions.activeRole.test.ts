import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import * as auth0 from "@/app/auth0Client";
import * as rolesModule from "@/hooks/useRoles";
import { setActiveUserRole } from "@/app/authProvider";
import { usePermissions } from "../usePermissions";

vi.mock("@/hooks/useRoles");
vi.mock("@/app/auth0Client");

describe("usePermissions - active role and scope precedence", () => {
  beforeEach(() => {
    // Default: dev mode (Auth0 disabled)
    vi.mocked(auth0.isAuth0Enabled).mockReturnValue(false);
    vi.mocked(auth0.getAccessTokenScopes).mockResolvedValue([] as any);
    // Clear active role
    setActiveUserRole(null);
    // Keep test mocks in place; clear call counts but do not restore implementations
    vi.clearAllMocks();
  });

  afterEach(() => {
    setActiveUserRole(null);
    vi.resetAllMocks();
  });

  it("prefers active role capabilities when active_role is set", async () => {
    // User has two assigned roles
    const mockRoles = ["RULE_MAKER", "FRAUD_ANALYST"];
    vi.mocked(rolesModule.useRolesWithHelpers as any).mockReturnValue({
      roles: mockRoles,
      isLoading: false,
    } as any);

    // Set active role to fraud analyst
    act(() => setActiveUserRole("FRAUD_ANALYST"));

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => !result.current.isLoading, { timeout: 2000 });

    // Active role FRAUD_ANALYST should allow viewing and reviewing transactions
    expect(result.current.capabilities.canViewTransactions).toBe(true);
    expect(result.current.capabilities.canReviewTransactions).toBe(true);

    // FRAUD_ANALYST should not allow rule creation
    expect(result.current.capabilities.canCreateRules).toBe(false);

    // Switch active role to RULE_MAKER
    act(() => setActiveUserRole("RULE_MAKER"));

    await waitFor(() => result.current.capabilities.canCreateRules === true, { timeout: 2000 });

    expect(result.current.capabilities.canCreateRules).toBe(true);
    expect(result.current.capabilities.canApproveRules).toBe(false);
  });

  it("uses Auth0 scopes when Auth0 is enabled (scope precedence)", async () => {
    vi.mocked(auth0.isAuth0Enabled).mockReturnValue(true);
    vi.mocked(auth0.getAccessTokenScopes).mockResolvedValue(["admin:all"] as any);

    const mockRoles = ["RULE_MAKER"];
    vi.mocked(rolesModule.useRolesWithHelpers as any).mockReturnValue({
      roles: mockRoles,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => !result.current.isLoading, { timeout: 2000 });

    // Admin scope grants full capabilities regardless of active role
    expect(result.current.capabilities.isAdmin).toBe(true);
    expect(result.current.capabilities.canApproveRules).toBe(true);
    expect(result.current.capabilities.canCreateRules).toBe(true);
  });
});
