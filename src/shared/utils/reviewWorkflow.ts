/**
 * Review Workflow Utilities
 *
 * Centralized business logic for transaction review workflow transitions
 * and action availability. Decouples workflow rules from UI components.
 */

import {
  type TransactionStatus,
  VALID_STATUS_TRANSITIONS,
  canTransition,
  getValidTransitions,
} from "../../types/review";

/**
 * Action availability flags for a review
 */
export interface ActionAvailability {
  /** Can assign to an analyst (all statuses except CLOSED) */
  canAssign: boolean;
  /** Can resolve the review (only IN_REVIEW or ESCALATED) */
  canResolve: boolean;
  /** Can escalate the review (only IN_REVIEW) */
  canEscalate: boolean;
  /** Can perform any status transition */
  canTransition: boolean;
  /** Available status transitions from current status */
  availableTransitions: TransactionStatus[];
}

/**
 * Check if a review can be assigned at the given status
 */
export function canAssign(status: TransactionStatus): boolean {
  return status !== "CLOSED";
}

/**
 * Check if a review can be resolved at the given status
 */
export function canResolve(status: TransactionStatus): boolean {
  return status === "IN_REVIEW" || status === "ESCALATED";
}

/**
 * Check if a review can be escalated at the given status
 */
export function canEscalate(status: TransactionStatus): boolean {
  return status === "IN_REVIEW";
}

/**
 * Get all action availability flags for a given status
 */
export function getActionAvailability(status: TransactionStatus): ActionAvailability {
  const availableTransitions = getValidTransitions(status);

  return {
    canAssign: canAssign(status),
    canResolve: canResolve(status),
    canEscalate: canEscalate(status),
    canTransition: availableTransitions.length > 0,
    availableTransitions,
  };
}

/**
 * Workflow action descriptions for UI display
 */
export const ACTION_DESCRIPTIONS = {
  assign: "Assign this transaction to an analyst for review",
  resolve: "Mark the review as complete with a resolution",
  escalate: "Escalate to a supervisor or senior analyst",
  transition: "Change the review status",
} as const;

/**
 * Status descriptions for UI display
 */
export const STATUS_DESCRIPTIONS: Record<TransactionStatus, string> = {
  PENDING: "Awaiting review assignment",
  IN_REVIEW: "Currently being reviewed by an analyst",
  ESCALATED: "Escalated for senior review",
  RESOLVED: "Review completed with resolution",
  CLOSED: "Review finalized and closed",
};

// Re-export transition utilities from types for convenience
export { VALID_STATUS_TRANSITIONS, canTransition, getValidTransitions };
