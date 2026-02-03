/**
 * Rule Helpers
 *
 * Shared utilities for extracting rule and ruleset data from API responses.
 * Handles backend response variance where data may be nested or flat.
 */

import type { Rule, RuleVersion, RuleSet, RuleSetWithRules } from "@/types/domain";
import type { RuleDetailResponse, RuleSetDetailResponse } from "@/api/types";

// ============================================================================
// Rule Extraction Helpers
// ============================================================================

/**
 * Union type for possible rule detail response shapes from the backend.
 * The backend may return data in different formats:
 * - RuleDetailResponse: { rule: Rule, current_version: RuleVersion, versions: RuleVersion[] }
 * - Flat Rule with nested version: { ...Rule, version_details?: RuleVersion }
 */
type RuleDetailLike = RuleDetailResponse | (Rule & { version_details?: RuleVersion });

/**
 * Extracts rule and current version from a potentially varying backend response.
 * Used primarily in edit screens where only the current version matters.
 *
 * @param data - The API response data in either format
 * @returns Object containing rule and currentVersion (may be null)
 *
 * @example
 * ```ts
 * const data = await get<RuleDetailLike>(RULES.GET(ruleId));
 * const { rule, currentVersion } = extractRuleAndVersion(data);
 * ```
 */
export function extractRuleAndVersion(data: RuleDetailLike): {
  rule: Rule;
  currentVersion: RuleVersion | null;
} {
  if ("rule" in data && data.rule != null && typeof data.rule === "object") {
    const currentVersion = "current_version" in data ? data.current_version : null;
    return { rule: data.rule, currentVersion };
  }

  if ("version_details" in data && data.version_details != null) {
    return { rule: data as Rule, currentVersion: data.version_details };
  }

  return { rule: data as Rule, currentVersion: null };
}

/**
 * Extracts rule, current version, and all versions from a potentially varying backend response.
 * Used in show screens where the full version history is displayed.
 *
 * @param data - The API response data in either format
 * @returns Object containing rule, currentVersion (may be null), and versions array
 *
 * @example
 * ```ts
 * const data = await get<RuleDetailLike>(RULES.GET(ruleId));
 * const { rule, currentVersion, versions } = extractRuleDetail(data);
 * ```
 */
export function extractRuleDetail(data: RuleDetailLike): {
  rule: Rule;
  currentVersion: RuleVersion | null;
  versions: RuleVersion[];
} {
  if ("rule" in data && typeof data.rule === "object" && data.rule != null) {
    const currentVersion = "current_version" in data ? data.current_version : null;
    const versions = "versions" in data && Array.isArray(data.versions) ? data.versions : [];
    return { rule: data.rule, currentVersion, versions };
  }

  if ("version_details" in data && data.version_details != null) {
    return {
      rule: data as Rule,
      currentVersion: data.version_details,
      versions: [data.version_details],
    };
  }

  return { rule: data as Rule, currentVersion: null, versions: [] };
}

// ============================================================================
// RuleSet Extraction Helpers
// ============================================================================

/**
 * Union type for possible ruleset detail response shapes from the backend.
 */
type RuleSetDetailLike = RuleSetDetailResponse | RuleSetWithRules;

/**
 * Extracts ruleset and associated rules from a potentially varying backend response.
 *
 * @param data - The API response data in either format
 * @returns Object containing ruleset and rules array
 *
 * @example
 * ```ts
 * const response = await get<RuleSetDetailLike>(RULESETS.GET(rulesetId));
 * const { ruleset, rules } = extractRuleSetDetail(response);
 * ```
 */
export function extractRuleSetDetail(data: RuleSetDetailLike): {
  ruleset: RuleSet;
  rules: RuleVersion[];
} {
  if ("ruleset" in data && typeof data.ruleset === "object" && data.ruleset != null) {
    const rules = "rules" in data && Array.isArray(data.rules) ? (data.rules as RuleVersion[]) : [];
    return { ruleset: data.ruleset, rules };
  }

  if ("rules" in data && Array.isArray(data.rules)) {
    return { ruleset: data as RuleSet, rules: data.rules };
  }

  return { ruleset: data as RuleSet, rules: [] };
}
