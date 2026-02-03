/**
 * Custom Hooks
 *
 * Centralized exports for all custom hooks.
 */

// Auth & Authorization hooks
export { useRoles, useRolesWithHelpers } from "./useRoles";
export type { SystemRole, UseRolesResult, UseRolesWithHelpersResult } from "./useRoles";

export { usePermissions, usePermissionsWithHelpers } from "./usePermissions";
export type {
  PermissionScope,
  Capabilities,
  UsePermissionsResult,
  UsePermissionsWithHelpersResult,
} from "./usePermissions";

// Review workflow hooks
export { useReview } from "./useReview";

// Notes hooks
export { useNotes } from "./useNotes";

// Worklist hooks
export { useWorklist, useWorklistStats, useClaimNext } from "./useWorklist";

// Case management hooks
export { useCasesList, useCase, useCaseActivity, useCreateCase } from "./useCases";

// Bulk operations hooks
export { useBulkOperations } from "./useBulkOperations";
