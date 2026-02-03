import type { Dispatch, SetStateAction } from "react";

/**
 * Generic helper for optimistic update pattern used by review actions.
 * Keeps logic isolated and easy to test.
 */
export async function withOptimisticUpdate<T>(
  currentValue: T,
  setValue: Dispatch<SetStateAction<T>>,
  setIsUpdating: Dispatch<SetStateAction<boolean>>,
  updateFn: (prev: T, now: string) => T,
  apiCall: () => Promise<void>,
  fetchFn: () => Promise<void>
): Promise<void> {
  const previous = currentValue;
  const now = new Date().toISOString();
  setIsUpdating(true);
  try {
    setValue((prev) => updateFn(prev, now));
    await apiCall();
    await fetchFn();
  } catch {
    setValue(previous);
  } finally {
    setIsUpdating(false);
  }
}

export default withOptimisticUpdate;
