/**
 * Unit tests for ProtectedRoute component
 */

import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ProtectedRoute, withProtection } from "../ProtectedRoute";
import * as useRolesModule from "@/hooks/useRoles";
import * as usePermissionsModule from "@/hooks/usePermissions";
import { Refine } from "@refinedev/core";
import { BrowserRouter } from "react-router";

// Mock the hooks
vi.mock("@/hooks/useRoles", () => ({
  useRolesWithHelpers: vi.fn(),
}));

vi.mock("@/hooks/usePermissions", () => ({
  usePermissionsWithHelpers: vi.fn(),
}));

// Mock Refine's useNavigate
vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...(actual as object),
    useNavigate: vi.fn(() => vi.fn()),
    Authenticated: ({ children, _fallback }: { children: ReactNode; _fallback?: ReactNode }) => {
      return <>{children}</>;
    },
  };
});

// Mock react-router's navigate for the component
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

describe("ProtectedRoute", () => {
  const mockUseRolesWithHelpers = vi.mocked(useRolesModule.useRolesWithHelpers);
  const mockUsePermissionsWithHelpers = vi.mocked(usePermissionsModule.usePermissionsWithHelpers);

  const defaultRolesMock = {
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
  };

  const defaultPermissionsMock = {
    permissions: [],
    capabilities: {
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
    },
    isLoading: false,
    error: null,
    hasPermission: vi.fn(() => false),
    hasAnyPermission: vi.fn(() => false),
    hasAllPermissions: vi.fn(() => false),
  };

  const TestComponent = () => <div>Protected Content</div>;

  function createWrapper() {
    return ({ children }: { children: ReactNode }) => (
      <BrowserRouter>
        <Refine
          dataProvider={{
            getList: () => Promise.resolve({ data: [], total: 0 }),
            getOne: () => Promise.resolve({ data: {} }),
            getMany: () => Promise.resolve({ data: [] }),
            create: () => Promise.resolve({ data: {} }),
            update: () => Promise.resolve({ data: {} }),
            deleteOne: () => Promise.resolve({ data: {} }),
            getApiUrl: () => "http://localhost:8000",
            custom: () => Promise.resolve({ data: {} }),
          }}
          authProvider={{
            login: () => Promise.resolve({ success: true }),
            logout: () => Promise.resolve({ success: true }),
            check: () => Promise.resolve({ authenticated: true }),
            getPermissions: () => Promise.resolve(["RULE_MAKER"] as any),
            getIdentity: () => Promise.resolve({ user_id: "test", roles: ["RULE_MAKER"] }),
            onError: () => Promise.resolve({}),
          }}
          options={{ disableTelemetry: true }}
        >
          {children}
        </Refine>
      </BrowserRouter>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockUseRolesWithHelpers.mockReturnValue(defaultRolesMock);
    mockUsePermissionsWithHelpers.mockReturnValue(defaultPermissionsMock);
  });

  describe("role-based access control", () => {
    it("should render children when user has required role", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_MAKER"],
        hasAnyRole: vi.fn(() => true),
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });

    it("should render children when user has any of the allowed roles", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_VIEWER"],
        hasAnyRole: vi.fn((roles) => roles.includes("RULE_VIEWER")),
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER", "RULE_VIEWER"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });

    it("should show unauthorized when user has no required role", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_VIEWER"],
        hasAnyRole: vi.fn(() => false),
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
      });
    });

    it("should require all roles when requireAll is true", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_MAKER"],
        hasAllRoles: vi.fn((roles) => roles.every((r) => r === "RULE_MAKER")),
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER", "RULE_VIEWER"]} requireAll>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      });
    });

    it("should allow when user has all required roles", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_MAKER", "RULE_VIEWER"],
        hasAllRoles: vi.fn(() => true),
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER", "RULE_VIEWER"]} requireAll>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });
  });

  describe("permission-based access control", () => {
    it("should render children when user has required permission", async () => {
      mockUsePermissionsWithHelpers.mockReturnValue({
        ...defaultPermissionsMock,
        permissions: ["create:rules"],
        hasAnyPermission: vi.fn(() => true),
      });

      render(
        <ProtectedRoute permissions={["create:rules"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });

    it("should show unauthorized when user lacks required permission", async () => {
      mockUsePermissionsWithHelpers.mockReturnValue({
        ...defaultPermissionsMock,
        permissions: ["read:rules"],
        hasAnyPermission: vi.fn(() => false),
      });

      render(
        <ProtectedRoute permissions={["create:rules"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
      });
    });

    it("should require all permissions when requireAllPermissions is true", async () => {
      mockUsePermissionsWithHelpers.mockReturnValue({
        ...defaultPermissionsMock,
        permissions: ["create:rules"],
        hasAllPermissions: vi.fn(() => false),
      });

      render(
        <ProtectedRoute permissions={["create:rules", "approve:rules"]} requireAllPermissions>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      });
    });
  });

  describe("combined role and permission checks", () => {
    it("should require both role and permission when both specified", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_CHECKER"],
        hasAnyRole: vi.fn(() => true),
      });
      mockUsePermissionsWithHelpers.mockReturnValue({
        ...defaultPermissionsMock,
        permissions: ["read:rules"],
        hasAnyPermission: vi.fn(() => false),
      });

      render(
        <ProtectedRoute roles={["RULE_CHECKER"]} permissions={["approve:rules"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      });
    });

    it("should allow when both role and permission are satisfied", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_CHECKER"],
        hasAnyRole: vi.fn(() => true),
      });
      mockUsePermissionsWithHelpers.mockReturnValue({
        ...defaultPermissionsMock,
        permissions: ["approve:rules"],
        hasAnyPermission: vi.fn(() => true),
      });

      render(
        <ProtectedRoute roles={["RULE_CHECKER"]} permissions={["approve:rules"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });
  });

  describe("loading state", () => {
    it("should show loading while roles are loading", () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        isLoading: true,
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText("Loading permissions...")).toBeInTheDocument();
    });

    it("should show loading while permissions are loading", () => {
      mockUsePermissionsWithHelpers.mockReturnValue({
        ...defaultPermissionsMock,
        isLoading: true,
      });

      render(
        <ProtectedRoute permissions={["create:rules"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText("Loading permissions...")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("should show error when roles check fails", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        error: new Error("Auth error"),
        isLoading: false,
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Authorization Error")).toBeInTheDocument();
      });
    });

    it("should show error when permissions check fails", async () => {
      mockUsePermissionsWithHelpers.mockReturnValue({
        ...defaultPermissionsMock,
        error: new Error("Permission error"),
        isLoading: false,
      });

      render(
        <ProtectedRoute permissions={["create:rules"]}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Authorization Error")).toBeInTheDocument();
      });
    });
  });

  describe("fallback prop", () => {
    it("should render custom fallback when unauthorized", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_VIEWER"],
        hasAnyRole: vi.fn(() => false),
      });

      const CustomFallback = () => <div>Custom Unauthorized</div>;

      render(
        <ProtectedRoute roles={["RULE_MAKER"]} fallback={<CustomFallback />}>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Custom Unauthorized")).toBeInTheDocument();
        expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
      });
    });
  });

  describe("redirectTo prop", () => {
    it("should not redirect when authorized", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_MAKER"],
        hasAnyRole: vi.fn(() => true),
      });

      render(
        <ProtectedRoute roles={["RULE_MAKER"]} redirectTo="/login">
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("withProtection HOC", () => {
    it("should create a protected component", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_MAKER"],
        hasAnyRole: vi.fn(() => true),
      });

      const ProtectedComponent = withProtection({
        roles: ["RULE_MAKER"],
      })(TestComponent);

      render(<ProtectedComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });

    it("should create a protected component that denies access", async () => {
      mockUseRolesWithHelpers.mockReturnValue({
        ...defaultRolesMock,
        roles: ["RULE_VIEWER"],
        hasAnyRole: vi.fn(() => false),
      });

      const ProtectedComponent = withProtection({
        roles: ["RULE_MAKER"],
      })(TestComponent);

      render(<ProtectedComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      });
    });
  });

  describe("no restrictions", () => {
    it("should render children when no roles or permissions specified", async () => {
      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });
  });
});
