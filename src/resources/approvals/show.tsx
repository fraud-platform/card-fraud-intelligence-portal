/**
 * Approvals Show
 *
 * Displays approval details including entity data changes.
 * Allows checkers to approve or reject pending approvals.
 */

import { useState, useEffect, type FC, type ReactElement } from "react";
import { Show } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import { Button, Card, Input, Modal, Space, Tag, Typography, type ButtonProps } from "antd";
import "./approvals.css";
import { Descriptions } from "../../shared/compat/antdCompat";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import { usePermissions } from "../../hooks/usePermissions";
import type { Approval } from "../../types/domain";
import type { ApprovalDetailResponse, ApprovalDecisionRequest } from "../../api/types";
import { get, post } from "../../api/httpClient";
import { APPROVALS } from "../../api/endpoints";
import { ApprovalStatus } from "../../types/enums";
import { JsonViewer } from "../../shared/components/JsonViewer";
import { getStatusColor, getEntityTypeColor } from "../../theme/tokens";

const { TextArea } = Input;
const { Paragraph } = Typography;

function ApprovalDetailsCard({
  approval,
  entityData,
}: Readonly<{
  approval: Approval;
  entityData: ApprovalDetailResponse["entity_data"];
}>): ReactElement {
  return (
    <Card title="Approval Details" size="small" variant="outlined">
      <Descriptions column={2} size="small" variant="outlined">
        <Descriptions.Item label="Approval ID">{approval.approval_id}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(approval.status)}>{approval.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Entity Type">
          <Tag color={getEntityTypeColor(approval.entity_type)}>{approval.entity_type}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Entity ID">{approval.entity_id}</Descriptions.Item>
        <Descriptions.Item label="Action">
          <Tag>{approval.action}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Entity Name">{entityData.entity_name}</Descriptions.Item>
        <Descriptions.Item label="Submitted By">{approval.maker}</Descriptions.Item>
        <Descriptions.Item label="Submitted At">{approval.created_at}</Descriptions.Item>
        {approval.checker != null && (
          <Descriptions.Item label="Decided By">{approval.checker}</Descriptions.Item>
        )}
        {approval.decided_at != null && (
          <Descriptions.Item label="Decided At">{approval.decided_at}</Descriptions.Item>
        )}
        {approval.remarks != null && approval.remarks !== "" && (
          <Descriptions.Item label="Remarks" span={2}>
            <Paragraph>{approval.remarks}</Paragraph>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

function OriginalDataCard({ data }: Readonly<{ data: unknown }>): ReactElement {
  return (
    <Card title="Original Data" size="small" className="approval-card-spaced" variant="outlined">
      <JsonViewer data={data} copyable maxHeight={400} />
    </Card>
  );
}

function ChangedDataCard({ data }: Readonly<{ data: unknown }>): ReactElement {
  return (
    <Card title="Changed Data" size="small" className="approval-card-spaced" variant="outlined">
      <JsonViewer data={data} copyable maxHeight={400} />
    </Card>
  );
}

function ApprovalDecisionModal({
  title,
  open,
  confirmLoading,
  okText,
  okButtonProps,
  remarks,
  setRemarks,
  onOk,
  onCancel,
}: Readonly<{
  title: string;
  open: boolean;
  confirmLoading: boolean;
  okText: string;
  okButtonProps?: ButtonProps;
  remarks: string;
  setRemarks: (s: string) => void;
  onOk: () => void;
  onCancel: () => void;
}>): ReactElement {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={okText}
      okButtonProps={okButtonProps}
    >
      <Space direction="vertical" className="approval-modal-space">
        <Paragraph>
          {title.includes("Approve")
            ? "Are you sure you want to approve this approval request?"
            : "Are you sure you want to reject this approval request?"}
        </Paragraph>
        <TextArea
          rows={4}
          placeholder="Optional remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Space>
    </Modal>
  );
}

export const ApprovalShow: FC = () => {
  const params = useParams();
  const approvalId = params.id;
  const navigate = useNavigate();
  const { open } = useNotification();

  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState<Approval | null>(null);
  const [entityData, setEntityData] = useState<ApprovalDetailResponse["entity_data"] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  const { capabilities } = usePermissions();
  const canDecide = capabilities.canApproveRules && approval?.status === ApprovalStatus.PENDING;

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      if (approvalId == null || approvalId === "") return;

      try {
        const response = await get<ApprovalDetailResponse>(APPROVALS.GET(approvalId));
        if (cancelled) return;

        setApproval(response.approval);
        setEntityData(response.entity_data);
      } catch (error) {
        if (cancelled) return;
        open?.({
          type: "error",
          message: "Failed to load approval",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [approvalId, open]);

  const handleDecision = async (decision: "APPROVE" | "REJECT"): Promise<void> => {
    if (approvalId == null || approvalId === "") return;

    setIsProcessing(true);

    try {
      const trimmed = remarks.trim();
      const requestData: ApprovalDecisionRequest = {
        decision,
        remarks: trimmed === "" ? undefined : trimmed,
      };

      await post<void>(APPROVALS.DECIDE(approvalId), requestData);

      open?.({
        type: "success",
        message: `Approval ${decision === "APPROVE" ? "approved" : "rejected"}`,
        description: `The approval request has been ${decision === "APPROVE" ? "approved" : "rejected"} successfully.`,
      });

      // Navigate back to list
      void navigate("/approvals");
    } catch (error) {
      open?.({
        type: "error",
        message: `Failed to ${decision === "APPROVE" ? "approve" : "reject"} approval`,
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setShowApproveModal(false);
      setShowRejectModal(false);
      setRemarks("");
    }
  };

  const handleApprove = (): void => {
    setShowApproveModal(true);
  };

  const handleReject = (): void => {
    setShowRejectModal(true);
  };

  const handleApproveConfirm = (): void => {
    void handleDecision("APPROVE");
  };

  const handleRejectConfirm = (): void => {
    void handleDecision("REJECT");
  };

  const handleCancel = (): void => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setRemarks("");
  };

  if (loading) {
    return <Show isLoading contentProps={{ variant: "outlined", size: "small" }} />;
  }

  if (approval === null || entityData === null) {
    return (
      <Show title="Approval not found" contentProps={{ variant: "outlined", size: "small" }} />
    );
  }

  return (
    <Show
      title={`Approval: ${approval.approval_id}`}
      contentProps={{ variant: "outlined", size: "small" }}
      headerButtons={
        canDecide ? (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleApprove}
              loading={isProcessing}
            >
              Approve
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={handleReject} loading={isProcessing}>
              Reject
            </Button>
          </Space>
        ) : undefined
      }
    >
      <ApprovalDetailsCard approval={approval} entityData={entityData} />

      {entityData.old_value != null && <OriginalDataCard data={entityData.old_value} />}

      <ChangedDataCard data={entityData.new_value} />

      <ApprovalDecisionModal
        title="Approve Approval Request"
        open={showApproveModal}
        onOk={handleApproveConfirm}
        onCancel={handleCancel}
        confirmLoading={isProcessing}
        okText="Approve"
        okButtonProps={{ icon: <CheckOutlined /> }}
        remarks={remarks}
        setRemarks={setRemarks}
      />

      <ApprovalDecisionModal
        title="Reject Approval Request"
        open={showRejectModal}
        onOk={handleRejectConfirm}
        onCancel={handleCancel}
        confirmLoading={isProcessing}
        okText="Reject"
        okButtonProps={{ danger: true, icon: <CloseOutlined /> }}
        remarks={remarks}
        setRemarks={setRemarks}
      />
    </Show>
  );
};

export default ApprovalShow;
