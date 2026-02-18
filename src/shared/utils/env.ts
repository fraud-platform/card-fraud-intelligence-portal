/**
 * Environment variable parsing helpers.
 *
 * Vite exposes all env values as strings at runtime. These helpers normalize
 * optional string values and common boolean flags consistently across modules.
 */

export function readBooleanEnv(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }
  return false;
}

export function readStringEnv(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
