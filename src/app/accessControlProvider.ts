/**
 * Access Control Provider
 *
 * Refine access control provider for RBAC (Role-Based Access Control).
 * Implements maker-checker workflow permissions (roles: RULE_MAKER, RULE_CHECKER).
 */

import { AccessControlProvider } from "@refinedev/core";
import { SystemRole } from "../types/domain";
import { authProvider } from "./authProvider";
import { isAuth0Enabled, getAccessTokenScopes } from "./auth0Client";

/**
 * Permission matrix for maker-checker workflow (RULE_MAKER / RULE_CHECKER)
 *
 * Maker can:
 * - Create/edit drafts
 * - Submit for approval
 * - View all resources
 *
 * Checker can:
 * - Approve/reject submissions
 * - View all resources
 * - Cannot create/edit
 */
const SYSTEM_ROLE_PERMISSIONS: Record<
  SystemRole,
  {
    can: string[];
    cannot: string[];
  }
> = {
  PLATFORM_ADMIN: {
    can: ["*"],
    cannot: [],
  },
  RULE_MAKER: {
    can: ["create", "edit", "delete", "list", "show", "submit"],
    cannot: ["approve", "reject"],
  },
  RULE_CHECKER: {
    can: ["list", "show", "approve", "reject"],
    cannot: ["create", "edit", "delete", "submit"],
  },
  RULE_VIEWER: {
    can: ["list", "show"],
    cannot: ["create", "edit", "delete", "submit", "approve", "reject"],
  },
  FRAUD_ANALYST: {
    can: ["list", "show", "comment", "flag", "recommend"],
    cannot: [],
  },
  FRAUD_SUPERVISOR: {
    can: ["list", "show", "approve", "block", "override"],
    cannot: [],
  },
};

/**
 * Access control provider implementation
 */
function getRequiredScope(res?: string, act?: string): string | null {
  if (res == null || res === "" || act == null || act === "") {
    return null;
  }

  const r = res.toLowerCase();
  const a = act.toLowerCase();

  const RULES_RES = new Set(["rules", "rule-fields", "rulesets"]);
  if (RULES_RES.has(r)) {
    if (["list", "show"].includes(a)) {
      return "read:rules";
    }
    if (["create", "edit", "delete", "submit"].includes(a)) {
      return "write:rules";
    }
    if (["approve", "reject"].includes(a)) {
      return "approve:rules";
    }
  }

  if (r === "approvals") {
    if (["approve", "reject"].includes(a)) {
      return "approve:rules";
    }
    if (["list", "show", "submit"].includes(a)) {
      return "read:rules";
    }
  }

  return null;
}

function handleResourceRules(
  roles: SystemRole[],
  resource?: string,
  action?: string,
  params?: Record<string, unknown>
): { can: boolean; reason?: string } | null {
  if (resource === "approvals") {
    // Approvals: only users with RULE_CHECKER role can approve/reject
    if (action === "approve" || action === "reject") {
      return { can: roles.includes("RULE_CHECKER") || roles.includes("PLATFORM_ADMIN") };
    }
    // Submitting approvals is allowed for RULE_MAKER
    if (action === "submit") {
      return { can: roles.includes("RULE_MAKER") || roles.includes("PLATFORM_ADMIN") };
    }
  }

  if (action === "edit" && params?.status === "APPROVED") {
    return { can: false, reason: "Cannot edit approved entities" };
  }

  return null;
}

function hasLocalDevSession(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.hostname !== "localhost") return false;

  const sessionStr = sessionStorage.getItem("auth_session");
  if (sessionStr == null || sessionStr === "") return false;

  try {
    const session = JSON.parse(sessionStr) as { token?: string; expiresAt?: number };
    if (typeof session.token !== "string" || session.token === "") return false;
    if (typeof session.expiresAt === "number" && Date.now() > session.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Merge role permission sets.
 */
export function mergePermissionsForRoles(roles: SystemRole[]): {
  canSet: Set<string>;
  cannotSet: Set<string>;
} {
  const canSet = new Set<string>();
  const cannotSet = new Set<string>();
  for (const r of roles) {
    const perms = SYSTEM_ROLE_PERMISSIONS[r];
    if (perms == null) continue;
    perms.can.forEach((c) => canSet.add(c));
    perms.cannot.forEach((c) => cannotSet.add(c));
  }
  return { canSet, cannotSet };
}

export const accessControlProvider: AccessControlProvider = {
  // eslint-disable-next-line complexity -- This permission method is intentionally comprehensive
  can: async ({ resource, action, params }) => {
    // Guard: permissions must exist
    try {
      const roles = (await authProvider.getPermissions?.()) as SystemRole[] | null;
      if (!Array.isArray(roles) || roles.length === 0) return { can: false };

      // PLATFORM_ADMIN shortcut
      if (roles.includes("PLATFORM_ADMIN")) {
        return { can: true };
      }

      const { canSet, cannotSet } = mergePermissionsForRoles(roles);

      // Wildcard allows any action
      if (canSet.has("*")) return { can: true };

      // Explicit deny
      if (typeof action === "string" && cannotSet.has(action)) {
        return { can: false, reason: `Role cannot perform '${action}' action` };
      }

      // Allowed by merged capabilities
      if (typeof action !== "string" || !canSet.has(action)) {
        return { can: false };
      }

      // Resource-specific rules (delegated to helper)
      const resourceCheck = handleResourceRules(roles, resource, action, params);
      if (resourceCheck !== null) {
        return resourceCheck;
      }

      // Enforce API scopes if Auth0 is active and we are not using local dev-session auth.
      if (isAuth0Enabled() && !hasLocalDevSession()) {
        try {
          const scopes = await getAccessTokenScopes();
          const required = getRequiredScope(resource, action);
          if (required !== null && !scopes.includes(required)) {
            return { can: false, reason: `Missing API scope: ${required}` };
          }
        } catch {
          return { can: false };
        }
      }

      return { can: true };
    } catch (err) {
      console.error("[AccessControl] permission check error", err);
      return { can: false };
    }
  },

  options: {
    /**
     * Buttons to show/hide based on permissions
     */
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: true,
    },
  },
};

/**
 * Helper to check if a user can perform an action
 */
export async function canPerformAction(
  action: string,
  resource?: string,
  params?: Record<string, unknown>
): Promise<boolean> {
  const result = await accessControlProvider.can({
    resource: resource ?? "",
    action,
    params,
  });

  return result.can;
}

export default accessControlProvider;
