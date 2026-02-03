/**
 * ReviewActionsPanel Component
 *
 * Panel showing current review status and actions for a transaction.
 * Orchestrates StatusDisplaySection, ReviewActionButtons, and action modals.
 */

import React, { useState, useCallback } from "react";
import { Card, Space, Divider, message } from "antd";
import "./review-actions-panel.css";
import { ClockCircleOutlined } from "@ant-design/icons";
import type {
  TransactionReview,
  TransactionStatus,
  ResolutionCode,
  AnalystDecision,
} from "../../types/review";
import { getActionAvailability } from "../../shared/utils/reviewWorkflow";
import StatusDisplaySection from "./StatusDisplaySection";
import ReviewActionButtons from "./ReviewActionButtons";
import StatusTransitionButton from "./StatusTransitionButton";
import AssignAnalystModal from "./AssignAnalystModal";
import ResolveModal from "./ResolveModal";
import EscalateModal from "./EscalateModal";

interface ReviewActionsPanelProps {
  transactionId?: string;
  review: TransactionReview | null;
  originalDecision?: string;
  onStatusChange?: (status: TransactionStatus) => Promise<void>;
  onAssign?: (analystId: string, analystName?: string) => Promise<void>;
  onResolve?: (
    resolutionCode: ResolutionCode,
    resolutionNotes?: string,
    decision?: AnalystDecision,
    decisionReason?: string
  ) => Promise<void>;
  onEscalate?: (reason: string, escalateTo?: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Panel for displaying and managing transaction review status
 */
export function ReviewActionsPanel({
  review,
  originalDecision,
  onStatusChange,
  onAssign,
  onResolve,
  onEscalate,
  loading = false,
}: ReviewActionsPanelProps): React.ReactElement {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const currentStatus = review?.status ?? "PENDING";
  const actionAvailability = getActionAvailability(currentStatus);

  const handleStatusChange = useCallback(
    (newStatus: TransactionStatus): void => {
      if (onStatusChange == null) return;
      setActionLoading(true);
      onStatusChange(newStatus)
        .then(() => {
          void message.success(`Status changed to ${newStatus}`);
        })
        .catch(() => {
          void message.error("Failed to change status");
        })
        .finally(() => {
          setActionLoading(false);
        });
    },
    [onStatusChange]
  );

  const handleAssign = useCallback(
    (analystId: string, analystName?: string): void => {
      if (onAssign == null) return;
      setActionLoading(true);
      onAssign(analystId, analystName)
        .then(() => {
          void message.success("Transaction assigned successfully");
          setAssignModalOpen(false);
        })
        .catch(() => {
          void message.error("Failed to assign transaction");
        })
        .finally(() => {
          setActionLoading(false);
        });
    },
    [onAssign]
  );

  const handleResolve = useCallback(
    (
      resolutionCode: ResolutionCode,
      resolutionNotes?: string,
      decision?: AnalystDecision,
      decisionReason?: string
    ): void => {
      if (onResolve == null) return;
      setActionLoading(true);
      onResolve(resolutionCode, resolutionNotes, decision, decisionReason)
        .then(() => {
          void message.success("Transaction resolved successfully");
          setResolveModalOpen(false);
        })
        .catch(() => {
          void message.error("Failed to resolve transaction");
        })
        .finally(() => {
          setActionLoading(false);
        });
    },
    [onResolve]
  );

  const handleEscalate = useCallback(
    (reason: string, escalateTo?: string): void => {
      if (onEscalate == null) return;
      setActionLoading(true);
      onEscalate(reason, escalateTo)
        .then(() => {
          void message.success("Transaction escalated successfully");
          setEscalateModalOpen(false);
        })
        .catch(() => {
          void message.error("Failed to escalate transaction");
        })
        .finally(() => {
          setActionLoading(false);
        });
    },
    [onEscalate]
  );

  return (
    <>
      <Card
        size="small"
        title={
          <Space>
            <ClockCircleOutlined />
            Review Status
          </Space>
        }
        extra={
          <StatusTransitionButton
            currentStatus={currentStatus}
            onTransition={handleStatusChange}
            loading={loading || actionLoading}
            disabled={onStatusChange === undefined}
          />
        }
      >
        <StatusDisplaySection review={review} currentStatus={currentStatus} />

        <Divider className="divider-margin" />

        <ReviewActionButtons
          actionAvailability={actionAvailability}
          onAssignClick={() => setAssignModalOpen(true)}
          onResolveClick={() => setResolveModalOpen(true)}
          onEscalateClick={() => setEscalateModalOpen(true)}
          hasAssignHandler={onAssign != null}
          hasResolveHandler={onResolve != null}
          hasEscalateHandler={onEscalate != null}
          disabled={loading || actionLoading}
        />
      </Card>

      <AssignAnalystModal
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onAssign={handleAssign}
        loading={actionLoading}
        currentAssignee={review?.assigned_analyst_name}
      />

      <ResolveModal
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
        onResolve={handleResolve}
        loading={actionLoading}
        originalDecision={originalDecision}
      />

      <EscalateModal
        open={escalateModalOpen}
        onCancel={() => setEscalateModalOpen(false)}
        onEscalate={handleEscalate}
        loading={actionLoading}
      />
    </>
  );
}

export default ReviewActionsPanel;
