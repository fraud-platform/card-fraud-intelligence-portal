/**
 * Mock data generator for Rules and RuleVersions
 */

import { Rule, RuleVersion, RuleWithVersion } from "../../types/domain";
import { RuleType, RuleStatus, Operator } from "../../types/enums";

/**
 * Generate mock Rules
 */
export const mockRules: Rule[] = [
  {
    rule_id: "rule_001",
    rule_name: "High Amount Block - Cross Border",
    description: "Block transactions over $5000 for cross-border transactions",
    rule_type: RuleType.BLOCKLIST,
    current_version: 3,
    status: RuleStatus.APPROVED,
    created_by: "user_maker_1",
    created_at: "2024-11-01T10:00:00Z",
    updated_at: "2024-11-10T10:00:00Z",
  },
  {
    rule_id: "rule_002",
    rule_name: "Trusted Merchant Allowlist",
    description: "Allow transactions from trusted merchants",
    rule_type: RuleType.ALLOWLIST,
    current_version: 2,
    status: RuleStatus.APPROVED,
    created_by: "user_maker_1",
    created_at: "2024-11-02T10:00:00Z",
    updated_at: "2024-11-15T10:00:00Z",
  },
  {
    rule_id: "rule_003",
    rule_name: "High-Risk MCC Block",
    description: "Block transactions from high-risk merchant categories",
    rule_type: RuleType.BLOCKLIST,
    current_version: 1,
    status: RuleStatus.APPROVED,
    created_by: "user_maker_2",
    created_at: "2024-11-05T10:00:00Z",
    updated_at: "2024-11-05T10:00:00Z",
  },
  {
    rule_id: "rule_004",
    rule_name: "Velocity Check - Card Transactions",
    description: "Detect high-velocity card transactions",
    rule_type: RuleType.AUTH,
    current_version: 1,
    status: RuleStatus.APPROVED,
    created_by: "user_maker_1",
    created_at: "2024-11-10T10:00:00Z",
    updated_at: "2024-11-10T10:00:00Z",
  },
  {
    rule_id: "rule_005",
    rule_name: "Suspicious Pattern Detection",
    description: "Flag suspicious transaction patterns for review",
    rule_type: RuleType.MONITORING,
    current_version: 2,
    status: RuleStatus.APPROVED,
    created_by: "user_maker_2",
    created_at: "2024-11-15T10:00:00Z",
    updated_at: "2024-11-20T10:00:00Z",
  },
  {
    rule_id: "rule_006",
    rule_name: "Weekend Large Transaction Alert",
    description: "Alert for large transactions during weekends",
    rule_type: RuleType.MONITORING,
    current_version: 1,
    status: RuleStatus.PENDING_APPROVAL,
    created_by: "user_maker_1",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
  },
  {
    rule_id: "rule_007",
    rule_name: "VIP Customer Allowlist",
    description: "Allow list for VIP customers",
    rule_type: RuleType.ALLOWLIST,
    current_version: 1,
    status: RuleStatus.DRAFT,
    created_by: "user_maker_2",
    created_at: "2024-12-10T10:00:00Z",
    updated_at: "2024-12-10T10:00:00Z",
  },
  {
    rule_id: "rule_008",
    rule_name: "Restricted Country Block",
    description: null,
    rule_type: RuleType.BLOCKLIST,
    current_version: 1,
    status: RuleStatus.REJECTED,
    created_by: "user_maker_1",
    created_at: "2024-12-12T10:00:00Z",
    updated_at: "2024-12-13T10:00:00Z",
  },
  {
    rule_id: "rule_009",
    rule_name: "ATM Withdrawal Limit",
    description: "Limit ATM withdrawal amounts",
    rule_type: RuleType.AUTH,
    current_version: 1,
    status: RuleStatus.APPROVED,
    created_by: "user_maker_2",
    created_at: "2024-12-15T10:00:00Z",
    updated_at: "2024-12-15T10:00:00Z",
  },
  {
    rule_id: "rule_010",
    rule_name: "Multiple Declined Transactions",
    description: "Detect cards with multiple declined transactions",
    rule_type: RuleType.MONITORING,
    current_version: 1,
    status: RuleStatus.APPROVED,
    created_by: "user_maker_1",
    created_at: "2024-12-18T10:00:00Z",
    updated_at: "2024-12-18T10:00:00Z",
  },
];

/**
 * Generate mock RuleVersions
 */
export const mockRuleVersions: RuleVersion[] = [
  {
    rule_version_id: "rv_001_v3",
    rule_id: "rule_001",
    version: 3,
    condition_tree: {
      and: [
        { field: "AMOUNT", op: Operator.GT, value: 5000 },
        { field: "IS_CROSS_BORDER", op: Operator.EQ, value: true },
      ],
    },
    priority: 10,
    scope: null,
    created_by: "user_maker_1",
    created_at: "2024-11-10T10:00:00Z",
    approved_by: "user_checker_1",
    approved_at: "2024-11-11T10:00:00Z",
    status: RuleStatus.APPROVED,
  },
  {
    rule_version_id: "rv_002_v2",
    rule_id: "rule_002",
    version: 2,
    condition_tree: {
      or: [
        { field: "MERCHANT_ID", op: Operator.IN, value: ["MER_001", "MER_002", "MER_003"] },
        { field: "MCC", op: Operator.IN, value: ["5411", "5912"] },
      ],
    },
    priority: 5,
    scope: null,
    created_by: "user_maker_1",
    created_at: "2024-11-15T10:00:00Z",
    approved_by: "user_checker_2",
    approved_at: "2024-11-16T10:00:00Z",
    status: RuleStatus.APPROVED,
  },
  {
    rule_version_id: "rv_003_v1",
    rule_id: "rule_003",
    version: 1,
    condition_tree: {
      and: [
        {
          field: "MCC",
          op: Operator.IN,
          value: ["5967", "7995", "7273"],
        },
        { field: "AMOUNT", op: Operator.GT, value: 1000 },
      ],
    },
    priority: 20,
    scope: null,
    created_by: "user_maker_2",
    created_at: "2024-11-05T10:00:00Z",
    approved_by: "user_checker_1",
    approved_at: "2024-11-06T10:00:00Z",
    status: RuleStatus.APPROVED,
  },
  {
    rule_version_id: "rv_004_v1",
    rule_id: "rule_004",
    version: 1,
    condition_tree: {
      and: [
        {
          field: {
            type: "VELOCITY",
            aggregation: "COUNT",
            window: { value: 5, unit: "MINUTES" },
            group_by: ["CARD_NUMBER"],
          },
          op: Operator.GT,
          value: 3,
        },
      ],
    },
    priority: 15,
    scope: null,
    created_by: "user_maker_1",
    created_at: "2024-11-10T10:00:00Z",
    approved_by: "user_checker_2",
    approved_at: "2024-11-11T10:00:00Z",
    status: RuleStatus.APPROVED,
  },
  {
    rule_version_id: "rv_005_v2",
    rule_id: "rule_005",
    version: 2,
    condition_tree: {
      and: [
        {
          field: {
            type: "VELOCITY",
            aggregation: "DISTINCT",
            window: { value: 1, unit: "HOURS" },
            group_by: ["CARD_NUMBER", "COUNTRY"],
          },
          op: Operator.GT,
          value: 3,
        },
        { field: "AMOUNT", op: Operator.GT, value: 100 },
      ],
    },
    priority: 25,
    scope: null,
    created_by: "user_maker_2",
    created_at: "2024-11-20T10:00:00Z",
    approved_by: "user_checker_1",
    approved_at: "2024-11-21T10:00:00Z",
    status: RuleStatus.APPROVED,
  },
  {
    rule_version_id: "rv_006_v1",
    rule_id: "rule_006",
    version: 1,
    condition_tree: {
      and: [
        { field: "AMOUNT", op: Operator.GT, value: 10000 },
        {
          or: [
            { field: "TXN_TIME", op: Operator.LIKE, value: "%Saturday%" },
            { field: "TXN_TIME", op: Operator.LIKE, value: "%Sunday%" },
          ],
        },
      ],
    },
    priority: 30,
    scope: null,
    created_by: "user_maker_1",
    created_at: "2024-12-01T10:00:00Z",
    approved_by: null,
    approved_at: null,
    status: RuleStatus.PENDING_APPROVAL,
  },
  {
    rule_version_id: "rv_007_v1",
    rule_id: "rule_007",
    version: 1,
    condition_tree: {
      or: [
        { field: "CARD_NUMBER", op: Operator.IN, value: ["4532********1234", "5425********9876"] },
      ],
    },
    priority: 1,
    scope: null,
    created_by: "user_maker_2",
    created_at: "2024-12-10T10:00:00Z",
    approved_by: null,
    approved_at: null,
    status: RuleStatus.DRAFT,
  },
  {
    rule_version_id: "rv_008_v1",
    rule_id: "rule_008",
    version: 1,
    condition_tree: {
      and: [{ field: "COUNTRY", op: Operator.IN, value: ["KP", "IR", "SY"] }],
    },
    priority: 5,
    scope: null,
    created_by: "user_maker_1",
    created_at: "2024-12-12T10:00:00Z",
    approved_by: "user_checker_1",
    approved_at: "2024-12-13T10:00:00Z",
    status: RuleStatus.REJECTED,
  },
  {
    rule_version_id: "rv_009_v1",
    rule_id: "rule_009",
    version: 1,
    condition_tree: {
      and: [
        { field: "MCC", op: Operator.EQ, value: "6011" },
        { field: "AMOUNT", op: Operator.GT, value: 500 },
      ],
    },
    priority: 12,
    scope: null,
    created_by: "user_maker_2",
    created_at: "2024-12-15T10:00:00Z",
    approved_by: "user_checker_2",
    approved_at: "2024-12-16T10:00:00Z",
    status: RuleStatus.APPROVED,
  },
  {
    rule_version_id: "rv_010_v1",
    rule_id: "rule_010",
    version: 1,
    condition_tree: {
      and: [
        {
          field: {
            type: "VELOCITY",
            aggregation: "COUNT",
            window: { value: 15, unit: "MINUTES" },
            group_by: ["CARD_NUMBER"],
          },
          op: Operator.GTE,
          value: 3,
        },
        { field: "AUTH_CODE", op: Operator.IS_NULL, value: null },
      ],
    },
    priority: 35,
    scope: null,
    created_by: "user_maker_1",
    created_at: "2024-12-18T10:00:00Z",
    approved_by: "user_checker_1",
    approved_at: "2024-12-19T10:00:00Z",
    status: RuleStatus.APPROVED,
  },
];

/**
 * In-memory storage for Rules and RuleVersions
 */
export class RuleStore {
  private rules: Map<string, Rule>;
  private versions: Map<string, RuleVersion[]>;

  constructor() {
    this.rules = new Map(mockRules.map((r) => [r.rule_id, r]));
    this.versions = new Map();

    // Group versions by rule_id
    mockRuleVersions.forEach((version) => {
      if (!this.versions.has(version.rule_id)) {
        this.versions.set(version.rule_id, []);
      }
      this.versions.get(version.rule_id)!.push(version);
    });
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  getRuleById(ruleId: string): Rule | undefined {
    return this.rules.get(ruleId);
  }

  getRuleWithVersion(ruleId: string): RuleWithVersion | undefined {
    const rule = this.rules.get(ruleId);
    if (!rule) return undefined;

    const versions = this.versions.get(ruleId) || [];
    const currentVersion = versions.find((v) => v.version === rule.current_version);

    if (!currentVersion) return undefined;

    return {
      ...rule,
      version_details: currentVersion,
    };
  }

  createRule(rule: Omit<Rule, "created_at" | "current_version">): Rule {
    const newRule: Rule = {
      ...rule,
      current_version: 1,
      created_at: new Date().toISOString(),
      updated_at: rule.updated_at || new Date().toISOString(),
    };
    this.rules.set(rule.rule_id, newRule);
    this.versions.set(rule.rule_id, []);
    return newRule;
  }

  updateRule(ruleId: string, updates: Partial<Rule>): Rule | null {
    const existing = this.rules.get(ruleId);
    if (!existing) return null;

    const updated = { ...existing, ...updates, rule_id: ruleId };
    this.rules.set(ruleId, updated);
    return updated;
  }

  deleteRule(ruleId: string): boolean {
    this.versions.delete(ruleId);
    return this.rules.delete(ruleId);
  }

  getVersions(ruleId: string): RuleVersion[] {
    return this.versions.get(ruleId) || [];
  }

  getVersion(ruleId: string, versionId: string): RuleVersion | undefined {
    const versions = this.versions.get(ruleId) || [];
    return versions.find((v) => v.rule_version_id === versionId);
  }

  createVersion(version: Omit<RuleVersion, "created_at" | "version">): RuleVersion {
    const versions = this.versions.get(version.rule_id) || [];
    const newVersionNumber = Math.max(0, ...versions.map((v) => v.version)) + 1;

    const newVersion: RuleVersion = {
      ...version,
      version: newVersionNumber,
      created_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null,
      status: RuleStatus.DRAFT,
    };

    versions.push(newVersion);
    this.versions.set(version.rule_id, versions);

    // Update rule's current version
    const rule = this.rules.get(version.rule_id);
    if (rule) {
      rule.current_version = newVersionNumber;
      this.rules.set(version.rule_id, rule);
    }

    return newVersion;
  }
}
