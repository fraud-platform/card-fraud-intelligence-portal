/**
 * Abort Helpers
 *
 * Utilities to detect aborted HTTP requests and avoid state updates.
 */

export function isAbortError(error: unknown): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { name?: string; code?: string };

  return (
    maybeError.name === "AbortError" ||
    maybeError.name === "CanceledError" ||
    maybeError.code === "ERR_CANCELED"
  );
}
