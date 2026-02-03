/**
 * Mock data generator for Approvals
 */

import { Approval } from "../../types/domain";
import { ApprovalStatus, EntityType, AuditAction } from "../../types/enums";

/**
 * Generate mock Approvals
 */
export const mockApprovals: Approval[] = [
  {
    approval_id: "appr_001",
    entity_type: EntityType.RULE,
    entity_id: "rule_001",
    action: AuditAction.CREATE,
    maker: "user_maker_1",
    checker: "user_checker_1",
    status: ApprovalStatus.APPROVED,
    remarks: "Approved after review",
    created_at: "2024-11-01T10:00:00Z",
    decided_at: "2024-11-01T14:00:00Z",
  },
  {
    approval_id: "appr_002",
    entity_type: EntityType.RULE_VERSION,
    entity_id: "rv_001_v3",
    action: AuditAction.UPDATE,
    maker: "user_maker_1",
    checker: "user_checker_1",
    status: ApprovalStatus.APPROVED,
    remarks: "Logic looks correct",
    created_at: "2024-11-10T10:00:00Z",
    decided_at: "2024-11-11T10:00:00Z",
  },
  {
    approval_id: "appr_003",
    entity_type: EntityType.RULE,
    entity_id: "rule_002",
    action: AuditAction.CREATE,
    maker: "user_maker_1",
    checker: "user_checker_2",
    status: ApprovalStatus.APPROVED,
    remarks: null,
    created_at: "2024-11-02T10:00:00Z",
    decided_at: "2024-11-02T16:00:00Z",
  },
  {
    approval_id: "appr_004",
    entity_type: EntityType.RULESET,
    entity_id: "rs_001",
    action: AuditAction.COMPILE,
    maker: "user_maker_2",
    checker: "user_checker_1",
    status: ApprovalStatus.APPROVED,
    remarks: "RuleSet ready for deployment",
    created_at: "2024-11-05T10:00:00Z",
    decided_at: "2024-11-05T15:00:00Z",
  },
  {
    approval_id: "appr_005",
    entity_type: EntityType.RULE,
    entity_id: "rule_003",
    action: AuditAction.CREATE,
    maker: "user_maker_2",
    checker: "user_checker_1",
    status: ApprovalStatus.APPROVED,
    remarks: "High-risk MCC list validated",
    created_at: "2024-11-05T10:00:00Z",
    decided_at: "2024-11-06T10:00:00Z",
  },
  {
    approval_id: "appr_006",
    entity_type: EntityType.RULE,
    entity_id: "rule_006",
    action: AuditAction.CREATE,
    maker: "user_maker_1",
    checker: null,
    status: ApprovalStatus.PENDING,
    remarks: null,
    created_at: "2024-12-01T10:00:00Z",
    decided_at: null,
  },
  {
    approval_id: "appr_007",
    entity_type: EntityType.RULE,
    entity_id: "rule_008",
    action: AuditAction.CREATE,
    maker: "user_maker_1",
    checker: "user_checker_1",
    status: ApprovalStatus.REJECTED,
    remarks: "Country list needs legal review",
    created_at: "2024-12-12T10:00:00Z",
    decided_at: "2024-12-13T10:00:00Z",
  },
  {
    approval_id: "appr_008",
    entity_type: EntityType.RULESET,
    entity_id: "rs_005",
    action: AuditAction.SUBMIT,
    maker: "user_maker_2",
    checker: null,
    status: ApprovalStatus.PENDING,
    remarks: null,
    created_at: "2024-12-01T10:00:00Z",
    decided_at: null,
  },
  {
    approval_id: "appr_009",
    entity_type: EntityType.RULE_FIELD,
    entity_id: "RISK_SCORE",
    action: AuditAction.CREATE,
    maker: "user_maker_2",
    checker: "user_checker_2",
    status: ApprovalStatus.APPROVED,
    remarks: "New field approved for use",
    created_at: "2024-01-17T10:00:00Z",
    decided_at: "2024-01-17T15:00:00Z",
  },
  {
    approval_id: "appr_010",
    entity_type: EntityType.RULE,
    entity_id: "rule_004",
    action: AuditAction.CREATE,
    maker: "user_maker_1",
    checker: "user_checker_2",
    status: ApprovalStatus.APPROVED,
    remarks: "Velocity rule validated",
    created_at: "2024-11-10T10:00:00Z",
    decided_at: "2024-11-11T10:00:00Z",
  },
  {
    approval_id: "appr_011",
    entity_type: EntityType.RULESET,
    entity_id: "rs_007",
    action: AuditAction.SUBMIT,
    maker: "user_maker_1",
    checker: "user_checker_2",
    status: ApprovalStatus.REJECTED,
    remarks: "Incomplete ruleset configuration",
    created_at: "2024-12-12T10:00:00Z",
    decided_at: "2024-12-13T10:00:00Z",
  },
  {
    approval_id: "appr_012",
    entity_type: EntityType.RULE_VERSION,
    entity_id: "rv_005_v2",
    action: AuditAction.UPDATE,
    maker: "user_maker_2",
    checker: "user_checker_1",
    status: ApprovalStatus.APPROVED,
    remarks: "Version update approved",
    created_at: "2024-11-20T10:00:00Z",
    decided_at: "2024-11-21T10:00:00Z",
  },
  {
    approval_id: "appr_013",
    entity_type: EntityType.RULE,
    entity_id: "rule_009",
    action: AuditAction.CREATE,
    maker: "user_maker_2",
    checker: "user_checker_2",
    status: ApprovalStatus.APPROVED,
    remarks: "ATM limits set appropriately",
    created_at: "2024-12-15T10:00:00Z",
    decided_at: "2024-12-16T10:00:00Z",
  },
  {
    approval_id: "appr_014",
    entity_type: EntityType.RULE,
    entity_id: "rule_010",
    action: AuditAction.CREATE,
    maker: "user_maker_1",
    checker: "user_checker_1",
    status: ApprovalStatus.APPROVED,
    remarks: "Good detection logic",
    created_at: "2024-12-18T10:00:00Z",
    decided_at: "2024-12-19T10:00:00Z",
  },
  {
    approval_id: "appr_015",
    entity_type: EntityType.RULESET,
    entity_id: "rs_002",
    action: AuditAction.COMPILE,
    maker: "user_maker_1",
    checker: "user_checker_2",
    status: ApprovalStatus.APPROVED,
    remarks: "Compiled successfully",
    created_at: "2024-11-05T10:00:00Z",
    decided_at: "2024-11-06T10:00:00Z",
  },
];

/**
 * In-memory storage for Approvals
 */
export class ApprovalStore {
  private approvals: Map<string, Approval>;

  constructor() {
    this.approvals = new Map(mockApprovals.map((a) => [a.approval_id, a]));
  }

  getAll(): Approval[] {
    return Array.from(this.approvals.values());
  }

  getById(approvalId: string): Approval | undefined {
    return this.approvals.get(approvalId);
  }

  create(approval: Omit<Approval, "created_at" | "decided_at" | "checker" | "remarks">): Approval {
    const newApproval: Approval = {
      ...approval,
      checker: null,
      status: ApprovalStatus.PENDING,
      remarks: null,
      created_at: new Date().toISOString(),
      decided_at: null,
    };
    this.approvals.set(approval.approval_id, newApproval);
    return newApproval;
  }

  decide(
    approvalId: string,
    decision: {
      checker: string;
      status: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED;
      remarks?: string;
    }
  ): Approval | null {
    const existing = this.approvals.get(approvalId);
    if (!existing) return null;
    if (existing.status !== ApprovalStatus.PENDING) return null;

    const updated: Approval = {
      ...existing,
      checker: decision.checker,
      status: decision.status,
      remarks: decision.remarks || null,
      decided_at: new Date().toISOString(),
    };

    this.approvals.set(approvalId, updated);
    return updated;
  }

  getByEntity(entityType: EntityType, entityId: string): Approval[] {
    return Array.from(this.approvals.values()).filter(
      (a) => a.entity_type === entityType && a.entity_id === entityId
    );
  }

  getPending(): Approval[] {
    return Array.from(this.approvals.values()).filter((a) => a.status === ApprovalStatus.PENDING);
  }
}
