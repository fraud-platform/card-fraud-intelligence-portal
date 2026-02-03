/**
 * ProtectedRoute Component
 *
 * Route wrapper component that enforces role-based and permission-based access control.
 * Integrates with Refine's Authenticated component and custom useRoles/usePermissions hooks.
 *
 * @example
 * ```tsx
 * // Require any of the specified roles
 * <ProtectedRoute roles={['RULE_MAKER', 'PLATFORM_ADMIN']}>
 *   <RuleCreate />
 * </ProtectedRoute>
 *
 * // Require all specified roles
 * <ProtectedRoute roles={['RULE_MAKER']} requireAll>
 *   <RuleEdit />
 * </ProtectedRoute>
 *
 * // Require specific permission
 * <ProtectedRoute permissions={['approve:rules']}>
 *   <ApprovalList />
 * </ProtectedRoute>
 *
 * // Combine roles and permissions (both must be satisfied)
 * <ProtectedRoute
 *   roles={['RULE_CHECKER']}
 *   permissions={['approve:rules']}
 * >
 *   <ApprovalShow />
 * </ProtectedRoute>
 * ```
 */

import { useEffect, useCallback, type ComponentType, type JSX, type ReactNode } from "react";
import { Authenticated } from "@refinedev/core";
import { useNavigate } from "react-router";
import { Result, Button } from "antd";
import { useRolesWithHelpers, type SystemRole } from "@/hooks/useRoles";
import { usePermissionsWithHelpers, type PermissionScope } from "@/hooks/usePermissions";

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
  /** Child components to render when authorized */
  children: ReactNode;
  /** Array of roles - user must have at least one (unless requireAll is true) */
  roles?: SystemRole[];
  /** If true, user must have ALL specified roles (default: false = any role) */
  requireAll?: boolean;
  /** Array of permission scopes required */
  permissions?: PermissionScope[];
  /** If true, user must have ALL specified permissions (default: false = any permission) */
  requireAllPermissions?: boolean;
  /** Fallback component to render when unauthorized (default: built-in error page) */
  fallback?: ReactNode;
  /** Redirect path when unauthorized (default: no redirect) */
  redirectTo?: string;
}

/**
 * Loading component for role/permission checks
 */
function LoadingFallback(): JSX.Element {
  return (
    <div className="centered-container">
      <div>Loading permissions...</div>
    </div>
  );
}

/**
 * Default unauthorized component
 */
function DefaultUnauthorized({ redirectTo }: { redirectTo?: string }): JSX.Element {
  const navigate = useNavigate();

  const handleBack = (): void => {
    if (redirectTo !== undefined && redirectTo !== "") {
      void navigate(redirectTo);
    } else {
      void navigate(-1);
    }
  };

  return (
    <div className="centered-container">
      <Result
        status="403"
        title="Access Denied"
        subTitle="You do not have permission to access this resource."
        extra={
          <Button type="primary" onClick={handleBack}>
            Go Back
          </Button>
        }
      />
    </div>
  );
}

/**
 * ProtectedRoute Component
 *
 * Wraps child components with role and permission-based access control.
 * Redirects or shows unauthorized message if checks fail.
 */
export function ProtectedRoute({
  children,
  roles,
  requireAll = false,
  permissions,
  requireAllPermissions = false,
  fallback,
  redirectTo,
}: ProtectedRouteProps): JSX.Element {
  const {
    roles: userRoles,
    hasAnyRole,
    hasAllRoles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useRolesWithHelpers();

  const {
    permissions: userPermissions,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = usePermissionsWithHelpers();

  const navigate = useNavigate();

  /**
   * Check if user has required roles
   */
  const checkRoleAccess = useCallback((): boolean => {
    if (roles === undefined || roles.length === 0) {
      return true; // No role requirement
    }

    if (requireAll) {
      return hasAllRoles(roles);
    }
    return hasAnyRole(roles);
  }, [roles, requireAll, hasAllRoles, hasAnyRole]);

  /**
   * Check if user has required permissions
   */
  const checkPermissionAccess = useCallback((): boolean => {
    if (permissions === undefined || permissions.length === 0) {
      return true; // No permission requirement
    }

    if (requireAllPermissions) {
      return hasAllPermissions(permissions);
    }
    return hasAnyPermission(permissions);
  }, [permissions, requireAllPermissions, hasAllPermissions, hasAnyPermission]);

  // Handle redirect when unauthorized

  useEffect(() => {
    if (!rolesLoading && !permissionsLoading) {
      const roleCheck = checkRoleAccess();
      const permissionCheck = checkPermissionAccess();

      if (!roleCheck || !permissionCheck) {
        if (redirectTo !== undefined && redirectTo !== "") {
          void navigate(redirectTo);
        }
      }
    }
  }, [
    rolesLoading,
    permissionsLoading,
    userRoles,
    userPermissions,
    roles,
    permissions,
    requireAll,
    requireAllPermissions,
    redirectTo,
    navigate,
    checkRoleAccess,
    checkPermissionAccess,
  ]);

  // Loading state
  if (rolesLoading === true || permissionsLoading === true) {
    return <LoadingFallback />;
  }

  // Error state
  if (rolesError !== null || permissionsError !== null) {
    return (
      <Result
        status="error"
        title="Authorization Error"
        subTitle="Failed to verify your permissions. Please try again."
      />
    );
  }

  // Authorization check
  const hasRoleAccess = checkRoleAccess();
  const hasPermissionAccess = checkPermissionAccess();

  if (hasRoleAccess === false || hasPermissionAccess === false) {
    if (fallback !== undefined && fallback !== null && fallback !== "" && fallback !== false) {
      return <>{fallback}</>;
    }
    return <DefaultUnauthorized redirectTo={redirectTo} />;
  }

  // User is authorized, render children wrapped in Authenticated
  return (
    <Authenticated key="protected-route" fallback={<LoadingFallback />}>
      {children as JSX.Element}
    </Authenticated>
  );
}

/**
 * Higher-order component version of ProtectedRoute
 *
 * @example
 * ```tsx
 * const ProtectedRuleCreate = withProtection({
 *   roles: ['RULE_MAKER'],
 * })(RuleCreate);
 * ```
 */
export interface WithProtectionOptions {
  roles?: SystemRole[];
  requireAll?: boolean;
  permissions?: PermissionScope[];
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

/* eslint-disable react-refresh/only-export-components */
export function withProtection(options: WithProtectionOptions) {
  return function <P extends object>(Component: ComponentType<P>): ComponentType<P> {
    return function ProtectedComponent(props: P): JSX.Element {
      return (
        <ProtectedRoute {...options}>
          <Component {...props} />
        </ProtectedRoute>
      );
    };
  };
}

export default ProtectedRoute;
