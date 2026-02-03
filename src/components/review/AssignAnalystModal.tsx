/**
 * AssignAnalystModal Component
 *
 * Modal for assigning a transaction to an analyst.
 */

import React from "react";
import { Modal, Form, Input, Select, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;
import "./modals.css";

interface AssignFormValues {
  analyst_id: string;
  analyst_id_input?: string;
  notes?: string;
}

interface AssignAnalystModalProps {
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly onAssign: (analystId: string, analystName?: string) => void;
  readonly loading?: boolean;
  readonly currentAssignee?: string | null;
}

// Mock analysts - in production this would come from an API
const MOCK_ANALYSTS = [
  { id: "auth0|analyst1", name: "John Smith", email: "john.smith@company.com" },
  { id: "auth0|analyst2", name: "Jane Doe", email: "jane.doe@company.com" },
  { id: "auth0|analyst3", name: "Bob Wilson", email: "bob.wilson@company.com" },
  {
    id: "auth0|supervisor1",
    name: "Sarah Manager",
    email: "sarah.manager@company.com",
  },
];

/**
 * Modal for assigning transactions to analysts
 */
export function AssignAnalystModal({
  open,
  onCancel,
  onAssign,
  loading = false,
  currentAssignee,
}: AssignAnalystModalProps): React.ReactElement {
  const [form] = Form.useForm<AssignFormValues>();

  const handleOk = async (): Promise<void> => {
    // If user typed a manual analyst id, copy it to analyst_id so validation passes
    const manualRaw: unknown = form.getFieldValue("analyst_id_input");
    const manual =
      typeof manualRaw === "string" && manualRaw.trim() !== "" ? manualRaw.trim() : undefined;
    const selectedRaw: unknown = form.getFieldValue("analyst_id");
    const selected =
      typeof selectedRaw === "string" && selectedRaw.trim() !== "" ? selectedRaw.trim() : undefined;

    if (manual !== undefined && selected === undefined) {
      form.setFieldsValue({ analyst_id: manual });
    }

    try {
      const validatedFields = (await form.validateFields()) as unknown as Record<string, unknown>;
      const analystId = String(validatedFields["analyst_id"]);
      const analyst = MOCK_ANALYSTS.find((a) => a.id === analystId);
      onAssign(analystId, analyst?.name);
      form.resetFields();
    } catch {
      // Validation errors are shown by the form; swallow the rejection to avoid unhandled promise
    }
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Assign Transaction"
      open={open}
      onOk={() => void handleOk()}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Assign"
      destroyOnHidden
    >
      {currentAssignee != null && currentAssignee !== "" && (
        <Text type="secondary" className="modal-block-text">
          Currently assigned to: {currentAssignee}
        </Text>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="analyst_id"
          label="Select Analyst"
          rules={[{ required: true, message: "Please select an analyst" }]}
        >
          <Select
            placeholder="Select an analyst"
            showSearch
            optionFilterProp="label"
            options={MOCK_ANALYSTS.map((analyst) => ({
              value: analyst.id,
              label: `${analyst.name} (${analyst.email})`,
            }))}
            suffixIcon={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item name="analyst_id_input" label="Analyst ID (Manual entry)">
          <Input placeholder="Enter analyst id" />
        </Form.Item>

        <Form.Item name="notes" label="Assignment Notes (Optional)">
          <Input.TextArea rows={2} placeholder="Add notes about this assignment..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AssignAnalystModal;
