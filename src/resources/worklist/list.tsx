/**
 * Worklist List Page
 *
 * Analyst worklist/queue for reviewing transactions.
 */

import { useState, useCallback, useMemo, type FC } from "react";
import { Button, Card, Space, Typography, message } from "antd";
import { useGetIdentity, useGo } from "@refinedev/core";
import "./worklist.css";
import "../worklist/components/worklist-filters.css";
import type { TransactionStatus, RiskLevel } from "../../types/review";
import { patch } from "../../api/httpClient";
import {
  getInitialFilters,
  getQuickViews,
  applyQuickViewToState,
  matchQuickView,
  type WorklistFiltersState,
} from "./utils/filters";
import { REVIEW } from "../../api/endpoints";
import { useWorklist, useWorklistStats, useClaimNext } from "../../hooks";
import { WorklistFilters, WorklistTable, WorklistStatsCards } from "./components";

const { Title } = Typography;

/**
 * Worklist List Page
 */

// Keep workflow filters/stats/table together to reduce prop-drilling across files.
// eslint-disable-next-line max-lines-per-function
const WorklistList: FC = () => {
  const go = useGo();
  const initialFilters = useMemo(() => getInitialFilters(), []);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | null>(initialFilters.status);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | null>(initialFilters.risk);
  const [priorityFilter, setPriorityFilter] = useState<number | null>(initialFilters.priority);
  const [assignedToMe, setAssignedToMe] = useState(initialFilters.assignedOnly);

  const quickViews: Array<{ key: string; label: string; filters: Partial<WorklistFiltersState> }> =
    useMemo(() => getQuickViews(), []);

  const applyQuickView = useCallback((filters: Partial<WorklistFiltersState>) => {
    const f = applyQuickViewToState(filters);
    setStatusFilter(f.status ?? null);
    setRiskFilter(f.risk ?? null);
    setPriorityFilter(f.priority ?? null);
    setAssignedToMe(f.assignedOnly ?? false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter(null);
    setRiskFilter(null);
    setPriorityFilter(null);
    setAssignedToMe(false);
  }, []);

  const isQuickViewActive = useCallback(
    (filters: Partial<WorklistFiltersState>) =>
      matchQuickView(filters, {
        status: statusFilter,
        risk: riskFilter,
        priority: priorityFilter,
        assignedOnly: assignedToMe,
      }),
    [assignedToMe, priorityFilter, riskFilter, statusFilter]
  );

  // Memoize filters to prevent unnecessary refetches
  const filters = useMemo(
    () => ({
      status: statusFilter ?? undefined,
      risk_level_filter: riskFilter ?? undefined,
      priority_filter: priorityFilter ?? undefined,
      assigned_only: assignedToMe,
    }),
    [statusFilter, riskFilter, priorityFilter, assignedToMe]
  );

  const { items, total, isLoading, refetch } = useWorklist({
    filters,
    refreshIntervalMs: 60000,
  });

  const { stats } = useWorklistStats(true, 60000);
  const { claimNext, isClaiming } = useClaimNext();
  const { data: identity } = useGetIdentity<{ id: string; name?: string }>();

  const handleClaimNext = useCallback((): void => {
    const request = {
      ...(riskFilter == null ? {} : { risk_level_filter: riskFilter }),
      ...(priorityFilter == null ? {} : { priority_filter: priorityFilter }),
    };
    claimNext(request)
      .then((item) => {
        if (item == null) {
          void message.info("No transactions available to claim");
          return;
        }
        void message.success("Transaction claimed!");
        go({ to: `/transactions/show/${item.transaction_id}` });
      })
      .catch(() => {
        void message.error("Failed to claim transaction");
      });
  }, [claimNext, go, riskFilter, priorityFilter]);

  const handleViewTransaction = useCallback(
    (transactionId: string) => {
      go({ to: `/transactions/show/${transactionId}` });
    },
    [go]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAssignToMe = useCallback(
    (transactionId: string): void => {
      const identityId = identity?.id;
      if (identityId == null) {
        void message.error("Unable to assign: missing user identity");
        return;
      }
      patch(REVIEW.ASSIGN(transactionId), {
        analyst_id: identityId,
        analyst_name: identity?.name,
      })
        .then(() => {
          void message.success("Assigned to you");
          refetch();
        })
        .catch(() => {
          void message.error("Failed to assign transaction");
        });
    },
    [identity, refetch]
  );

  const handleStartReview = useCallback(
    (transactionId: string): void => {
      patch(REVIEW.STATUS(transactionId), { status: "IN_REVIEW" })
        .then(() => {
          void message.success("Marked as In Review");
          refetch();
        })
        .catch(() => {
          void message.error("Failed to update status");
        });
    },
    [refetch]
  );

  return (
    <Space direction="vertical" size="middle" className="full-width">
      <Title level={4} className="title-no-margin">
        Worklist
      </Title>

      <WorklistStatsCards stats={stats} />

      <Card size="small">
        <Space direction="vertical" size="small" className="full-width">
          <Space wrap align="center">
            <Typography.Text type="secondary" className="muted-small">
              Quick Views:
            </Typography.Text>
            {quickViews.map((view) => (
              <Button
                key={view.key}
                size="small"
                type={isQuickViewActive(view.filters) ? "primary" : "default"}
                onClick={() => applyQuickView(view.filters)}
              >
                {view.label}
              </Button>
            ))}
            <Button size="small" type="link" onClick={handleClearFilters}>
              Clear
            </Button>
          </Space>

          <WorklistFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            riskFilter={riskFilter}
            onRiskFilterChange={setRiskFilter}
            assignedToMe={assignedToMe}
            onAssignedToMeToggle={() => setAssignedToMe(!assignedToMe)}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            isClaiming={isClaiming}
            onClaimNext={handleClaimNext}
          />

          <WorklistTable
            items={items}
            total={total}
            isLoading={isLoading}
            onViewTransaction={handleViewTransaction}
            onAssignToMe={handleAssignToMe}
            onStartReview={handleStartReview}
          />
        </Space>
      </Card>
    </Space>
  );
};

export default WorklistList;
