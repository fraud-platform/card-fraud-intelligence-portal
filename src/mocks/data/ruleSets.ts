/**
 * Mock data generator for RuleSets
 */

import { RuleSet, RuleSetRule, RuleSetWithRules, CompiledAST } from "../../types/domain";
import { RuleType, RuleSetStatus, Operator, RulesetEnvironment } from "../../types/enums";
import { mockRuleVersions } from "./rules";

/**
 * Generate mock RuleSets
 */
export const mockRuleSets: RuleSet[] = [
  {
    ruleset_id: "rs_001",
    name: "India High Value Blocking",
    description: "Block transactions over $5000 in India",
    rule_type: RuleType.BLOCKLIST,
    environment: RulesetEnvironment.PROD,
    region: "INDIA",
    country: "IN",
    version: 3,
    compiled_ast: {
      rulesetId: "rs_001",
      version: 3,
      ruleType: RuleType.BLOCKLIST,
      evaluation: { mode: "FIRST_MATCH" },
      rules: [
        {
          ruleId: "rule_001",
          priority: 10,
          when: { and: [{ field: "AMOUNT", op: Operator.GT, value: 5000 }] },
          action: "BLOCK",
        },
      ],
    },
    status: RuleSetStatus.ACTIVE,
    created_by: "alice@example.com",
    approved_by: "bob@example.com",
    created_at: "2024-11-01T10:00:00Z",
    updated_at: "2024-11-05T15:00:00Z",
    approved_at: "2024-11-05T15:00:00Z",
    activated_at: "2024-11-06T10:00:00Z",
  },
  {
    ruleset_id: "rs_002",
    name: "US Merchant Whitelist",
    description: "Allow specific US merchants",
    rule_type: RuleType.ALLOWLIST,
    environment: RulesetEnvironment.PROD,
    region: "NAM",
    country: "US",
    version: 2,
    compiled_ast: {
      rulesetId: "rs_002",
      version: 2,
      ruleType: RuleType.ALLOWLIST,
      evaluation: { mode: "FIRST_MATCH" },
      rules: [
        {
          ruleId: "rule_002",
          priority: 5,
          when: { or: [{ field: "MERCHANT_ID", op: Operator.IN, value: ["MER_001"] }] },
          action: "ALLOW",
        },
      ],
    },
    status: RuleSetStatus.ACTIVE,
    created_by: "alice@example.com",
    approved_by: "bob@example.com",
    created_at: "2024-11-02T10:00:00Z",
    updated_at: "2024-11-06T15:00:00Z",
    approved_at: "2024-11-06T15:00:00Z",
    activated_at: "2024-11-07T10:00:00Z",
  },
  {
    ruleset_id: "rs_003",
    name: "Pre-Auth Review Rules",
    description: "Review transactions over $1000",
    rule_type: RuleType.AUTH,
    environment: RulesetEnvironment.PROD,
    region: "NAM",
    country: "US",
    version: 1,
    compiled_ast: {
      rulesetId: "rs_003",
      version: 1,
      ruleType: RuleType.AUTH,
      evaluation: { mode: "FIRST_MATCH" },
      rules: [
        {
          ruleId: "rule_004",
          priority: 15,
          when: { and: [{ field: "AMOUNT", op: Operator.GT, value: 1000 }] },
          action: "REVIEW",
        },
      ],
    },
    status: RuleSetStatus.ACTIVE,
    created_by: "charlie@example.com",
    approved_by: "bob@example.com",
    created_at: "2024-11-05T10:00:00Z",
    updated_at: "2024-11-05T15:00:00Z",
    approved_at: "2024-11-05T15:00:00Z",
    activated_at: "2024-11-06T10:00:00Z",
  },
  {
    ruleset_id: "rs_004",
    name: "EU Post-Auth Analytics",
    description: "Flag low-value EU transactions for analysis",
    rule_type: RuleType.MONITORING,
    environment: RulesetEnvironment.PROD,
    region: "EMEA",
    country: "DE",
    version: 2,
    compiled_ast: {
      rulesetId: "rs_004",
      version: 2,
      ruleType: RuleType.MONITORING,
      evaluation: { mode: "ALL_MATCHING" },
      rules: [
        {
          ruleId: "rule_005",
          priority: 25,
          when: { and: [{ field: "AMOUNT", op: Operator.GT, value: 100 }] },
          action: "FLAG",
        },
      ],
    },
    status: RuleSetStatus.ACTIVE,
    created_by: "diana@example.com",
    approved_by: "bob@example.com",
    created_at: "2024-11-08T10:00:00Z",
    updated_at: "2024-11-15T15:00:00Z",
    approved_at: "2024-11-15T15:00:00Z",
    activated_at: "2024-11-16T10:00:00Z",
  },
  {
    ruleset_id: "rs_005",
    name: "APAC Blocking Rules",
    description: null,
    rule_type: RuleType.BLOCKLIST,
    environment: RulesetEnvironment.PROD,
    region: "APAC",
    country: "SG",
    version: 1,
    compiled_ast: null,
    status: RuleSetStatus.PENDING_APPROVAL,
    created_by: "alice@example.com",
    approved_by: null,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
    approved_at: null,
    activated_at: null,
  },
  {
    ruleset_id: "rs_006",
    name: null,
    description: null,
    rule_type: RuleType.AUTH,
    environment: RulesetEnvironment.TEST,
    region: "NAM",
    country: "CA",
    version: 1,
    compiled_ast: null,
    status: RuleSetStatus.DRAFT,
    created_by: "charlie@example.com",
    approved_by: null,
    created_at: "2024-12-10T10:00:00Z",
    updated_at: "2024-12-10T10:00:00Z",
    approved_at: null,
    activated_at: null,
  },
  {
    ruleset_id: "rs_007",
    name: "LATAM ALLOWLIST Rules",
    description: "Allow list for LATAM region",
    rule_type: RuleType.ALLOWLIST,
    environment: RulesetEnvironment.TEST,
    region: "LATAM",
    country: "BR",
    version: 1,
    compiled_ast: null,
    status: RuleSetStatus.REJECTED,
    created_by: "diana@example.com",
    approved_by: null,
    created_at: "2024-12-12T10:00:00Z",
    updated_at: "2024-12-13T10:00:00Z",
    approved_at: null,
    activated_at: null,
  },
  {
    ruleset_id: "rs_008",
    name: "Legacy India Blocking",
    description: "MCC-based blocking rules for India",
    rule_type: RuleType.BLOCKLIST,
    environment: RulesetEnvironment.PROD,
    region: "INDIA",
    country: "IN",
    version: 2,
    compiled_ast: {
      rulesetId: "rs_008",
      version: 2,
      ruleType: RuleType.BLOCKLIST,
      evaluation: { mode: "FIRST_MATCH" },
      rules: [
        {
          ruleId: "rule_003",
          priority: 20,
          when: { and: [{ field: "MCC", op: Operator.IN, value: ["5967", "7995"] }] },
          action: "BLOCK",
        },
      ],
    },
    status: RuleSetStatus.SUPERSEDED,
    created_by: "alice@example.com",
    approved_by: "bob@example.com",
    created_at: "2024-11-01T10:00:00Z",
    updated_at: "2024-11-20T15:00:00Z",
    approved_at: "2024-11-20T15:00:00Z",
    activated_at: "2024-11-21T10:00:00Z",
  },
];

/**
 * Generate mock RuleSet-Rule associations
 */
export const mockRuleSetRules: RuleSetRule[] = [
  { ruleset_id: "rs_001", rule_version_id: "rv_001_v3" },
  { ruleset_id: "rs_001", rule_version_id: "rv_003_v1" },
  { ruleset_id: "rs_002", rule_version_id: "rv_002_v2" },
  { ruleset_id: "rs_003", rule_version_id: "rv_004_v1" },
  { ruleset_id: "rs_003", rule_version_id: "rv_009_v1" },
  { ruleset_id: "rs_004", rule_version_id: "rv_005_v2" },
  { ruleset_id: "rs_004", rule_version_id: "rv_010_v1" },
  { ruleset_id: "rs_005", rule_version_id: "rv_006_v1" },
  { ruleset_id: "rs_006", rule_version_id: "rv_007_v1" },
  { ruleset_id: "rs_007", rule_version_id: "rv_002_v2" },
  { ruleset_id: "rs_008", rule_version_id: "rv_003_v1" },
];

/**
 * In-memory storage for RuleSets
 */
export class RuleSetStore {
  private ruleSets: Map<string, RuleSet>;
  private ruleSetRules: Map<string, Set<string>>;

  constructor() {
    this.ruleSets = new Map(mockRuleSets.map((rs) => [rs.ruleset_id, rs]));
    this.ruleSetRules = new Map();

    // Initialize associations
    mockRuleSetRules.forEach((assoc) => {
      if (!this.ruleSetRules.has(assoc.ruleset_id)) {
        this.ruleSetRules.set(assoc.ruleset_id, new Set());
      }
      this.ruleSetRules.get(assoc.ruleset_id)!.add(assoc.rule_version_id);
    });
  }

  getAll(): RuleSet[] {
    return Array.from(this.ruleSets.values());
  }

  getById(rulesetId: string): RuleSet | undefined {
    return this.ruleSets.get(rulesetId);
  }

  getWithRules(rulesetId: string): RuleSetWithRules | undefined {
    const ruleSet = this.ruleSets.get(rulesetId);
    if (!ruleSet) return undefined;

    const ruleVersionIds = this.ruleSetRules.get(rulesetId) || new Set();
    const rules = Array.from(ruleVersionIds)
      .map((versionId) => mockRuleVersions.find((v) => v.rule_version_id === versionId))
      .filter((v) => v !== undefined);

    return {
      ...ruleSet,
      rules,
    };
  }

  create(ruleSet: Omit<RuleSet, "version">): RuleSet {
    const newRuleSet: RuleSet = {
      ...ruleSet,
      version: 1,
      compiled_ast: null,
      created_at: ruleSet.created_at || new Date().toISOString(),
      updated_at: ruleSet.updated_at || new Date().toISOString(),
      approved_at: ruleSet.approved_at || null,
      activated_at: ruleSet.activated_at || null,
    };
    this.ruleSets.set(ruleSet.ruleset_id, newRuleSet);
    this.ruleSetRules.set(ruleSet.ruleset_id, new Set());
    return newRuleSet;
  }

  update(rulesetId: string, updates: Partial<RuleSet>): RuleSet | null {
    const existing = this.ruleSets.get(rulesetId);
    if (!existing) return null;

    const updated = { ...existing, ...updates, ruleset_id: rulesetId };
    this.ruleSets.set(rulesetId, updated);
    return updated;
  }

  delete(rulesetId: string): boolean {
    this.ruleSetRules.delete(rulesetId);
    return this.ruleSets.delete(rulesetId);
  }

  getRules(rulesetId: string): string[] {
    return Array.from(this.ruleSetRules.get(rulesetId) || []);
  }

  addRule(rulesetId: string, ruleVersionId: string): boolean {
    if (!this.ruleSets.has(rulesetId)) return false;

    if (!this.ruleSetRules.has(rulesetId)) {
      this.ruleSetRules.set(rulesetId, new Set());
    }

    this.ruleSetRules.get(rulesetId)!.add(ruleVersionId);
    return true;
  }

  removeRule(rulesetId: string, ruleVersionId: string): boolean {
    const rules = this.ruleSetRules.get(rulesetId);
    if (!rules) return false;

    return rules.delete(ruleVersionId);
  }

  compile(rulesetId: string): RuleSet | null {
    const ruleSet = this.ruleSets.get(rulesetId);
    if (!ruleSet) return null;

    const ruleVersionIds = this.ruleSetRules.get(rulesetId) || new Set();
    const rules = Array.from(ruleVersionIds)
      .map((versionId) => mockRuleVersions.find((v) => v.rule_version_id === versionId))
      .filter((v) => v !== undefined);

    const compiledAST: CompiledAST = {
      rulesetId: ruleSet.ruleset_id,
      version: ruleSet.version,
      ruleType: ruleSet.rule_type,
      evaluation: {
        mode: ruleSet.rule_type === RuleType.MONITORING ? "ALL_MATCHING" : "FIRST_MATCH",
      },
      rules: rules.map((rule) => ({
        ruleId: rule.rule_id,
        priority: rule.priority,
        when: rule.condition_tree,
        action: this.getActionForRuleType(ruleSet.rule_type),
      })),
    };

    const updated = { ...ruleSet, compiled_ast: compiledAST };
    this.ruleSets.set(rulesetId, updated);
    return updated;
  }

  private getActionForRuleType(ruleType: RuleType): "ALLOW" | "BLOCK" | "FLAG" | "REVIEW" {
    switch (ruleType) {
      case RuleType.ALLOWLIST:
        return "ALLOW";
      case RuleType.BLOCKLIST:
        return "BLOCK";
      case RuleType.AUTH:
        return "REVIEW";
      case RuleType.MONITORING:
        return "FLAG";
      default:
        return "REVIEW";
    }
  }
}
