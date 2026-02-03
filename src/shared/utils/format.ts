/**
 * Format Utilities
 *
 * Shared utilities for formatting values for display.
 */

/**
 * Converts an enum value (e.g., STRING, SOME_VALUE) to a human-readable label.
 * Converts SCREAMING_SNAKE_CASE to Title Case.
 *
 * @param value - The enum value to format
 * @returns A human-readable label
 *
 * @example
 * ```ts
 * labelForEnumValue('PENDING_APPROVAL') // 'Pending Approval'
 * labelForEnumValue('STRING') // 'String'
 * labelForEnumValue('MULTI_WORD_VALUE') // 'Multi Word Value'
 * ```
 */
export function labelForEnumValue(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * Converts an enum to an array of Select-compatible options.
 *
 * @param enumType - An enum object containing string values
 * @returns An array of { label, value } objects for use with Ant Design Select
 *
 * @example
 * ```ts
 * enum RuleType { ALLOWLIST = "ALLOWLIST", BLOCKLIST = "BLOCKLIST" }
 * enumToOptions(RuleType) // [{ label: "ALLOWLIST", value: "ALLOWLIST" }, ...]
 * ```
 */
export function enumToOptions<T extends string>(
  enumType: Record<string, T>
): Array<{ label: T; value: T }> {
  return Object.values(enumType).map((v) => ({ label: v, value: v }));
}

/**
 * Format currency amount
 * @param amount - The numeric amount to format
 * @param currency - The currency code (default: "USD")
 * @param locale - The locale to use for formatting (default: "en-US")
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, "EUR", "de-DE") // "1,234.56 EUR"
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const numericAmount = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(numericAmount)) {
    return "-";
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numericAmount);
}

/**
 * Format date and time
 * @param timestamp - ISO date string or Date object
 * @param locale - The locale to use for formatting (default: "en-US")
 * @returns Formatted date string
 *
 * @example
 * formatDateTime("2024-01-15T10:30:00Z") // "1/15/2024, 10:30:00 AM"
 */
export function formatDateTime(timestamp: string | Date, locale: string = "en-US"): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

/**
 * Format date only (no time)
 * @param timestamp - ISO date string or Date object
 * @param locale - The locale to use for formatting (default: "en-US")
 * @returns Formatted date string
 */
export function formatDate(timestamp: string | Date, locale: string = "en-US"): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
  }).format(date);
}

/**
 * Format time only (no date)
 * @param timestamp - ISO date string or Date object
 * @param locale - The locale to use for formatting (default: "en-US")
 * @returns Formatted time string
 */
export function formatTime(timestamp: string | Date, locale: string = "en-US"): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "medium",
  }).format(date);
}

/**
 * Format time in queue (human-readable duration)
 * @param seconds - Time in seconds
 * @returns Human-readable duration string
 *
 * @example
 * formatTimeInQueue(45) // "45s"
 * formatTimeInQueue(120) // "2m"
 * formatTimeInQueue(7200) // "2h"
 * formatTimeInQueue(172800) // "2d"
 */
export function formatTimeInQueue(seconds: number | undefined | null): string {
  if (seconds === null || seconds === undefined) return "-";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Format amount (alias for formatCurrency)
 * @deprecated Use formatCurrency instead
 */
export function formatAmount(amount: number | string, currency: string): string {
  return formatCurrency(amount, currency);
}

/**
 * Format percentage
 * @param value - The numeric value (0-1 or 0-100)
 * @param decimals - Number of decimal places
 * @param locale - The locale to use for formatting
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with thousands separator
 * @param value - The numeric value
 * @param locale - The locale to use for formatting
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}
