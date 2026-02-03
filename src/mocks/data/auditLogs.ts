/**
 * Mock data generator for Audit Logs
 */

import { AuditLog } from "../../types/domain";
import { EntityType, AuditAction } from "../../types/enums";

/**
 * Generate mock AuditLogs
 */
export const mockAuditLogs: AuditLog[] = [
  {
    audit_id: "audit_001",
    entity_type: EntityType.RULE_FIELD,
    entity_id: "CARD_NUMBER",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      field_key: "CARD_NUMBER",
      display_name: "Card Number (PAN)",
      data_type: "STRING",
      is_sensitive: true,
    },
    performed_by: "system",
    performed_at: "2024-01-15T10:00:00Z",
  },
  {
    audit_id: "audit_002",
    entity_type: EntityType.RULE_FIELD,
    entity_id: "MERCHANT_ID",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      field_key: "MERCHANT_ID",
      display_name: "Merchant ID",
      data_type: "STRING",
      is_sensitive: false,
    },
    performed_by: "system",
    performed_at: "2024-01-15T10:00:00Z",
  },
  {
    audit_id: "audit_003",
    entity_type: EntityType.RULE,
    entity_id: "rule_001",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      rule_id: "rule_001",
      rule_name: "High Amount Block - Cross Border",
      rule_type: "NEGATIVE",
      status: "DRAFT",
    },
    performed_by: "user_maker_1",
    performed_at: "2024-11-01T10:00:00Z",
  },
  {
    audit_id: "audit_004",
    entity_type: EntityType.RULE,
    entity_id: "rule_001",
    action: AuditAction.SUBMIT,
    old_value: { status: "DRAFT" },
    new_value: { status: "PENDING_APPROVAL" },
    performed_by: "user_maker_1",
    performed_at: "2024-11-01T11:00:00Z",
  },
  {
    audit_id: "audit_005",
    entity_type: EntityType.RULE,
    entity_id: "rule_001",
    action: AuditAction.APPROVE,
    old_value: { status: "PENDING_APPROVAL" },
    new_value: { status: "APPROVED" },
    performed_by: "user_checker_1",
    performed_at: "2024-11-01T14:00:00Z",
  },
  {
    audit_id: "audit_006",
    entity_type: EntityType.RULE_VERSION,
    entity_id: "rv_001_v3",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      rule_version_id: "rv_001_v3",
      rule_id: "rule_001",
      version: 3,
      priority: 10,
    },
    performed_by: "user_maker_1",
    performed_at: "2024-11-10T10:00:00Z",
  },
  {
    audit_id: "audit_007",
    entity_type: EntityType.RULE_VERSION,
    entity_id: "rv_001_v3",
    action: AuditAction.APPROVE,
    old_value: { status: "PENDING_APPROVAL" },
    new_value: { status: "APPROVED" },
    performed_by: "user_checker_1",
    performed_at: "2024-11-11T10:00:00Z",
  },
  {
    audit_id: "audit_008",
    entity_type: EntityType.RULE,
    entity_id: "rule_002",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      rule_id: "rule_002",
      rule_name: "Trusted Merchant Allowlist",
      rule_type: "POSITIVE",
      status: "DRAFT",
    },
    performed_by: "user_maker_1",
    performed_at: "2024-11-02T10:00:00Z",
  },
  {
    audit_id: "audit_009",
    entity_type: EntityType.RULESET,
    entity_id: "rs_001",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      ruleset_id: "rs_001",
      scope_id: "SCOPE_GLOBAL",
      rule_type: "NEGATIVE",
      version: 1,
    },
    performed_by: "user_maker_2",
    performed_at: "2024-11-01T10:00:00Z",
  },
  {
    audit_id: "audit_010",
    entity_type: EntityType.RULESET,
    entity_id: "rs_001",
    action: AuditAction.COMPILE,
    old_value: { compiled_ast: null },
    new_value: { compiled_ast: "AST_DATA" },
    performed_by: "user_checker_1",
    performed_at: "2024-11-05T15:00:00Z",
  },
  {
    audit_id: "audit_011",
    entity_type: EntityType.RULE,
    entity_id: "rule_003",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      rule_id: "rule_003",
      rule_name: "High-Risk MCC Block",
      rule_type: "NEGATIVE",
      status: "DRAFT",
    },
    performed_by: "user_maker_2",
    performed_at: "2024-11-05T10:00:00Z",
  },
  {
    audit_id: "audit_012",
    entity_type: EntityType.RULE,
    entity_id: "rule_008",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      rule_id: "rule_008",
      rule_name: "Restricted Country Block",
      rule_type: "NEGATIVE",
      status: "DRAFT",
    },
    performed_by: "user_maker_1",
    performed_at: "2024-12-12T10:00:00Z",
  },
  {
    audit_id: "audit_013",
    entity_type: EntityType.RULE,
    entity_id: "rule_008",
    action: AuditAction.REJECT,
    old_value: { status: "PENDING_APPROVAL" },
    new_value: { status: "REJECTED" },
    performed_by: "user_checker_1",
    performed_at: "2024-12-13T10:00:00Z",
  },
  {
    audit_id: "audit_014",
    entity_type: EntityType.RULE_FIELD,
    entity_id: "AMOUNT",
    action: AuditAction.UPDATE,
    old_value: { allowed_operators: ["EQ", "GT"] },
    new_value: { allowed_operators: ["EQ", "GT", "LT", "BETWEEN"] },
    performed_by: "user_maker_2",
    performed_at: "2024-02-01T10:00:00Z",
  },
  {
    audit_id: "audit_015",
    entity_type: EntityType.RULESET,
    entity_id: "rs_005",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      ruleset_id: "rs_005",
      scope_id: "SCOPE_APAC",
      rule_type: "NEGATIVE",
      version: 1,
    },
    performed_by: "user_maker_2",
    performed_at: "2024-12-01T10:00:00Z",
  },
  {
    audit_id: "audit_016",
    entity_type: EntityType.RULE,
    entity_id: "rule_004",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      rule_id: "rule_004",
      rule_name: "Velocity Check - Card Transactions",
      rule_type: "AUTH ",
      status: "DRAFT",
    },
    performed_by: "user_maker_1",
    performed_at: "2024-11-10T10:00:00Z",
  },
  {
    audit_id: "audit_017",
    entity_type: EntityType.RULE,
    entity_id: "rule_005",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      rule_id: "rule_005",
      rule_name: "Suspicious Pattern Detection",
      rule_type: "MONITORING",
      status: "DRAFT",
    },
    performed_by: "user_maker_2",
    performed_at: "2024-11-15T10:00:00Z",
  },
  {
    audit_id: "audit_018",
    entity_type: EntityType.RULE_VERSION,
    entity_id: "rv_005_v2",
    action: AuditAction.UPDATE,
    old_value: { version: 1 },
    new_value: { version: 2 },
    performed_by: "user_maker_2",
    performed_at: "2024-11-20T10:00:00Z",
  },
  {
    audit_id: "audit_019",
    entity_type: EntityType.RULESET,
    entity_id: "rs_007",
    action: AuditAction.CREATE,
    old_value: null,
    new_value: {
      ruleset_id: "rs_007",
      scope_id: "SCOPE_LATAM",
      rule_type: "POSITIVE",
      version: 1,
    },
    performed_by: "user_maker_1",
    performed_at: "2024-12-12T10:00:00Z",
  },
  {
    audit_id: "audit_020",
    entity_type: EntityType.RULESET,
    entity_id: "rs_007",
    action: AuditAction.REJECT,
    old_value: { status: "PENDING_APPROVAL" },
    new_value: { status: "REJECTED" },
    performed_by: "user_checker_2",
    performed_at: "2024-12-13T10:00:00Z",
  },
];

/**
 * In-memory storage for AuditLogs
 */
export class AuditLogStore {
  private logs: Map<string, AuditLog>;
  private counter: number;

  constructor() {
    this.logs = new Map(mockAuditLogs.map((log) => [log.audit_id, log]));
    this.counter = mockAuditLogs.length + 1;
  }

  getAll(): AuditLog[] {
    return Array.from(this.logs.values()).sort(
      (a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );
  }

  getById(auditId: string): AuditLog | undefined {
    return this.logs.get(auditId);
  }

  create(log: Omit<AuditLog, "audit_id" | "performed_at">): AuditLog {
    const auditId = `audit_${String(this.counter++).padStart(3, "0")}`;
    const newLog: AuditLog = {
      ...log,
      audit_id: auditId,
      performed_at: new Date().toISOString(),
    };
    this.logs.set(auditId, newLog);
    return newLog;
  }

  getByEntity(entityType: EntityType, entityId: string): AuditLog[] {
    return Array.from(this.logs.values())
      .filter((log) => log.entity_type === entityType && log.entity_id === entityId)
      .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
  }

  getByUser(userId: string): AuditLog[] {
    return Array.from(this.logs.values())
      .filter((log) => log.performed_by === userId)
      .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());
  }
}
