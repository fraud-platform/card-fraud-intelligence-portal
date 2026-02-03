/**
 * Unit tests for useRoles hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRoles, useRolesWithHelpers } from "../useRoles";
import * as auth0Client from "@/app/auth0Client";
import * as authProvider from "@/app/authProvider";

// Mock the auth0Client module
vi.mock("@/app/auth0Client", () => ({
  isAuth0Enabled: vi.fn(),
  getRoles: vi.fn(),
  __test_forceAuth0Enabled: undefined,
  __test_setForceEnabled: vi.fn(),
}));

// Mock the authProvider module
vi.mock("@/app/authProvider", () => ({
  getCurrentUser: vi.fn(),
}));

describe("useRoles", () => {
  const mockIsAuth0Enabled = auth0Client.isAuth0Enabled as ReturnType<typeof vi.fn>;
  const mockGetRoles = auth0Client.getRoles as ReturnType<typeof vi.fn>;
  const mockGetCurrentUser = authProvider.getCurrentUser as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("in Auth0 mode", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(true);
    });

    it("should fetch roles from Auth0", async () => {
      const auth0Roles = ["RULE_MAKER", "RULE_VIEWER"];
      mockGetRoles.mockResolvedValue(auth0Roles);

      const { result } = renderHook(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetRoles).toHaveBeenCalledOnce();
      expect(result.current.roles).toEqual(auth0Roles);
      expect(result.current.systemRoles).toEqual(auth0Roles);
    });

    it("should filter out non-system roles from systemRoles", async () => {
      const auth0Roles = ["RULE_MAKER", "legacy_maker", "RULE_CHECKER"];
      mockGetRoles.mockResolvedValue(auth0Roles);

      const { result } = renderHook(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual(auth0Roles);
      expect(result.current.systemRoles).toEqual(["RULE_MAKER", "RULE_CHECKER"]);
    });

    it("should handle empty roles array", async () => {
      mockGetRoles.mockResolvedValue([]);

      const { result } = renderHook(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual([]);
      expect(result.current.systemRoles).toEqual([]);
    });

    it("should handle error when fetching roles fails", async () => {
      const error = new Error("Network error");
      mockGetRoles.mockRejectedValue(error);

      const { result } = renderHook(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.roles).toEqual([]);
    });
  });

  describe("in development mode", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(false);
    });

    it("should fetch roles from sessionStorage for maker user", async () => {
      const mockUser = {
        user_id: "user-123",
        username: "testuser",
        display_name: "Test User",
        roles: ["RULE_MAKER"] as const,
        email: "test@example.com",
      };
      mockGetCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetCurrentUser).toHaveBeenCalledOnce();
      expect(result.current.roles).toEqual(["RULE_MAKER"]);
      expect(result.current.systemRoles).toEqual(["RULE_MAKER"]);
    });

    it("should fetch roles from sessionStorage for checker user", async () => {
      const mockUser = {
        user_id: "user-456",
        username: "checkeruser",
        display_name: "Checker User",
        roles: ["RULE_CHECKER"] as const,
        email: "checker@example.com",
      };
      mockGetCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual(["RULE_CHECKER"]);
      expect(result.current.systemRoles).toEqual(["RULE_CHECKER"]);
    });

    it("should handle no user in sessionStorage", async () => {
      mockGetCurrentUser.mockReturnValue(null);

      const { result } = renderHook(() => useRoles());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.roles).toEqual([]);
      expect(result.current.systemRoles).toEqual([]);
    });
  });
});

describe("useRolesWithHelpers", () => {
  const mockIsAuth0Enabled = auth0Client.isAuth0Enabled as ReturnType<typeof vi.fn>;
  const mockGetRoles = auth0Client.getRoles as ReturnType<typeof vi.fn>;
  const mockGetCurrentUser = authProvider.getCurrentUser as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("in Auth0 mode", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(true);
    });

    it("should provide hasRole helper function", async () => {
      mockGetRoles.mockResolvedValue(["RULE_MAKER", "RULE_VIEWER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasRole("RULE_MAKER")).toBe(true);
      expect(result.current.hasRole("RULE_CHECKER")).toBe(false);
      expect(result.current.hasRole("RULE_VIEWER")).toBe(true);
    });

    it("should provide hasAnyRole helper function", async () => {
      mockGetRoles.mockResolvedValue(["RULE_MAKER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasAnyRole(["RULE_MAKER", "RULE_CHECKER"])).toBe(true);
      expect(result.current.hasAnyRole(["RULE_CHECKER", "PLATFORM_ADMIN"])).toBe(false);
    });

    it("should provide hasAllRoles helper function", async () => {
      mockGetRoles.mockResolvedValue(["RULE_MAKER", "RULE_VIEWER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasAllRoles(["RULE_MAKER", "RULE_VIEWER"])).toBe(true);
      expect(result.current.hasAllRoles(["RULE_MAKER", "RULE_CHECKER"])).toBe(false);
    });

    it("should provide isPlatformAdmin check", async () => {
      mockGetRoles.mockResolvedValue(["PLATFORM_ADMIN"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPlatformAdmin).toBe(true);
      expect(result.current.isRuleMaker).toBe(true); // Admin inherits all
    });

    it("should provide isRuleMaker check", async () => {
      mockGetRoles.mockResolvedValue(["RULE_MAKER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isRuleMaker).toBe(true);
      expect(result.current.isRuleChecker).toBe(false);
      expect(result.current.isPlatformAdmin).toBe(false);
    });

    it("should provide isRuleChecker check", async () => {
      mockGetRoles.mockResolvedValue(["RULE_CHECKER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isRuleChecker).toBe(true);
      expect(result.current.isRuleMaker).toBe(false);
    });

    it("should provide isRuleViewer check", async () => {
      mockGetRoles.mockResolvedValue(["RULE_VIEWER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isRuleViewer).toBe(true);
      expect(result.current.isRuleMaker).toBe(false);
    });

    it("should provide isFraudAnalyst check", async () => {
      mockGetRoles.mockResolvedValue(["FRAUD_ANALYST"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFraudAnalyst).toBe(true);
      expect(result.current.isFraudSupervisor).toBe(false);
      expect(result.current.isRuleMaker).toBe(false);
    });

    it("should provide isFraudSupervisor check with inherited analyst role", async () => {
      mockGetRoles.mockResolvedValue(["FRAUD_SUPERVISOR"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFraudSupervisor).toBe(true);
      expect(result.current.isFraudAnalyst).toBe(true); // Inherits analyst
    });

    it("should support role hierarchy: RULE_MAKER includes RULE_VIEWER", async () => {
      mockGetRoles.mockResolvedValue(["RULE_MAKER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isRuleMaker).toBe(true);
      expect(result.current.isRuleViewer).toBe(true); // Inherited
    });

    it("should support role hierarchy: RULE_CHECKER includes RULE_VIEWER", async () => {
      mockGetRoles.mockResolvedValue(["RULE_CHECKER"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isRuleChecker).toBe(true);
      expect(result.current.isRuleViewer).toBe(true); // Inherited
    });
  });

  describe("in development mode with legacy single-role sessions (unsupported)", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(false);
    });

    it("should not map legacy maker field; no capabilities granted", async () => {
      const mockUser = {
        user_id: "user-123",
        username: "testuser",
        display_name: "Test User",
        role: "maker" as const,
        email: "test@example.com",
      };
      mockGetCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Legacy single-role sessions are unsupported; expect no capabilities
      expect(result.current.isMaker).toBe(false);
      expect(result.current.isRuleMaker).toBe(false);
      expect(result.current.isRuleViewer).toBe(false);
    });

    it("should not map legacy checker field; no capabilities granted", async () => {
      const mockUser = {
        user_id: "user-456",
        username: "checkeruser",
        display_name: "Checker User",
        role: "checker" as const,
        email: "checker@example.com",
      };
      mockGetCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isChecker).toBe(false);
      expect(result.current.isRuleChecker).toBe(false);
      expect(result.current.isRuleViewer).toBe(false);
    });

    it("should have all legacy booleans false for viewer-like legacy field", async () => {
      const mockUser = {
        user_id: "user-789",
        username: "viewuser",
        display_name: "View User",
        role: "viewer" as const,
        email: "view@example.com",
      };
      mockGetCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isChecker).toBe(false);
      expect(result.current.isPlatformAdmin).toBe(false);
      expect(result.current.isFraudSupervisor).toBe(false);
    });
  });

  describe("PLATFORM_ADMIN role hierarchy", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(true);
    });

    it("should grant all role capabilities when user is PLATFORM_ADMIN", async () => {
      mockGetRoles.mockResolvedValue(["PLATFORM_ADMIN"]);

      const { result } = renderHook(() => useRolesWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Admin has all capabilities
      expect(result.current.isPlatformAdmin).toBe(true);
      expect(result.current.isRuleMaker).toBe(true);
      expect(result.current.isRuleChecker).toBe(true);
      expect(result.current.isRuleViewer).toBe(true);
      expect(result.current.isFraudAnalyst).toBe(true);
      expect(result.current.isFraudSupervisor).toBe(true);
    });
  });
});
