/**
 * Error Utilities
 *
 * Shared utilities for error handling and formatting.
 */

/**
 * Normalizes an unknown error value into a standardized error object.
 *
 * @param error - The error to normalize (can be string, Error, or unknown)
 * @returns An object with name and message properties
 *
 * @example
 * ```ts
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const normalized = toAuthError(error);
 *   console.error(normalized.message);
 * }
 * ```
 */
export function toAuthError(error: unknown): { name: string; message: string } {
  if (typeof error === "string") {
    return { name: "Error", message: error };
  }

  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { name: "Error", message: "Unknown error" };
}

/**
 * Extracts the error message from an unknown error value.
 *
 * @param error - The error to extract message from
 * @returns The error message, or a default message if unavailable
 *
 * @example
 * ```ts
 * try {
 *   await someOperation();
 * } catch (error) {
 *   console.error(getErrorMessage(error));
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

/**
 * Creates an Error object from an unknown value, preserving the original
 * error as a `raw` property if it's not already an Error.
 *
 * @param error - The error to normalize
 * @returns An Error instance with the original value attached if needed
 *
 * @example
 * ```ts
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const normalized = toError(error);
 *   throw normalized;
 * }
 * ```
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  const message = getErrorMessage(error);
  return Object.assign(new Error(message), { raw: error });
}

/**
 * Handles async errors with a consistent pattern.
 * Logs the error and returns a standardized error message.
 *
 * @param error - The error to handle
 * @param fallbackMessage - Default message if error is unknown
 * @param context - Optional context for where the error occurred
 * @returns A standardized error object with message
 *
 * @example
 * ```ts
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const err = handleAsyncError(error, 'Failed to fetch data', 'UserService');
 *   // err.message contains user-friendly error
 *   // err.original contains the original error
 * }
 * ```
 */
export function handleAsyncError(
  error: unknown,
  fallbackMessage: string = "An error occurred",
  context?: string
): { message: string; original: unknown } {
  const message = getErrorMessage(error);
  const fullMessage = context !== undefined ? `[${context}] ${message}` : message;

  return {
    message: fullMessage !== "" ? fullMessage : fallbackMessage,
    original: error,
  };
}

/**
 * Checks if an error is an abort error from AbortController.
 *
 * @param error - The error to check
 * @returns True if the error is an abort error
 *
 * @example
 * ```ts
 * try {
 *   await fetchWithAbort(signal);
 * } catch (error) {
 *   if (isAbortError(error)) {
 *     return; // Silently ignore abort errors
 *   }
 *   throw error;
 * }
 * ```
 */
export function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === "AbortError" || (error as unknown as { name: string }).name === "AbortError"
    );
  }
  return false;
}

/**
 * Creates an AbortController that auto-aborts after a timeout.
 *
 * @param timeoutMs - Timeout in milliseconds (default: 30000ms)
 * @returns Object with signal, controller, and cleanup function
 *
 * @example
 * ```ts
 * const { signal, controller, cleanup } = createTimeoutController(5000);
 *
 * try {
 *   await fetch(url, { signal });
 * } catch (error) {
 *   if (isAbortError(error)) {
 *     console.error('Request timed out');
 *   }
 * } finally {
 *   cleanup();
 * }
 * ```
 */
export function createTimeoutController(timeoutMs: number = 30000): {
  signal: AbortSignal;
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const cleanup = (): void => {
    clearTimeout(timeoutId);
  };

  return {
    signal: controller.signal,
    controller,
    cleanup,
  };
}

/**
 * Wraps an async function with timeout support using AbortController.
 *
 * @param asyncFn - The async function to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @returns Wrapped function with timeout support
 *
 * @example
 * ```ts
 * const fetchWithTimeout = withTimeout(fetchData, 5000);
 * await fetchWithTimeout(url); // Throws if takes longer than 5s
 * ```
 */
export function withTimeout<T extends (...args: unknown[]) => Promise<unknown>>(
  asyncFn: T,
  timeoutMs: number
): T {
  return (async (...args: Parameters<T>) => {
    const { signal, cleanup } = createTimeoutController(timeoutMs);

    try {
      return (await Promise.race([
        asyncFn(...args),
        new Promise((_, reject) => {
          signal.addEventListener("abort", () => {
            reject(new Error(`Operation timed out after ${timeoutMs}ms`));
          });
        }),
      ])) as Promise<ReturnType<T>>;
    } finally {
      cleanup();
    }
  }) as T;
}
