/**
 * Unit tests for usePermissions hook
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePermissions, usePermissionsWithHelpers, type PermissionScope } from "../usePermissions";
import * as auth0Client from "@/app/auth0Client";
import * as useRolesModule from "../useRoles";

// Mock the auth0Client module
vi.mock("@/app/auth0Client", () => ({
  isAuth0Enabled: vi.fn(),
  getAccessTokenScopes: vi.fn(),
}));

// Mock the useRoles hook
vi.mock("../useRoles", () => ({
  useRolesWithHelpers: vi.fn(),
}));

describe("usePermissions", () => {
  const mockIsAuth0Enabled = auth0Client.isAuth0Enabled as ReturnType<typeof vi.fn>;
  const mockGetAccessTokenScopes = auth0Client.getAccessTokenScopes as ReturnType<typeof vi.fn>;
  const mockUseRolesWithHelpers = vi.mocked(useRolesModule.useRolesWithHelpers);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useRolesWithHelpers
    mockUseRolesWithHelpers.mockReturnValue({
      roles: [],
      systemRoles: [],
      isLoading: false,
      error: null,
      hasRole: vi.fn(() => false),
      hasAnyRole: vi.fn(() => false),
      hasAllRoles: vi.fn(() => false),
      isPlatformAdmin: false,
      isRuleMaker: false,
      isRuleChecker: false,
      isRuleViewer: false,
      isFraudAnalyst: false,
      isFraudSupervisor: false,
      isMaker: false,
      isChecker: false,
    });
  });

  describe("in Auth0 mode", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(true);
    });

    it("should fetch permissions from Auth0 access token", async () => {
      const scopes: PermissionScope[] = ["create:rules", "read:rules"];
      mockGetAccessTokenScopes.mockResolvedValue(scopes);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetAccessTokenScopes).toHaveBeenCalledOnce();
      expect(result.current.permissions).toEqual(scopes);
    });

    it("should map create:rules permission to canCreateRules capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["create:rules"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canCreateRules).toBe(true);
    });

    it("should map edit:rules permission to canEditRules capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["edit:rules"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canEditRules).toBe(true);
    });

    it("should map delete:rules permission to canDeleteRules capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["delete:rules"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canDeleteRules).toBe(true);
    });

    it("should map approve:rules permission to canApproveRules capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["approve:rules"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canApproveRules).toBe(true);
    });

    it("should map read:rules permission to canReadRules capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["read:rules"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canReadRules).toBe(true);
    });

    it("should map view:transactions permission to canViewTransactions capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["view:transactions"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canViewTransactions).toBe(true);
    });

    it("should map review:transactions permission to canReviewTransactions capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["review:transactions"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canReviewTransactions).toBe(true);
    });

    it("should map create:cases permission to canCreateCases capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["create:cases"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canCreateCases).toBe(true);
    });

    it("should map resolve:cases permission to canResolveCases capability", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["resolve:cases"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canResolveCases).toBe(true);
    });

    it("should map admin:all permission to all capabilities", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["admin:all"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities).toEqual({
        canCreateRules: true,
        canEditRules: true,
        canDeleteRules: true,
        canApproveRules: true,
        canReadRules: true,
        canViewTransactions: true,
        canReviewTransactions: true,
        canCreateCases: true,
        canResolveCases: true,
        isAdmin: true,
      });
    });

    it("should combine multiple permissions", async () => {
      mockGetAccessTokenScopes.mockResolvedValue(["create:rules", "edit:rules", "approve:rules"]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canCreateRules).toBe(true);
      expect(result.current.capabilities.canEditRules).toBe(true);
      expect(result.current.capabilities.canApproveRules).toBe(true);
      expect(result.current.capabilities.canDeleteRules).toBe(false);
    });

    it("should filter out unknown permission scopes", async () => {
      mockGetAccessTokenScopes.mockResolvedValue([
        "create:rules",
        "unknown:permission",
        "read:rules",
      ] as string[]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual(["create:rules", "read:rules"]);
    });

    it("should handle empty permissions", async () => {
      mockGetAccessTokenScopes.mockResolvedValue([]);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permissions).toEqual([]);
      expect(result.current.capabilities).toEqual({
        canCreateRules: false,
        canEditRules: false,
        canDeleteRules: false,
        canApproveRules: false,
        canReadRules: false,
        canViewTransactions: false,
        canReviewTransactions: false,
        canCreateCases: false,
        canResolveCases: false,
        isAdmin: false,
      });
    });

    it("should handle error when fetching permissions fails", async () => {
      const error = new Error("Network error");
      mockGetAccessTokenScopes.mockRejectedValue(error);

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.permissions).toEqual([]);
    });
  });

  describe("in development mode", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(false);
    });

    it("should use role-based fallback for maker role", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        roles: ["RULE_MAKER"],
        systemRoles: [],
        isLoading: false,
        error: null,
        hasRole: vi.fn(() => true),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        isPlatformAdmin: false,
        isRuleMaker: true,
        isRuleChecker: false,
        isRuleViewer: false,
        isFraudAnalyst: false,
        isFraudSupervisor: false,
        isMaker: true,
        isChecker: false,
      });

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities).toEqual({
        canCreateRules: true,
        canEditRules: true,
        canDeleteRules: true,
        canApproveRules: false,
        canReadRules: true,
        canViewTransactions: false,
        canReviewTransactions: false,
        canCreateCases: false,
        canResolveCases: false,
        isAdmin: false,
      });
    });

    it("should use role-based fallback for checker role", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        roles: ["RULE_CHECKER"],
        systemRoles: [],
        isLoading: false,
        error: null,
        hasRole: vi.fn(() => true),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        isPlatformAdmin: false,
        isRuleMaker: false,
        isRuleChecker: true,
        isRuleViewer: false,
        isFraudAnalyst: false,
        isFraudSupervisor: false,
        isMaker: false,
        isChecker: true,
      });

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities).toEqual({
        canCreateRules: false,
        canEditRules: false,
        canDeleteRules: false,
        canApproveRules: true,
        canReadRules: true,
        canViewTransactions: false,
        canReviewTransactions: false,
        canCreateCases: false,
        canResolveCases: false,
        isAdmin: false,
      });
    });

    it("should use role-based fallback for FRAUD_ANALYST role", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        roles: ["FRAUD_ANALYST"],
        systemRoles: ["FRAUD_ANALYST"],
        isLoading: false,
        error: null,
        hasRole: vi.fn(() => true),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        isPlatformAdmin: false,
        isRuleMaker: false,
        isRuleChecker: false,
        isRuleViewer: false,
        isFraudAnalyst: true,
        isFraudSupervisor: false,
        isMaker: false,
        isChecker: false,
      });

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canViewTransactions).toBe(true);
      expect(result.current.capabilities.canReviewTransactions).toBe(true);
      expect(result.current.capabilities.canCreateCases).toBe(true);
      expect(result.current.capabilities.canResolveCases).toBe(false);
    });

    it("should use role-based fallback for FRAUD_SUPERVISOR role", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        roles: ["FRAUD_SUPERVISOR"],
        systemRoles: ["FRAUD_SUPERVISOR"],
        isLoading: false,
        error: null,
        hasRole: vi.fn(() => true),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        isPlatformAdmin: false,
        isRuleMaker: false,
        isRuleChecker: false,
        isRuleViewer: false,
        isFraudAnalyst: false,
        isFraudSupervisor: true,
        isMaker: false,
        isChecker: false,
      });

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.canViewTransactions).toBe(true);
      expect(result.current.capabilities.canReviewTransactions).toBe(true);
      expect(result.current.capabilities.canCreateCases).toBe(true);
      expect(result.current.capabilities.canResolveCases).toBe(true);
    });

    it("should use role-based fallback for PLATFORM_ADMIN role", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        roles: ["PLATFORM_ADMIN"],
        systemRoles: ["PLATFORM_ADMIN"],
        isLoading: false,
        error: null,
        hasRole: vi.fn(() => true),
        hasAnyRole: vi.fn(() => true),
        hasAllRoles: vi.fn(() => true),
        isPlatformAdmin: true,
        isRuleMaker: true,
        isRuleChecker: true,
        isRuleViewer: true,
        isFraudAnalyst: true,
        isFraudSupervisor: true,
        isMaker: false,
        isChecker: false,
      });

      const { result } = renderHook(() => usePermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.capabilities.isAdmin).toBe(true);
      expect(result.current.capabilities.canCreateRules).toBe(true);
      expect(result.current.capabilities.canApproveRules).toBe(true);
      expect(result.current.capabilities.canResolveCases).toBe(true);
    });
  });
});

describe("usePermissionsWithHelpers", () => {
  const mockIsAuth0Enabled = auth0Client.isAuth0Enabled as ReturnType<typeof vi.fn>;
  const mockGetAccessTokenScopes = auth0Client.getAccessTokenScopes as ReturnType<typeof vi.fn>;
  const mockUseRolesWithHelpers = vi.mocked(useRolesModule.useRolesWithHelpers);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRolesWithHelpers.mockReturnValue({
      roles: [],
      systemRoles: [],
      isLoading: false,
      error: null,
      hasRole: vi.fn(() => false),
      hasAnyRole: vi.fn(() => false),
      hasAllRoles: vi.fn(() => false),
      isPlatformAdmin: false,
      isRuleMaker: false,
      isRuleChecker: false,
      isRuleViewer: false,
      isFraudAnalyst: false,
      isFraudSupervisor: false,
      isMaker: false,
      isChecker: false,
    });
  });

  describe("helper functions", () => {
    beforeEach(() => {
      mockIsAuth0Enabled.mockReturnValue(true);
    });

    it("should provide hasPermission helper function", async () => {
      const scopes: PermissionScope[] = ["create:rules", "read:rules"];
      mockGetAccessTokenScopes.mockResolvedValue(scopes);

      const { result } = renderHook(() => usePermissionsWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasPermission("create:rules")).toBe(true);
      expect(result.current.hasPermission("approve:rules")).toBe(false);
    });

    it("should provide hasAnyPermission helper function", async () => {
      const scopes: PermissionScope[] = ["create:rules"];
      mockGetAccessTokenScopes.mockResolvedValue(scopes);

      const { result } = renderHook(() => usePermissionsWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasAnyPermission(["create:rules", "approve:rules"])).toBe(true);
      expect(result.current.hasAnyPermission(["approve:rules", "delete:rules"])).toBe(false);
    });

    it("should provide hasAllPermissions helper function", async () => {
      const scopes: PermissionScope[] = ["create:rules", "edit:rules"];
      mockGetAccessTokenScopes.mockResolvedValue(scopes);

      const { result } = renderHook(() => usePermissionsWithHelpers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasAllPermissions(["create:rules", "edit:rules"])).toBe(true);
      expect(result.current.hasAllPermissions(["create:rules", "approve:rules"])).toBe(false);
    });
  });
});
