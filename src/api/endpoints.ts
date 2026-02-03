/**
 * API Endpoints
 *
 * Centralized endpoint definitions for the backend API.
 * All API routes are defined here to maintain consistency.
 */

/**
 * Base API version prefix
 */
const API_VERSION = "/api/v1";

/**
 * Rule Fields endpoints
 */
export const RULE_FIELDS = {
  LIST: `${API_VERSION}/rule-fields`,
  CREATE: `${API_VERSION}/rule-fields`,
  GET: (fieldKey: string) => `${API_VERSION}/rule-fields/${fieldKey}`,
  UPDATE: (fieldKey: string) => `${API_VERSION}/rule-fields/${fieldKey}`,
  DELETE: (fieldKey: string) => `${API_VERSION}/rule-fields/${fieldKey}`,
  METADATA: {
    LIST: (fieldKey: string) => `${API_VERSION}/rule-fields/${fieldKey}/metadata`,
    SET: (fieldKey: string) => `${API_VERSION}/rule-fields/${fieldKey}/metadata`,
    DELETE: (fieldKey: string, metaKey: string) =>
      `${API_VERSION}/rule-fields/${fieldKey}/metadata/${metaKey}`,
  },
} as const;

/**
 * Rules endpoints
 */
export const RULES = {
  LIST: `${API_VERSION}/rules`,
  CREATE: `${API_VERSION}/rules`,
  GET: (ruleId: string) => `${API_VERSION}/rules/${ruleId}`,
  SUMMARY: (ruleId: string) => `${API_VERSION}/rules/${ruleId}/summary`,
  SIMULATE: `${API_VERSION}/rules/simulate`,
  UPDATE: (ruleId: string) => `${API_VERSION}/rules/${ruleId}`,
  DELETE: (ruleId: string) => `${API_VERSION}/rules/${ruleId}`,
  SUBMIT: (ruleId: string) => `${API_VERSION}/rules/${ruleId}/submit`,
  VERSIONS: {
    LIST: (ruleId: string) => `${API_VERSION}/rules/${ruleId}/versions`,
    CREATE: (ruleId: string) => `${API_VERSION}/rules/${ruleId}/versions`,
    GET: (ruleId: string, versionId: string) =>
      `${API_VERSION}/rules/${ruleId}/versions/${versionId}`,
  },
} as const;

/**
 * Rule Versions endpoints (for approval workflow and version listing)
 */
export const RULE_VERSIONS = {
  LIST: (ruleId: string) => `${API_VERSION}/rules/${ruleId}/versions`,
  GET: (ruleId: string, versionId: string) =>
    `${API_VERSION}/rules/${ruleId}/versions/${versionId}`,
  DETAIL: (ruleVersionId: string) => `${API_VERSION}/rule-versions/${ruleVersionId}`,
  CREATE: (ruleId: string) => `${API_VERSION}/rules/${ruleId}/versions`,
  SUBMIT: (ruleVersionId: string) => `${API_VERSION}/rule-versions/${ruleVersionId}/submit`,
  APPROVE: (ruleVersionId: string) => `${API_VERSION}/rule-versions/${ruleVersionId}/approve`,
  REJECT: (ruleVersionId: string) => `${API_VERSION}/rule-versions/${ruleVersionId}/reject`,
} as const;

/**
 * RuleSet Versions endpoints (for version listing and approval workflow)
 */
export const RULESET_VERSIONS = {
  LIST: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/versions`,
  GET: (rulesetId: string, versionId: string) =>
    `${API_VERSION}/rulesets/${rulesetId}/versions/${versionId}`,
  SUBMIT: (rulesetVersionId: string) =>
    `${API_VERSION}/ruleset-versions/${rulesetVersionId}/submit`,
  APPROVE: (rulesetVersionId: string) =>
    `${API_VERSION}/ruleset-versions/${rulesetVersionId}/approve`,
  REJECT: (rulesetVersionId: string) =>
    `${API_VERSION}/ruleset-versions/${rulesetVersionId}/reject`,
  ACTIVATE: (rulesetVersionId: string) =>
    `${API_VERSION}/ruleset-versions/${rulesetVersionId}/activate`,
  COMPILE: (rulesetVersionId: string) =>
    `${API_VERSION}/ruleset-versions/${rulesetVersionId}/compile`,
} as const;

/**
 * RuleSets endpoints
 */
export const RULESETS = {
  LIST: `${API_VERSION}/rulesets`,
  CREATE: `${API_VERSION}/rulesets`,
  GET: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}`,
  UPDATE: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}`,
  DELETE: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}`,
  SUBMIT: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/submit`,
  APPROVE: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/approve`,
  REJECT: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/reject`,
  COMPILE: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/compile`,
  VERSIONS: {
    LIST: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/versions`,
  },
  RULES: {
    LIST: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/rules`,
    ADD: (rulesetId: string) => `${API_VERSION}/rulesets/${rulesetId}/rules`,
    REMOVE: (rulesetId: string, ruleVersionId: string) =>
      `${API_VERSION}/rulesets/${rulesetId}/rules/${ruleVersionId}`,
  },
} as const;

/**
 * Approvals endpoints
 */
export const APPROVALS = {
  LIST: `${API_VERSION}/approvals`,
  CREATE: `${API_VERSION}/approvals`,
  GET: (approvalId: string) => `${API_VERSION}/approvals/${approvalId}`,
  DECIDE: (approvalId: string) => `${API_VERSION}/approvals/${approvalId}/decide`,
} as const;

/**
 * Audit Log endpoints
 */
export const AUDIT_LOGS = {
  LIST: `${API_VERSION}/audit-log`,
  GET: (auditId: string) => `${API_VERSION}/audit-log/${auditId}`,
} as const;

/**
 * Authentication endpoints
 */
export const AUTH = {
  LOGIN: `${API_VERSION}/auth/login`,
  LOGOUT: `${API_VERSION}/auth/logout`,
  ME: `${API_VERSION}/auth/me`,
  REFRESH: `${API_VERSION}/auth/refresh`,
} as const;

/**
 * Validation endpoints
 */
export const VALIDATION = {
  CONDITION_TREE: `${API_VERSION}/validation/condition-tree`,
} as const;

/**
 * Transaction Management endpoints
 */
export const TRANSACTIONS = {
  LIST: `${API_VERSION}/transactions`,
  GET: (transactionId: string) => `${API_VERSION}/transactions/${transactionId}`,
  OVERVIEW: (transactionId: string) => `${API_VERSION}/transactions/${transactionId}/overview`,
  METRICS: `${API_VERSION}/metrics`,
} as const;

/**
 * Transaction Review endpoints (analyst workflow)
 */
export const REVIEW = {
  GET: (txnId: string) => `${API_VERSION}/transactions/${txnId}/review`,
  CREATE: (txnId: string) => `${API_VERSION}/transactions/${txnId}/review`,
  STATUS: (txnId: string) => `${API_VERSION}/transactions/${txnId}/review/status`,
  ASSIGN: (txnId: string) => `${API_VERSION}/transactions/${txnId}/review/assign`,
  RESOLVE: (txnId: string) => `${API_VERSION}/transactions/${txnId}/review/resolve`,
  ESCALATE: (txnId: string) => `${API_VERSION}/transactions/${txnId}/review/escalate`,
} as const;

/**
 * Analyst Notes endpoints
 */
export const NOTES = {
  LIST: (txnId: string) => `${API_VERSION}/transactions/${txnId}/notes`,
  CREATE: (txnId: string) => `${API_VERSION}/transactions/${txnId}/notes`,
  GET: (txnId: string, noteId: string) => `${API_VERSION}/transactions/${txnId}/notes/${noteId}`,
  UPDATE: (txnId: string, noteId: string) => `${API_VERSION}/transactions/${txnId}/notes/${noteId}`,
  DELETE: (txnId: string, noteId: string) => `${API_VERSION}/transactions/${txnId}/notes/${noteId}`,
} as const;

/**
 * Analyst Worklist endpoints
 */
export const WORKLIST = {
  LIST: `${API_VERSION}/worklist`,
  STATS: `${API_VERSION}/worklist/stats`,
  UNASSIGNED: `${API_VERSION}/worklist/unassigned`,
  CLAIM: `${API_VERSION}/worklist/claim`,
} as const;

/**
 * Case Management endpoints
 */
export const CASES = {
  LIST: `${API_VERSION}/cases`,
  CREATE: `${API_VERSION}/cases`,
  GET: (caseId: string) => `${API_VERSION}/cases/${caseId}`,
  GET_BY_NUMBER: (caseNumber: string) => `${API_VERSION}/cases/number/${caseNumber}`,
  UPDATE: (caseId: string) => `${API_VERSION}/cases/${caseId}`,
  RESOLVE: (caseId: string) => `${API_VERSION}/cases/${caseId}/resolve`,
  TRANSACTIONS: {
    LIST: (caseId: string) => `${API_VERSION}/cases/${caseId}/transactions`,
    ADD: (caseId: string) => `${API_VERSION}/cases/${caseId}/transactions`,
    REMOVE: (caseId: string, txnId: string) =>
      `${API_VERSION}/cases/${caseId}/transactions/${txnId}`,
  },
  ACTIVITY: (caseId: string) => `${API_VERSION}/cases/${caseId}/activity`,
} as const;

/**
 * Bulk Operations endpoints
 */
export const BULK = {
  ASSIGN: `${API_VERSION}/bulk/assign`,
  STATUS: `${API_VERSION}/bulk/status`,
  CREATE_CASE: `${API_VERSION}/bulk/create-case`,
} as const;

/**
 * Workflow Metrics endpoints
 */
export const WORKFLOW_METRICS = {
  WORKFLOW: `${API_VERSION}/metrics/workflow`,
  CASES: `${API_VERSION}/metrics/cases`,
} as const;

/**
 * Field Registry endpoints
 */
export const FIELD_REGISTRY = {
  GET: `${API_VERSION}/field-registry`,
  VERSIONS: `${API_VERSION}/field-registry/versions`,
  GET_VERSION: (registryVersion: number) =>
    `${API_VERSION}/field-registry/versions/${registryVersion}`,
  GET_VERSION_FIELDS: (registryVersion: number) =>
    `${API_VERSION}/field-registry/versions/${registryVersion}/fields`,
  NEXT_FIELD_ID: `${API_VERSION}/field-registry/next-field-id`,
  PUBLISH: `${API_VERSION}/field-registry/publish`,
} as const;

/**
 * Re-export buildQueryString from shared utilities
 */
export { buildQueryString } from "../shared/utils/url";
