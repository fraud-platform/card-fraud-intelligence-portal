/**
 * EscalateModal Component
 *
 * Modal for escalating a transaction to a supervisor.
 */

import React from "react";
import { Modal, Form, Input, Select } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface EscalateFormValues {
  escalation_reason: string;
  escalate_to?: string;
}

interface EscalateModalProps {
  open: boolean;
  onCancel: () => void;
  onEscalate: (reason: string, escalateTo?: string) => void;
  loading?: boolean;
}

// Mock supervisors - in production this would come from an API
const MOCK_SUPERVISORS = [
  {
    id: "auth0|supervisor1",
    name: "Sarah Manager",
    email: "sarah.manager@company.com",
  },
  {
    id: "auth0|supervisor2",
    name: "Mike Director",
    email: "mike.director@company.com",
  },
];

/**
 * Modal for escalating transactions to supervisors
 */
export function EscalateModal({
  open,
  onCancel,
  onEscalate,
  loading = false,
}: EscalateModalProps): React.ReactElement {
  const [form] = Form.useForm<EscalateFormValues>();

  const handleOk = (): void => {
    void form
      .validateFields()
      .then((values: EscalateFormValues) => {
        onEscalate(values.escalation_reason, values.escalate_to);
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
      title="Escalate Transaction"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Escalate"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="escalation_reason"
          label="Escalation Reason"
          rules={[{ required: true, message: "Please provide an escalation reason" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Describe why this transaction needs escalation..."
          />
        </Form.Item>

        <Form.Item name="escalate_to" label="Escalate To (Optional)">
          <Select
            placeholder="Select supervisor (or leave empty for auto-assignment)"
            allowClear
            showSearch
            optionFilterProp="label"
            options={MOCK_SUPERVISORS.map((supervisor) => ({
              value: supervisor.id,
              label: `${supervisor.name} (${supervisor.email})`,
            }))}
            suffixIcon={<UserOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EscalateModal;
