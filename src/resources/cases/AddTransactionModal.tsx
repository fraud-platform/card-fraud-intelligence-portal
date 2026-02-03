import { Modal, Form, Input } from "antd";
import type { ReactElement } from "react";
import type { FormInstance } from "antd/es/form";

export default function AddTransactionModal({
  open,
  onAdd,
  onCancel,
  loading,
  form,
}: Readonly<{
  open: boolean;
  onAdd: () => void;
  onCancel: () => void;
  loading: boolean;
  form: FormInstance<{ transaction_id: string }>;
}>): ReactElement {
  return (
    <Modal
      title="Add Transaction to Case"
      open={open}
      onOk={onAdd}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Add"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="transaction_id"
          label="Transaction ID"
          rules={[{ required: true, message: "Transaction ID is required" }]}
        >
          <Input placeholder="Enter transaction ID" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
