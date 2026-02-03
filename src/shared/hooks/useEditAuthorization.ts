/**
 * useEditAuthorization Hook
 *
 * Custom hook for handling authorization checks in edit screens.
 * Automatically redirects unauthorized users to the list view.
 *
 * @example
 * ```tsx
 * const { canEdit, isLoading } = useEditAuthorization({
 *   resource: 'rules',
 *   params: { status: rule?.status },
 * });
 *
 * if (isLoading) return <Edit isLoading />;
 * if (!canEdit) return <Edit><Alert message="Access Denied" /></Edit>;
 * ```
 */

import { useEffect } from "react";
import { useCan, useNavigation } from "@refinedev/core";

export interface UseEditAuthorizationOptions {
  /** The resource name (e.g., 'rules', 'rule-fields') */
  resource: string;
  /** Optional parameters to pass to the authorization check */
  params?: Record<string, unknown>;
}

export interface UseEditAuthorizationResult {
  /** Whether the user can edit the resource */
  canEdit: boolean;
  /** Whether the authorization check is still loading */
  isLoading: boolean;
  /** Optional reason for denial */
  reason?: string;
}

/**
 * Hook to check edit authorization and handle redirect for unauthorized users.
 * Automatically redirects to the resource list page if the user is not authorized.
 *
 * @param options - Authorization options
 * @returns Authorization result object
 */
export function useEditAuthorization({
  resource,
  params,
}: UseEditAuthorizationOptions): UseEditAuthorizationResult {
  const { data: canEditData } = useCan({
    resource,
    action: "edit",
    params,
  });
  const { list } = useNavigation();

  useEffect(() => {
    if (canEditData != null && !canEditData.can) {
      list(resource);
    }
  }, [canEditData, list, resource]);

  return {
    canEdit: canEditData?.can ?? false,
    isLoading: canEditData == null,
    reason: canEditData?.reason,
  };
}
