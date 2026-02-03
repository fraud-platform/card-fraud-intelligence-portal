/**
 * useRoles Hook
 *
 * Custom hook for managing user roles from Auth0 or development mode.
 * Supports the new role system with:
 * - PLATFORM_ADMIN
 * - RULE_MAKER
 * - RULE_CHECKER
 * - RULE_VIEWER
 * - FRAUD_ANALYST
 * - FRAUD_SUPERVISOR
 *
 * @example
 * ```tsx
 * const { roles, hasRole, isPlatformAdmin, isRuleMaker, isLoading } = useRoles();
 *
 * if (isLoading) return <Spin />;
 * if (!isRuleMaker) return <Alert message="Access denied" />;
 * ```
 */

import { useEffect, useState, useCallback } from "react";
import { getRoles as getAuth0Roles, isAuth0Enabled } from "@/app/auth0Client";
import { getCurrentUser } from "@/app/authProvider";

/**
 * All available user roles in the system
 */
export type SystemRole =
  | "PLATFORM_ADMIN"
  | "RULE_MAKER"
  | "RULE_CHECKER"
  | "RULE_VIEWER"
  | "FRAUD_ANALYST"
  | "FRAUD_SUPERVISOR";

/**
 * Role groups for hierarchical checking
 */
export const ROLE_GROUPS: Record<SystemRole, SystemRole[]> = {
  PLATFORM_ADMIN: [
    "PLATFORM_ADMIN",
    "RULE_MAKER",
    "RULE_CHECKER",
    "RULE_VIEWER",
    "FRAUD_ANALYST",
    "FRAUD_SUPERVISOR",
  ],
  RULE_MAKER: ["RULE_MAKER", "RULE_VIEWER"],
  RULE_CHECKER: ["RULE_CHECKER", "RULE_VIEWER"],
  RULE_VIEWER: ["RULE_VIEWER"],
  FRAUD_ANALYST: ["FRAUD_ANALYST"],
  FRAUD_SUPERVISOR: ["FRAUD_SUPERVISOR", "FRAUD_ANALYST"],
};

/**
 * Result object returned by useRoles hook
 */
export interface UseRolesResult {
  /** Array of roles returned from the authentication provider (may include legacy roles) */
  roles: string[];
  /** System roles (filter of `roles` to known SystemRole values) */
  systemRoles: SystemRole[];
  /** Whether the roles are still being loaded */
  isLoading: boolean;
  /** Any error that occurred while fetching roles */
  error: Error | null;
}

/**
 * Custom hook for fetching and managing user roles
 *
 * @returns UseRolesResult object containing roles and helper state
 */
export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const resolveDevRoles = (): SystemRole[] => {
      const user = getCurrentUser();
      // Development sessions should provide `roles: SystemRole[]` but be defensive and
      // only return values that are valid SystemRole entries.
      if (Array.isArray(user?.roles) && user.roles.length > 0) {
        return (user.roles as string[]).filter((r): r is SystemRole =>
          Object.keys(ROLE_GROUPS).includes(r)
        );
      }
      return [];
    };

    async function fetchRoles(): Promise<void> {
      setIsLoading(true);
      setError(null);

      let aborted = false;

      try {
        if (isAuth0Enabled()) {
          // Fetch roles from Auth0 ID token and normalize to known SystemRole values
          const auth0Roles = await getAuth0Roles();
          aborted = signal.aborted;
          if (!aborted) {
            // Keep the raw roles as returned by the provider (may include legacy roles)
            setRoles(auth0Roles ?? []);
          }
        } else {
          aborted = signal.aborted;
          // Development mode: get roles from sessionStorage
          if (!aborted) {
            setRoles(resolveDevRoles());
          }
        }
      } catch (err) {
        aborted = signal.aborted;
        const errorObj = err instanceof Error ? err : new Error("Failed to fetch roles");
        if (!aborted) {
          setError(errorObj);
          setRoles([]);
        }
      } finally {
        if (!aborted && !signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchRoles();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    roles,
    systemRoles: roles.filter((r): r is SystemRole => Object.keys(ROLE_GROUPS).includes(r)),
    isLoading,
    error,
  };
}

/**
 * Extended result object with helper functions for role checking
 */
export interface UseRolesWithHelpersResult extends UseRolesResult {
  /** Check if user has a specific role */
  hasRole: (role: SystemRole) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: SystemRole[]) => boolean;
  /** Check if user has all of the specified roles */
  hasAllRoles: (roles: SystemRole[]) => boolean;
  /** Check if user is a platform admin */
  isPlatformAdmin: boolean;
  /** Check if user is a rule maker */
  isRuleMaker: boolean;
  /** Check if user is a rule checker */
  isRuleChecker: boolean;
  /** Check if user is a rule viewer */
  isRuleViewer: boolean;
  /** Check if user is a fraud analyst */
  isFraudAnalyst: boolean;
  /** Check if user is a fraud supervisor */
  isFraudSupervisor: boolean;
  /** Check if user has legacy maker role (kept for API compatibility, maps to RULE_MAKER) */
  isMaker: boolean;
  /** Check if user has legacy checker role (kept for API compatibility, maps to RULE_CHECKER) */
  isChecker: boolean;
}
/**
 * Custom hook for fetching roles with helper functions
 *
 * @returns UseRolesWithHelpersResult object with roles and helper functions
 */
export function useRolesWithHelpers(): UseRolesWithHelpersResult {
  const { roles, systemRoles, isLoading, error } = useRoles();

  const hasRole = useCallback(
    (role: SystemRole): boolean => {
      return roles.includes(role);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    (roleList: SystemRole[]): boolean => {
      return roleList.some((r) => roles.includes(r));
    },
    [roles]
  );

  const hasAllRoles = useCallback(
    (roleList: SystemRole[]): boolean => {
      return roleList.every((r) => roles.includes(r));
    },
    [roles]
  );

  const checkRoleHierarchy = useCallback(
    (roleToCheck: SystemRole): boolean => {
      // Direct role match
      if (roles.includes(roleToCheck)) {
        return true;
      }

      // Check if user has any role that includes this role in its hierarchy
      for (const userRole of systemRoles) {
        const includedRoles = ROLE_GROUPS[userRole] ?? [];
        if (includedRoles.includes(roleToCheck)) {
          return true;
        }
      }

      return false;
    },
    [roles, systemRoles]
  );

  return {
    roles,
    systemRoles,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isPlatformAdmin: checkRoleHierarchy("PLATFORM_ADMIN"),
    isRuleMaker: checkRoleHierarchy("RULE_MAKER"),
    isRuleChecker: checkRoleHierarchy("RULE_CHECKER"),
    isRuleViewer: checkRoleHierarchy("RULE_VIEWER"),
    isFraudAnalyst: checkRoleHierarchy("FRAUD_ANALYST"),
    isFraudSupervisor: checkRoleHierarchy("FRAUD_SUPERVISOR"),
    isMaker: roles.includes("RULE_MAKER"),
    isChecker: roles.includes("RULE_CHECKER"),
  };
}

export default useRoles;
