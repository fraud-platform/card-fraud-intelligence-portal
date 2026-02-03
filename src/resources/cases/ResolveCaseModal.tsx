import { Modal, Form, Input } from "antd";
import type { ReactElement } from "react";
import type { FormInstance } from "antd/es/form";

export default function ResolveCaseModal({
  open,
  onResolve,
  onCancel,
  loading,
  form,
}: Readonly<{
  open: boolean;
  onResolve: () => void;
  onCancel: () => void;
  loading: boolean;
  form: FormInstance<{ resolution_summary: string }>;
}>): ReactElement {
  return (
    <Modal
      title="Resolve Case"
      open={open}
      onOk={onResolve}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Resolve"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="resolution_summary"
          label="Resolution Summary"
          rules={[{ required: true, message: "Please provide a resolution summary" }]}
        >
          <Input.TextArea rows={4} maxLength={2000} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
