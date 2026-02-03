import { Space, Button, Spin, Empty, Form, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { type ReactElement, useState } from "react";
import { useGetIdentity, useGo } from "@refinedev/core";
import { CASE_TYPE_CONFIG, CASE_STATUS_CONFIG } from "../../types/case";
import { useCase, useCaseActivity } from "../../hooks";
import CaseHeader from "./CaseHeader";
import CaseTabs from "./CaseTabs";
import ResolveCaseModal from "./ResolveCaseModal";
import AddTransactionModal from "./AddTransactionModal";
import buildTransactionColumns from "./buildTransactionColumns";
import "./case-show.css";
import useCaseTransactions from "./useCaseTransactions";

export default function CaseShowView({ caseId }: { caseId?: string }): ReactElement {
  const go = useGo();

  const {
    case_: caseData,
    isLoading: caseLoading,
    update,
    resolve,
    addTransaction,
    removeTransaction,
    isUpdating,
  } = useCase({
    caseId: caseId ?? "",
    enabled: caseId !== undefined && caseId !== "",
  });

  const { activities, isLoading: activityLoading } = useCaseActivity({
    caseId: caseId ?? "",
    enabled: caseId !== undefined && caseId !== "",
  });

  const { data: identity } = useGetIdentity<{ id: string; name?: string }>();
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [addTxnModalOpen, setAddTxnModalOpen] = useState(false);
  const [resolveForm] = Form.useForm<{ resolution_summary: string }>();
  const [addTxnForm] = Form.useForm<{ transaction_id: string }>();

  // Fetch case transactions
  const { transactions, txnLoading } = useCaseTransactions(caseId);
  const transactionColumns = buildTransactionColumns(
    (id) => go({ to: `/transactions/show/${id}` }),
    (transactionId) => {
      removeTransaction(transactionId)
        .then(() => {
          void message.success("Transaction removed from case");
        })
        .catch(() => {
          void message.error("Failed to remove transaction");
        });
    },
    isUpdating
  );

  if (caseLoading) {
    return (
      <div className="centered-spin">
        <Spin size="large" />
      </div>
    );
  }

  if (caseData === null) {
    return (
      <Empty description="Case not found">
        <Button onClick={() => go({ to: "/cases" })}>Back to Cases</Button>
      </Empty>
    );
  }

  const typeConfig = CASE_TYPE_CONFIG[caseData.case_type];
  const statusConfig = CASE_STATUS_CONFIG[caseData.case_status];

  const handleAssignToMe = (): void => {
    if (identity?.id == null) {
      void message.error("Unable to assign: missing user identity");
      return;
    }
    update({ assigned_analyst_id: identity.id })
      .then(() => void message.success("Case assigned to you"))
      .catch(() => void message.error("Failed to assign case"));
  };

  const handleResolveCase = (): void => {
    void resolveForm.validateFields().then((values) => {
      resolve({
        resolution_summary: values.resolution_summary,
        resolved_by: identity?.name ?? identity?.id,
      })
        .then(() => {
          void message.success("Case resolved");
          setResolveModalOpen(false);
          resolveForm.resetFields();
        })
        .catch(() => void message.error("Failed to resolve case"));
    });
  };

  const handleAddTransaction = (): void => {
    void addTxnForm.validateFields().then((values) => {
      addTransaction(values.transaction_id)
        .then(() => {
          void message.success("Transaction added to case");
          setAddTxnModalOpen(false);
          addTxnForm.resetFields();
        })
        .catch(() => void message.error("Failed to add transaction"));
    });
  };

  return (
    <Space direction="vertical" size="middle" className="case-show-root">
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => go({ to: "/cases" })}>
          Back to Cases
        </Button>
      </Space>

      <Space>
        {caseData.assigned_analyst_id !== identity?.id && (
          <Button onClick={handleAssignToMe} loading={isUpdating}>
            Assign to Me
          </Button>
        )}
        <Button onClick={() => setAddTxnModalOpen(true)}>Add Transaction</Button>
        {caseData.case_status !== "RESOLVED" && caseData.case_status !== "CLOSED" && (
          <Button type="primary" danger onClick={() => setResolveModalOpen(true)}>
            Resolve Case
          </Button>
        )}
      </Space>

      <CaseHeader caseData={caseData} typeConfig={typeConfig} statusConfig={statusConfig} />

      <CaseTabs
        transactions={transactions}
        txnLoading={txnLoading}
        activities={activities}
        activityLoading={activityLoading}
        transactionColumns={transactionColumns}
      />

      <ResolveCaseModal
        open={resolveModalOpen}
        onResolve={handleResolveCase}
        onCancel={() => {
          setResolveModalOpen(false);
          resolveForm.resetFields();
        }}
        loading={isUpdating}
        form={resolveForm}
      />

      <AddTransactionModal
        open={addTxnModalOpen}
        onAdd={handleAddTransaction}
        onCancel={() => {
          setAddTxnModalOpen(false);
          addTxnForm.resetFields();
        }}
        loading={isUpdating}
        form={addTxnForm}
      />
    </Space>
  );
}
