/**
 * Filter Builder Utilities
 *
 * Shared utilities for building Refine CrudFilters from form values.
 */

import type { CrudFilters } from "@refinedev/core";
import type { PaginationProps } from "antd/es/pagination";
import { enumToOptions as enumToOptionsUtil } from "./format";

// Re-export enumToOptions for convenience
export const enumToOptions = enumToOptionsUtil;

/**
 * Supported filter operators
 */
export type FilterOperator =
  | "eq"
  | "ne"
  | "contains"
  | "ncontains"
  | "startswith"
  | "endswith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin";

/**
 * Configuration for a filter field
 */
export interface FilterFieldConfig {
  /** The field name to query */
  field: string;
  /** The operator to use (defaults to 'eq' for non-search fields) */
  operator?: FilterOperator;
  /** Whether to trim string values (default: true) */
  trim?: boolean;
}

/**
 * Builds CrudFilters from a form values object.
 *
 * @param values - The form values object
 * @param fieldConfigs - Array of field configurations to include in filters
 * @returns CrudFilters array for use with Refine's useTable onSearch
 *
 * @example
 * ```ts
 * const filters = buildFilters(
 *   { search: 'test', status: 'DRAFT', rule_type: 'POSITIVE' },
 *   [
 *     { field: 'search', operator: 'contains' },
 *     { field: 'status' },
 *     { field: 'rule_type' },
 *   ]
 * );
 * ```
 */
export function buildFilters<T extends Record<string, unknown>>(
  values: T,
  fieldConfigs: FilterFieldConfig[]
): CrudFilters {
  const filters: CrudFilters = [];

  for (const config of fieldConfigs) {
    const value = values[config.field];

    // Skip undefined, null, or empty string values
    if (value == null || value === "") {
      continue;
    }

    // Skip boolean false values (but allow true)
    if (typeof value === "boolean" && !value) {
      continue;
    }

    // Trim string values if configured
    const finalValue = config.trim !== false && typeof value === "string" ? value.trim() : value;

    // Skip empty strings after trimming
    if (finalValue === "") {
      continue;
    }

    filters.push({
      field: config.field,
      operator: config.operator ?? "eq",
      value: finalValue,
    });
  }

  return filters;
}

/**
 * Type guard to check if a value is present and non-empty
 *
 * @param value - The value to check
 * @returns true if value is present and non-empty
 */
export function isPresent<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null && value !== "";
}

/**
 * Type guard to check if a value is empty (null, undefined, empty string, empty array)
 *
 * @param value - The value to check
 * @returns true if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

/**
 * Merges pagination props from compactTableProps and tableProps
 *
 * @param tablePagination - The table's pagination props from useTable
 * @returns Merged pagination props
 *
 * @example
 * ```ts
 * <Table pagination={mergePagination(tableProps.pagination)} />
 * ```
 */
export function mergePagination(tablePagination?: PaginationProps | false): PaginationProps {
  // Default compact pagination config
  const compactPagination: PaginationProps = {
    showSizeChanger: true,
    pageSizeOptions: ["20", "50", "100"],
    defaultPageSize: 20,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
  };

  return {
    ...compactPagination,
    ...(tablePagination === false ? {} : (tablePagination ?? {})),
  };
}
