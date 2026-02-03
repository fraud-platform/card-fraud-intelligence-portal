/**
 * TransactionSidebar Component
 *
 * Right sidebar containing review actions panel.
 */

import type { FC } from "react";
import { Space, Spin } from "antd";
import type {
  TransactionStatus,
  ResolutionCode,
  AnalystDecision,
  TransactionReview,
} from "../../../types/review";
import { ReviewActionsPanel } from "../../../components/review";

export interface TransactionSidebarProps {
  transactionId: string;
  originalDecision: string;
  review: TransactionReview | null;
  reviewLoading: boolean;
  isUpdating: boolean;
  onStatusChange: (status: TransactionStatus) => Promise<void>;
  onAssign: (analystId: string, analystName?: string) => Promise<void>;
  onResolve: (
    resolutionCode: ResolutionCode,
    resolutionNotes?: string,
    decision?: AnalystDecision,
    decisionReason?: string
  ) => Promise<void>;
  onEscalate: (reason: string, escalateTo?: string) => Promise<void>;
}

/**
 * Transaction sidebar component with review actions
 */
export const TransactionSidebar: FC<TransactionSidebarProps> = ({
  transactionId,
  originalDecision,
  review,
  reviewLoading,
  isUpdating,
  onStatusChange,
  onAssign,
  onResolve,
  onEscalate,
}) => {
  return (
    <Space direction="vertical" size="middle" className="full-width">
      <Spin spinning={reviewLoading}>
        <ReviewActionsPanel
          transactionId={transactionId}
          review={review}
          originalDecision={originalDecision}
          onStatusChange={onStatusChange}
          onAssign={onAssign}
          onResolve={onResolve}
          onEscalate={onEscalate}
          loading={isUpdating}
        />
      </Spin>
    </Space>
  );
};
