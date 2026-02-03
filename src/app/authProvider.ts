/**
 * Authentication Provider
 *
 * Refine auth provider for handling authentication, authorization,
 * and user session management.
 *
 * Current implementation: Simple localStorage-based auth for development.
 * Production: Auth0 SPA (Google via Auth0).
 */

import { AuthProvider } from "@refinedev/core";
import { User, SystemRole } from "../types/domain";
import {
  isAuth0Enabled,
  loginWithRedirect,
  logoutToHome,
  isAuthenticated as auth0IsAuthenticated,
  getAppRoles,
  getUserProfile,
} from "./auth0Client";
import { isObjectWithPropertyOfType } from "../shared/utils/typeGuards";
import { toError } from "../shared/utils/errors";

type LoginParams = {
  username?: string;
  roles?: SystemRole[];
  returnTo?: string;
};

/**
 * Secure session storage for development mode
 * Uses sessionStorage (cleared on tab close) instead of localStorage
 * Includes token expiration and integrity checks
 */
interface SecureSession {
  token: string;
  user: User;
  expiresAt: number; // Unix timestamp
  checksum: string; // Simple integrity check
}

const DEV_SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Generate simple checksum for integrity verification
 */
function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

// Allowed system roles (single source of truth)
const ALLOWED_SYSTEM_ROLES: SystemRole[] = [
  "PLATFORM_ADMIN",
  "RULE_MAKER",
  "RULE_CHECKER",
  "RULE_VIEWER",
  "FRAUD_ANALYST",
  "FRAUD_SUPERVISOR",
];

/**
 * Active role helpers
 */
export function getActiveUserRole(): SystemRole | null {
  const active = sessionStorage.getItem("active_role");
  if (active == null || active === "") return null;
  return ALLOWED_SYSTEM_ROLES.includes(active as SystemRole) ? (active as SystemRole) : null;
}

export function setActiveUserRole(role?: SystemRole | null): void {
  if (role == null) {
    sessionStorage.removeItem("active_role");
  } else if (ALLOWED_SYSTEM_ROLES.includes(role)) {
    sessionStorage.setItem("active_role", role);
  }
  // Notify listeners
  window.dispatchEvent(new Event("active-role-changed"));
}

/**
 * Store session securely (development mode only)
 */
function storeDevSession(user: User): void {
  const token = `mock-token-${user.user_id}`;
  const expiresAt = Date.now() + DEV_SESSION_DURATION_MS;
  const dataString = JSON.stringify({ token, user, expiresAt });
  const checksum = generateChecksum(dataString);

  const session: SecureSession = {
    token,
    user,
    expiresAt,
    checksum,
  };

  sessionStorage.setItem("auth_session", JSON.stringify(session));
}

/**
 * Retrieve and validate session (development mode only)
 */
function getDevSession(): SecureSession | null {
  const sessionStr = sessionStorage.getItem("auth_session");

  if (sessionStr == null || sessionStr === "") {
    return null;
  }

  try {
    const session = JSON.parse(sessionStr) as SecureSession;

    // Validate expiration
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem("auth_session");
      return null;
    }

    // Validate integrity
    const dataString = JSON.stringify({
      token: session.token,
      user: session.user,
      expiresAt: session.expiresAt,
    });
    const expectedChecksum = generateChecksum(dataString);

    if (session.checksum !== expectedChecksum) {
      console.warn("[AuthProvider] Checksum mismatch!", {
        expected: expectedChecksum,
        actual: session.checksum,
      });
      sessionStorage.removeItem("auth_session");
      return null;
    }

    return session;
  } catch {
    sessionStorage.removeItem("auth_session");
    return null;
  }
}

/**
 * Clear session (development mode only)
 */
function clearDevSession(): void {
  sessionStorage.removeItem("auth_session");
}

/**
 * Helper to extract a string value from Auth0 profile
 */
function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Helper to build user from Auth0 profile
 */
function buildUserFromAuth0Profile(
  profile: Record<string, unknown>,
  roles: SystemRole[] | null
): User {
  const userId =
    asString(profile.sub) ?? asString(profile.user_id) ?? asString(profile.email) ?? "unknown";

  const username =
    asString(profile.nickname) ?? asString(profile.email) ?? asString(profile.name) ?? "user";

  const displayName =
    asString(profile.name) ?? asString(profile.nickname) ?? asString(profile.email) ?? "User";

  const safeRoles: SystemRole[] = Array.isArray(roles)
    ? roles.filter((r): r is SystemRole => ALLOWED_SYSTEM_ROLES.includes(r))
    : ["RULE_MAKER"];

  const safeEmail = typeof profile.email === "string" ? profile.email : "unknown@example.com";

  return {
    user_id: String(userId),
    username: String(username),
    display_name: String(displayName),
    roles: safeRoles,
    email: String(safeEmail),
  };
}

/**
 * Simple auth provider using sessionStorage for development
 *
 * For development/demo purposes. Production uses Auth0.
 * Security improvements:
 * - sessionStorage instead of localStorage (cleared on tab close)
 * - Token expiration (8 hours)
 * - Integrity checks with checksums
 */
export const authProvider: AuthProvider = {
  /**
   * Login handler
   */
  login: async (params) => {
    try {
      const input = (params ?? {}) as LoginParams;

      if (isAuth0Enabled()) {
        await loginWithRedirect(input.returnTo ?? "/");
        return { success: true };
      }

      // Development-only fallback: sessionStorage-based sign-in.
      // No shared secret is handled in the browser in this mode.

      const devParams = (params ?? {}) as Record<string, unknown>;
      const username = typeof devParams.username === "string" ? devParams.username : "";
      const rolesRaw = devParams.roles;

      const normalizedUsername = String(username ?? "").trim();

      if (normalizedUsername === "") {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "Username is required",
          },
        };
      }

      // Validate roles array
      const allowed: SystemRole[] = [
        "PLATFORM_ADMIN",
        "RULE_MAKER",
        "RULE_CHECKER",
        "RULE_VIEWER",
        "FRAUD_ANALYST",
        "FRAUD_SUPERVISOR",
      ];

      let normalizedRoles: SystemRole[];

      if (Array.isArray(rolesRaw) && rolesRaw.every((r) => typeof r === "string")) {
        normalizedRoles = rolesRaw
          .map((r) => r.toUpperCase())
          .filter((r): r is SystemRole => allowed.includes(r as SystemRole));
      } else {
        // Default to RULE_MAKER for dev convenience when not provided
        normalizedRoles = ["RULE_MAKER"];
      }

      if (normalizedRoles.length === 0) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "At least one valid role is required",
          },
        };
      }

      // Mock user object
      const user: User = {
        user_id: `user-${normalizedUsername}`,
        username: normalizedUsername,
        display_name: normalizedUsername.charAt(0).toUpperCase() + normalizedUsername.slice(1),
        roles: normalizedRoles,
        email: `${normalizedUsername}@example.com`,
      };

      // Store auth state securely
      storeDevSession(user);

      // Initialize active role for this session (first assigned role)
      try {
        setActiveUserRole(normalizedRoles[0]);
      } catch {
        // ignore
      }

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error instanceof Error ? error.message : "Login failed",
        },
      };
    }
  },

  /**
   * Logout handler
   */
  logout: async () => {
    try {
      if (isAuth0Enabled()) {
        await logoutToHome();
        return {
          success: true,
          redirectTo: "/login",
        };
      }

      clearDevSession();

      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LogoutError",
          message: error instanceof Error ? error.message : "Logout failed",
        },
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  check: async () => {
    if (isAuth0Enabled()) {
      try {
        const ok = await auth0IsAuthenticated();

        if (ok) {
          return { authenticated: true };
        }

        return {
          authenticated: false,
          redirectTo: "/login",
          logout: false,
        };
      } catch (err) {
        console.error("[AuthProvider] Auth0 check error:", err);
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: false,
        };
      }
    }

    const session = getDevSession();

    if (session != null) {
      return { authenticated: true };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
      logout: true,
    };
  },

  /**
   * Get error for authentication failure
   */
  onError: (error: unknown): Promise<{ logout?: boolean; redirectTo?: string; error: Error }> => {
    const errObj = toError(error);
    const status = isObjectWithPropertyOfType(error, "status", "number") ? error.status : undefined;

    if (status === 401 || status === 403) {
      return Promise.resolve({
        logout: true,
        redirectTo: "/login",
        error: errObj,
      });
    }

    return Promise.resolve({ error: errObj });
  },

  /**
   * Get current user identity
   */
  getIdentity: async (): Promise<User | null> => {
    if (isAuth0Enabled()) {
      const profile: Record<string, unknown> | null = await getUserProfile();
      const roles: SystemRole[] = await getAppRoles();

      if (profile == null) {
        return null;
      }

      return buildUserFromAuth0Profile(profile, roles);
    }

    const session = getDevSession();

    if (session == null) {
      return null;
    }

    return session.user;
  },

  /**
   * Get user permissions (role-based)
   */
  getPermissions: async (): Promise<SystemRole[] | null> => {
    if (isAuth0Enabled()) {
      const roles = await getAppRoles();
      return roles.length === 0 ? null : roles;
    }

    const session = getDevSession();

    if (session == null) {
      return null;
    }

    return session.user.roles.length === 0 ? null : session.user.roles;
  },
};

/**
 * Helper to get current user
 */
export function getCurrentUser(): User | null {
  const session = getDevSession();
  return session?.user ?? null;
}

/**
 * Helper to get current user role
 */
export function getCurrentUserRoles(): SystemRole[] | null {
  const user = getCurrentUser();
  return user?.roles ?? null;
}

export function isChecker(): boolean {
  const roles = getCurrentUserRoles();
  return Array.isArray(roles) ? roles.includes("RULE_CHECKER") : false;
}

/**
 * Helper to check if current user has a specific system role
 */
export function hasSystemRole(role: SystemRole): boolean {
  const roles = getCurrentUserRoles();
  if (roles == null) return false;
  return roles.includes(role);
}
