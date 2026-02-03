/**
 * URL Utilities
 *
 * Shared utilities for working with URLs and query strings.
 */

/**
 * Builds a URLSearchParams object from an object of filters.
 * Filters out empty values (undefined, null, empty string).
 *
 * @param filters - Optional record of filter key-value pairs
 * @returns URLSearchParams object
 *
 * @example
 * ```ts
 * const params = buildQueryParams({ status: 'active', page: 1 });
 * params.toString() // 'status=active&page=1'
 *
 * const params = buildQueryParams({ status: '', page: 1 });
 * params.toString() // 'page=1'
 * ```
 */
export function buildQueryParams(
  filters?: Record<string, string | number | boolean | undefined | null>
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters == null) return params;

  Object.entries(filters).forEach(([key, value]) => {
    // Skip undefined, null, and empty strings
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params;
}

/**
 * Builds a query string from an object of filters.
 * Filters out empty values (undefined, null, empty string).
 *
 * @param filters - Optional record of filter key-value pairs
 * @returns Query string prefixed with '?', or empty string if no valid filters
 *
 * @example
 * ```ts
 * buildQueryString({ status: 'active', page: 1 }) // '?status=active&page=1'
 * buildQueryString({ status: '', page: 1 }) // '?page=1'
 * buildQueryString({}) // ''
 * buildQueryString() // ''
 * ```
 */
export function buildQueryString(
  filters?: Record<string, string | number | boolean | undefined>
): string {
  const params = buildQueryParams(filters);
  const queryString = params.toString();
  return queryString !== "" ? `?${queryString}` : "";
}
