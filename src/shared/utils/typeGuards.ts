/**
 * Type Guard Utilities
 *
 * Reusable type guards for common runtime type checking patterns.
 */

/**
 * Checks if a value is an object with a specific property.
 * This is a type guard that narrows the type to include the specified property.
 *
 * @param value - The value to check
 * @param prop - The property name to check for
 * @returns True if value is a non-null object with the specified property
 *
 * @example
 * ```ts
 * if (isObjectWithProperty(error, 'status')) {
 *   const status = error.status; // status is now known to exist
 * }
 * ```
 */
export function isObjectWithProperty<T extends string>(
  value: unknown,
  prop: T
): value is Record<T, unknown> & object {
  return typeof value === "object" && value !== null && prop in value;
}

/**
 * Checks if a value is an object with a specific property of a given type.
 *
 * @param value - The value to check
 * @param prop - The property name to check for
 * @param type - The expected type of the property value
 * @returns True if value is a non-null object with the specified property of the given type
 *
 * @example
 * ```ts
 * if (isObjectWithPropertyOfType(error, 'status', 'number')) {
 *   const status = error.status; // status is now known to be a number
 * }
 * ```
 */
export function isObjectWithPropertyOfType<
  T extends string,
  P extends "string" | "number" | "boolean",
>(
  value: unknown,
  prop: T,
  type: P
): value is Record<T, P extends "string" ? string : P extends "number" ? number : boolean> &
  object {
  return isObjectWithProperty(value, prop) && typeof (value as Record<T, unknown>)[prop] === type;
}
