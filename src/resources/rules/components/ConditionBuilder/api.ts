import type { ConditionNode, RuleField } from "../../../../types/domain";
import { ensureGroupRoot, hydrate } from "./helpers";
import { validateTree, hasValidationErrors, type ValidationError } from "./validation";

/**
 * Validates a condition tree and returns whether it's valid.
 * This function is kept in a separate module to avoid exporting
 * non-component helpers from the component file (fast-refresh safety).
 */
export function validateConditionTree(
  conditionTree: ConditionNode | undefined,
  fields: RuleField[]
): { valid: boolean; errors: ValidationError[] } {
  if (conditionTree === undefined) {
    return {
      valid: false,
      errors: [
        {
          code: "TREE_REQUIRED",
          message: "Condition tree is required",
        },
      ],
    };
  }

  const root = ensureGroupRoot(
    conditionTree as unknown as import("./nodeTypes").UiConditionNode | undefined
  );
  const uiRoot = hydrate(root);
  const validated = validateTree(uiRoot, fields);
  const hasErrors = hasValidationErrors(validated);

  // Collect all errors from the tree
  const allErrors: ValidationError[] = [];
  const collectErrors = (node: import("./nodeTypes").UiConditionNode): void => {
    if (node.validationErrors != null) {
      allErrors.push(...node.validationErrors);
    }
    if (node.kind === "group") {
      node.children.forEach(collectErrors);
    }
  };
  collectErrors(validated);

  return {
    valid: !hasErrors,
    errors: allErrors,
  };
}
