/**
 * ResolveModal Component
 *
 * Modal for resolving a transaction with resolution code and notes.
 */

import React from "react";
import { Modal, Form, Select, Input, Radio, Typography, Space } from "antd";
import type { ResolutionCode, AnalystDecision } from "../../types/review";

const { Text } = Typography;
import "./modals.css";

interface ResolveFormValues {
  resolution_code: ResolutionCode;
  resolution_notes: string;
  override_decision?: boolean;
  analyst_decision?: AnalystDecision;
  analyst_decision_reason?: string;
}

interface ResolveModalProps {
  open: boolean;
  onCancel: () => void;
  onResolve: (
    resolutionCode: ResolutionCode,
    resolutionNotes?: string,
    decision?: AnalystDecision,
    decisionReason?: string
  ) => void;
  loading?: boolean;
  originalDecision?: string;
}

const RESOLUTION_CODES: Array<{
  value: ResolutionCode;
  label: string;
  description: string;
}> = [
  {
    value: "FRAUD_CONFIRMED",
    label: "Fraud Confirmed",
    description: "Transaction confirmed as fraudulent",
  },
  {
    value: "FALSE_POSITIVE",
    label: "False Positive",
    description: "Transaction incorrectly flagged",
  },
  {
    value: "LEGITIMATE",
    label: "Legitimate",
    description: "Valid transaction by cardholder",
  },
  {
    value: "DUPLICATE",
    label: "Duplicate",
    description: "Duplicate investigation",
  },
  {
    value: "INSUFFICIENT_INFO",
    label: "Insufficient Info",
    description: "Cannot determine - insufficient information",
  },
];

/**
 * Modal for resolving transaction reviews
 */
export function ResolveModal({
  open,
  onCancel,
  onResolve,
  loading = false,
  originalDecision,
}: ResolveModalProps): React.ReactElement {
  const [form] = Form.useForm<ResolveFormValues>();
  const overrideDecision = Form.useWatch("override_decision", form);

  const handleOk = (): void => {
    void form
      .validateFields()
      .then((values: ResolveFormValues) => {
        onResolve(
          values.resolution_code,
          values.resolution_notes,
          values.override_decision === true ? values.analyst_decision : undefined,
          values.analyst_decision_reason
        );
        form.resetFields();
      })
      .catch(() => {
        // Validation errors are shown by the form; swallow the rejection to avoid unhandled promise
      });
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Resolve Transaction"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Resolve"
      destroyOnHidden
      width={520}
    >
      {originalDecision != null && originalDecision !== "" && (
        <Text type="secondary" className="modal-block-text">
          Original engine decision: <Text strong>{originalDecision}</Text>
        </Text>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="resolution_code"
          label="Resolution Code"
          rules={[{ required: true, message: "Please select a resolution code" }]}
        >
          <Select placeholder="Select resolution code">
            {RESOLUTION_CODES.map((code) => (
              <Select.Option key={code.value} value={code.value}>
                <Space direction="vertical" size={0}>
                  <Text>{code.label}</Text>
                  <Text type="secondary" className="modal-desc-small">
                    {code.description}
                  </Text>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="resolution_notes"
          label="Resolution Notes"
          rules={[{ required: true, message: "Please add resolution notes" }]}
        >
          <Input.TextArea rows={3} placeholder="Describe your findings and rationale..." />
        </Form.Item>

        <Form.Item name="override_decision" valuePropName="checked">
          <Radio.Group>
            <Radio value={false}>Keep original decision</Radio>
            <Radio value={true}>Override decision</Radio>
          </Radio.Group>
        </Form.Item>

        {overrideDecision === true && (
          <>
            <Form.Item
              name="analyst_decision"
              label="Analyst Decision Override"
              rules={[{ required: true, message: "Please select override decision" }]}
            >
              <Radio.Group>
                <Radio value="APPROVE">Approve</Radio>
                <Radio value="DECLINE">Decline</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="analyst_decision_reason"
              label="Override Reason"
              rules={[{ required: true, message: "Please explain the override" }]}
            >
              <Input.TextArea
                rows={2}
                placeholder="Explain why you are overriding the engine decision..."
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}

export default ResolveModal;
