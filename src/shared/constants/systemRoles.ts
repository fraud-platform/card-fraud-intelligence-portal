import type { SystemRole } from "../../types/domain";

/**
 * Allowed portal-wide role values.
 */
export const ALLOWED_SYSTEM_ROLES: readonly SystemRole[] = [
  "PLATFORM_ADMIN",
  "RULE_MAKER",
  "RULE_CHECKER",
  "RULE_VIEWER",
  "FRAUD_ANALYST",
  "FRAUD_SUPERVISOR",
];

export function isSystemRole(role: string): role is SystemRole {
  return ALLOWED_SYSTEM_ROLES.includes(role as SystemRole);
}
