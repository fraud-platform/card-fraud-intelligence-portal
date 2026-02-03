/**
 * Enterprise Theme Token System
 *
 * Compact, data-dense theme configuration for enterprise admin UI.
 *
 * Design principles:
 * - Maximize data density for power users
 * - Maintain readability with proper contrast
 * - Use semantic colors for status indicators
 * - Keep consistent spacing across all components
 */

import type { ThemeConfig } from "antd";
import { mergePagination as mergePaginationUtil } from "../shared/utils/filters";

// Re-export mergePagination for convenience
export const mergePagination = mergePaginationUtil;

/**
 * Enterprise compact theme configuration
 *
 * Applies globally via ConfigProvider in App.tsx
 */
export const enterpriseTheme: ThemeConfig = {
  token: {
    // Primary brand colors
    colorPrimary: "#1f77d4",
    colorSuccess: "#2cba4a",
    colorWarning: "#ff9c3e",
    colorError: "#e74856",
    colorInfo: "#1890ff",

    // Compact spacing (reduced from defaults)
    padding: 12, // Default 16
    paddingLG: 16, // Default 24
    paddingMD: 12, // Default 16
    paddingSM: 8, // Default 12
    paddingXS: 4, // Default 8
    paddingXXS: 2, // Default 4

    // Compact margins
    margin: 12,
    marginLG: 16,
    marginMD: 12,
    marginSM: 8,
    marginXS: 4,

    // Typography (readable but compact)
    fontSize: 13, // Default 14
    fontSizeHeading1: 24, // Default 38
    fontSizeHeading2: 20, // Default 30
    fontSizeHeading3: 16, // Default 24
    fontSizeHeading4: 14, // Default 20
    fontSizeHeading5: 13, // Default 16

    // Border radius (slightly smaller for compact feel)
    borderRadius: 4, // Default 6

    // Line height (tighter)
    lineHeight: 1.4, // Default 1.5715
  },
  components: {
    // Table component - critical for data density
    Table: {
      cellPaddingBlock: 8, // Default 16
      cellPaddingInline: 12, // Default 16
      cellFontSize: 13, // Match base font
      headerBg: "#fafafa",
      headerColor: "#262626",
      rowHoverBg: "#f0f7ff",
      borderColor: "#e8e8e8",
    },
    // Card component
    Card: {
      paddingLG: 16, // Default 24
    },
    // Form component
    Form: {
      itemMarginBottom: 12, // Default 24
      verticalLabelPadding: "0 0 4px",
    },
    // Button component
    Button: {
      paddingInline: 12,
      paddingBlock: 4,
    },
    // Tag component
    Tag: {
      defaultBg: "#f0f0f0",
    },
    // Layout overrides
    Layout: {
      siderBg: "#001529",
      headerBg: "#fff",
      headerPadding: "0 16px",
      headerHeight: 48, // Default 64
    },
    // Menu overrides
    Menu: {
      itemHeight: 36, // Default 40
      itemMarginBlock: 2,
      iconSize: 14,
    },
    // Select component
    Select: {
      optionFontSize: 13,
      optionPadding: "4px 12px",
    },
    // Input component
    Input: {
      paddingBlock: 4,
      paddingInline: 8,
    },
  },
};

/**
 * Compact table configuration
 *
 * Apply to all Table components for consistent data density:
 *
 * ```tsx
 * <Table {...tableProps} {...compactTableProps} />
 * ```
 */
export const compactTableProps = {
  size: "small" as const,
  variant: "outlined" as const,
  bordered: true,
  scroll: { x: 1200, y: 500 },
  pagination: {
    showSizeChanger: true,
    pageSizeOptions: ["20", "50", "100"],
    defaultPageSize: 20,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
  },
};

/**
 * Standard column widths for consistency across all tables
 */
export const columnWidths = {
  id: 100,
  name: 200,
  type: 100,
  status: 100,
  date: 140,
  user: 120,
  actions: 100,
  version: 60,
  description: 250,
};

/**
 * Color registry for consistent semantic color mapping across all resources.
 *
 * Use the helper functions below to get colors for specific value types.
 */
const COLOR_REGISTRIES: Record<string, Record<string, string>> = {
  status: {
    // Rule/RuleSet statuses
    DRAFT: "blue",
    PENDING_APPROVAL: "orange",
    APPROVED: "green",
    REJECTED: "red",
    ACTIVE: "green",
    INACTIVE: "default",
    ARCHIVED: "default",
    SUPERSEDED: "default",

    // Approval statuses
    PENDING: "orange",

    // Audit action types
    CREATE: "green",
    UPDATE: "blue",
    DELETE: "red",
    SUBMIT: "orange",
    APPROVE: "green",
    REJECT: "red",
    COMPILE: "cyan",
  },
  ruleType: {
    POSITIVE: "green",
    NEGATIVE: "red",
    AUTH: "blue",
    MONITORING: "purple",
  },
  dataType: {
    STRING: "blue",
    NUMBER: "green",
    BOOLEAN: "orange",
    DATE: "purple",
    ENUM: "cyan",
  },
  entityType: {
    RULE: "blue",
    RULESET: "purple",
    RULE_FIELD: "cyan",
    RULE_VERSION: "geekblue",
  },
  decision: {
    APPROVE: "green",
    DECLINE: "red",
  },
  evaluationType: {
    AUTH: "blue",
    MONITORING: "orange",
  },
  decisionReason: {
    RULE_MATCH: "blue",
    VELOCITY_MATCH: "purple",
    SYSTEM_DECLINE: "red",
    DEFAULT_ALLOW: "green",
    MANUAL_REVIEW: "orange",
  },
  // Transaction review status colors
  reviewStatus: {
    PENDING: "default",
    IN_REVIEW: "processing",
    ESCALATED: "warning",
    RESOLVED: "success",
    CLOSED: "default",
  },
  // Risk level colors
  riskLevel: {
    LOW: "green",
    MEDIUM: "gold",
    HIGH: "orange",
    CRITICAL: "red",
  },
  // Priority colors
  priority: {
    "1": "red",
    "2": "orange",
    "3": "gold",
    "4": "blue",
    "5": "default",
  },
  // Note type colors
  noteType: {
    GENERAL: "default",
    INITIAL_REVIEW: "blue",
    CUSTOMER_CONTACT: "cyan",
    MERCHANT_CONTACT: "purple",
    BANK_CONTACT: "geekblue",
    FRAUD_CONFIRMED: "red",
    FALSE_POSITIVE: "green",
    ESCALATION: "orange",
    RESOLUTION: "lime",
    LEGAL_HOLD: "volcano",
    INTERNAL_REVIEW: "gold",
  },
  // Case type colors
  caseType: {
    INVESTIGATION: "blue",
    DISPUTE: "orange",
    CHARGEBACK: "volcano",
    FRAUD_RING: "red",
    ACCOUNT_TAKEOVER: "magenta",
    PATTERN_ANALYSIS: "purple",
    MERCHANT_REVIEW: "geekblue",
    CARD_COMPROMISE: "gold",
    OTHER: "default",
  },
  // Case status colors
  caseStatus: {
    OPEN: "blue",
    IN_PROGRESS: "processing",
    PENDING_INFO: "warning",
    RESOLVED: "success",
    CLOSED: "default",
  },
};

/**
 * Generic color lookup function with default fallback
 */
function getColorFromRegistry(registry: string, value: string): string {
  const key = typeof value === "string" ? value.trim() : String(value);
  return COLOR_REGISTRIES[registry]?.[key] ?? "default";
}

/**
 * Status color mapping
 *
 * Use for consistent status badges across all resources:
 *
 * ```tsx
 * <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
 * ```
 */
export function getStatusColor(status: string): string {
  return getColorFromRegistry("status", status);
}

/**
 * Rule type color mapping
 */
export function getRuleTypeColor(ruleType: string): string {
  return getColorFromRegistry("ruleType", ruleType);
}

/**
 * Data type color mapping for Rule Fields
 */
export function getDataTypeColor(dataType: string): string {
  return getColorFromRegistry("dataType", dataType);
}

/**
 * Entity type color mapping for approvals
 */
export function getEntityTypeColor(entityType: string): string {
  return getColorFromRegistry("entityType", entityType);
}

/**
 * Decision color mapping
 */
export function getDecisionColor(decision: string): string {
  return getColorFromRegistry("decision", decision);
}

/**
 * Evaluation type color mapping
 */
export function getEvaluationTypeColor(evaluationType: string): string {
  return getColorFromRegistry("evaluationType", evaluationType);
}

/**
 * Decision reason color mapping
 */
export function getDecisionReasonColor(reason: string): string {
  return getColorFromRegistry("decisionReason", reason);
}

/**
 * Transaction review status color mapping
 */
export function getReviewStatusColor(status: string): string {
  return getColorFromRegistry("reviewStatus", status);
}

/**
 * Risk level color mapping
 */
export function getRiskLevelColor(level: string): string {
  return getColorFromRegistry("riskLevel", level);
}

/**
 * Priority color mapping (1-5 scale)
 */
export function getPriorityColor(priority: number | string): string {
  return getColorFromRegistry("priority", String(priority));
}

/**
 * Note type color mapping
 */
export function getNoteTypeColor(noteType: string): string {
  return getColorFromRegistry("noteType", noteType);
}

/**
 * Case type color mapping
 */
export function getCaseTypeColor(caseType: string): string {
  return getColorFromRegistry("caseType", caseType);
}

/**
 * Case status color mapping
 */
export function getCaseStatusColor(caseStatus: string): string {
  return getColorFromRegistry("caseStatus", caseStatus);
}
