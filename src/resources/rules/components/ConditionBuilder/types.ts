/**
 * Condition Builder Type Definitions
 *
 * Internal types for the condition builder component.
 */

import { ConditionNode, RuleField } from "../../../../types/domain";
import { Operator } from "../../../../types/enums";

/**
 * Condition builder state
 */
export interface ConditionBuilderState {
  /** Root condition node */
  root: ConditionNode | null;
  /** Available rule fields */
  fields: RuleField[];
  /** Currently selected node (for editing) */
  selectedNodeId: string | null;
  /** Whether the tree is valid */
  isValid: boolean;
  /** Validation errors */
  errors: ConditionBuilderError[];
}

/**
 * Validation error
 */
export interface ConditionBuilderError {
  /** Node ID where error occurred */
  nodeId: string;
  /** Error message */
  message: string;
  /** Error path (for nested nodes) */
  path: string[];
}

/**
 * Node action types
 */
export type NodeAction =
  | { type: "ADD_PREDICATE"; parentId: string }
  | { type: "ADD_GROUP"; parentId: string; operator: "and" | "or" }
  | { type: "DELETE_NODE"; nodeId: string }
  | { type: "UPDATE_NODE"; nodeId: string; updates: Partial<ConditionNode> }
  | { type: "MOVE_NODE"; nodeId: string; direction: "up" | "down" };

/**
 * Field selection for predicate
 */
export interface FieldSelection {
  /** Selected field key */
  fieldKey: string;
  /** Field metadata */
  field: RuleField;
  /** Selected operator */
  operator: Operator;
  /** Value(s) */
  value: unknown;
}

/**
 * UI configuration for condition builder
 */
export interface ConditionBuilderConfig {
  /** Maximum nesting depth */
  maxDepth: number;
  /** Whether to enable drag-and-drop */
  enableDragDrop: boolean;
  /** Whether to show visual indicators */
  showIndicators: boolean;
  /** Debounce time for onChange (ms) */
  debounceMs: number;
}

export const DEFAULT_CONFIG: ConditionBuilderConfig = {
  maxDepth: 5,
  enableDragDrop: false, // Start with move up/down, add DnD later
  showIndicators: true,
  debounceMs: 300,
};
