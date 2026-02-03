/**
 * JSON utility functions
 *
 * Provides safe JSON parsing, formatting, and validation utilities.
 */

/**
 * Safely parse JSON with error handling
 *
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T = unknown>(json: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON with error handling
 *
 * @param value - Value to stringify
 * @param pretty - Whether to format with indentation
 * @returns JSON string or empty string if stringify fails
 */
export function safeJsonStringify(value: unknown, pretty = false): string {
  // Custom replacer to handle functions and symbols gracefully and detect circular refs
  const seen = new WeakSet();
  function replacer(_key: string, val: unknown): unknown {
    if (typeof val === "function") return null; // convert functions to null
    if (typeof val === "symbol") return null; // convert symbols to null
    if (typeof val === "bigint") throw new TypeError("BigInt not serializable");
    if (val != null && typeof val === "object") {
      if (seen.has(val)) throw new TypeError("Circular reference");
      seen.add(val);
    }
    return val;
  }

  try {
    return JSON.stringify(value, replacer, pretty ? 2 : 0);
  } catch {
    return "";
  }
}

/**
 * Format JSON string with indentation
 *
 * @param json - JSON string to format
 * @returns Formatted JSON string or original if parsing fails
 */
export function formatJson(json: string): string {
  try {
    const parsed: unknown = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return json;
  }
}

/**
 * Check if a string is valid JSON
 *
 * @param json - String to validate
 * @returns True if valid JSON
 */
export function isValidJson(json: string): boolean {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deep clone an object using JSON serialization
 *
 * Note: This method has limitations (loses functions, dates, etc.)
 * but is suitable for plain data objects.
 *
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

/**
 * Robust deep equality check that is order-insensitive for object keys
 * and handles common JS built-ins like Date, RegExp, Map, Set.
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if deeply equal
 */
/* eslint-disable complexity */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Handle primitives and strict equality
  if (Object.is(a, b)) return true;

  // Handle NaN equality (Object.is already handles NaN)
  if (typeof a !== typeof b) return false;

  // Dates
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();

  // RegExp
  if (a instanceof RegExp && b instanceof RegExp)
    return a.source === b.source && a.flags === b.flags;

  // Arrays: if one is array and other isn't, they're not equal
  if (Array.isArray(a) || Array.isArray(b)) {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    return false;
  }

  // Maps
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
    }
    return true;
  }

  // Sets
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  // Objects
  if (a != null && b != null && typeof a === "object" && typeof b === "object") {
    // Treat undefined properties as not present (JSON.stringify omits them)
    const aKeys = Object.keys(a as Record<string, unknown>).filter(
      (k) => (a as Record<string, unknown>)[k] !== undefined
    );
    const bKeys = Object.keys(b as Record<string, unknown>).filter(
      (k) => (b as Record<string, unknown>)[k] !== undefined
    );

    if (aKeys.length !== bKeys.length) return false;
    // Compare keys as sets to be order-insensitive
    aKeys.sort();
    bKeys.sort();
    for (let i = 0; i < aKeys.length; i++) {
      const aKey = aKeys[i];
      const bKey = bKeys[i];
      if (aKey !== bKey) return false;
      if (aKey == null) continue; // Type guard for noUncheckedIndexedAccess
      if (!deepEqual((a as Record<string, unknown>)[aKey], (b as Record<string, unknown>)[aKey]))
        return false;
    }
    return true;
  }

  return false;
}
/* eslint-enable complexity */

/**
 * Minify JSON string (remove whitespace)
 *
 * @param json - JSON string to minify
 * @returns Minified JSON string or a cleaned string if parsing fails
 */
function collapseWhitespace(s: string): string {
  // Collapse runs of whitespace into single spaces, then remove
  // surrounding spaces for punctuation commonly used in JSON-like strings
  return s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*\{\s*/g, "{")
    .replace(/\s*\}\s*/g, "}")
    .replace(/\s*\[\s*/g, "[")
    .replace(/\s*\]\s*/g, "]");
}

export function minifyJson(json: string): string {
  try {
    const parsed: unknown = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch {
    // Best-effort: collapse whitespace to single spaces and trim
    return collapseWhitespace(json);
  }
}

/**
 * Extract keys from a JSON object recursively
 *
 * @param obj - Object to extract keys from
 * @param prefix - Prefix for nested keys
 * @returns Array of all keys (including nested)
 */
export function extractKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix === "" ? key : `${prefix}.${key}`;
    keys.push(fullKey);

    if (value != null && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...extractKeys(value as Record<string, unknown>, fullKey));
    }
  }

  return keys;
}
