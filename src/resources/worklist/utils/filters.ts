import type { TransactionStatus, RiskLevel } from "../../../types/review";

export type WorklistFiltersState = {
  status: TransactionStatus | null;
  risk: RiskLevel | null;
  priority: number | null;
  assignedOnly: boolean;
};

export function getInitialFilters(): WorklistFiltersState {
  const params = new URLSearchParams(globalThis.location.search);
  const status = params.get("status") as TransactionStatus | null;
  const risk = params.get("risk_level_filter") as RiskLevel | null;
  const priorityValue = params.get("priority_filter");
  const assignedOnly = params.get("assigned_only") === "true";

  const priority = priorityValue != null && priorityValue !== "" ? Number(priorityValue) : null;

  const resolvedStatus = status != null && status.length > 0 ? status : null;
  const resolvedRisk = risk != null && (risk as string).length > 0 ? risk : null;

  return {
    status: resolvedStatus,
    risk: resolvedRisk,
    priority: Number.isNaN(priority) ? null : priority,
    assignedOnly,
  };
}

export function getQuickViews(): Array<{
  key: string;
  label: string;
  filters: Partial<WorklistFiltersState>;
}> {
  return [
    {
      key: "my-queue",
      label: "Assigned to me",
      filters: { assignedOnly: true },
    },
    {
      key: "critical",
      label: "Critical Priority",
      filters: { priority: 1, risk: "CRITICAL" as RiskLevel },
    },
    {
      key: "high-risk",
      label: "High Risk",
      filters: { risk: "HIGH" as RiskLevel },
    },
    {
      key: "escalated",
      label: "Escalated Reviews",
      filters: { status: "ESCALATED" as TransactionStatus },
    },
  ];
}

export function applyQuickViewToState(
  filters: Partial<WorklistFiltersState>
): WorklistFiltersState {
  return {
    status: filters.status ?? null,
    risk: filters.risk ?? null,
    priority: filters.priority ?? null,
    assignedOnly: filters.assignedOnly ?? false,
  };
}

export function matchQuickView(
  filters: Partial<WorklistFiltersState>,
  current: WorklistFiltersState
): boolean {
  return (
    (filters.status ?? null) === current.status &&
    (filters.risk ?? null) === current.risk &&
    (filters.priority ?? null) === current.priority &&
    (filters.assignedOnly ?? false) === current.assignedOnly
  );
}
