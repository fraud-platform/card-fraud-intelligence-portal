/**
 * EditNoteModal Component
 *
 * Modal for editing an existing analyst note.
 */

import React, { useEffect } from "react";
import { Modal, Form, Select, Input, Space, Typography } from "antd";
import {
  NOTE_TYPE_CONFIG,
  type NoteType,
  type AnalystNote,
  type NoteUpdateRequest,
} from "../../types/notes";
import "./notes.css";

interface EditNoteFormValues extends NoteUpdateRequest {
  note_type: NoteType;
  note_content: string;
}

const { Text } = Typography;

interface EditNoteModalProps {
  open: boolean;
  note: AnalystNote | null;
  onCancel: () => void;
  onSubmit: (noteId: string, note: NoteUpdateRequest) => void;
  loading?: boolean;
}

const NOTE_TYPES: NoteType[] = [
  "GENERAL",
  "INITIAL_REVIEW",
  "CUSTOMER_CONTACT",
  "MERCHANT_CONTACT",
  "BANK_CONTACT",
  "FRAUD_CONFIRMED",
  "FALSE_POSITIVE",
  "ESCALATION",
  "RESOLUTION",
  "LEGAL_HOLD",
  "INTERNAL_REVIEW",
];

/**
 * Modal for editing analyst notes
 */
export function EditNoteModal({
  open,
  note,
  onCancel,
  onSubmit,
  loading = false,
}: EditNoteModalProps): React.ReactElement {
  const [form] = Form.useForm<EditNoteFormValues>();

  useEffect(() => {
    if (open && note != null) {
      form.setFieldsValue({
        note_type: note.note_type,
        note_content: note.note_content,
      });
    }
  }, [open, note, form]);

  const handleOk = (): void => {
    if (note == null) return;
    void form.validateFields().then((values) => {
      onSubmit(note.id, {
        note_type: values.note_type,
        note_content: values.note_content,
      });
      form.resetFields();
    });
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Edit Note"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Save Changes"
      width={520}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="note_type"
          label="Note Type"
          rules={[{ required: true, message: "Please select a note type" }]}
        >
          <Select>
            {NOTE_TYPES.map((type) => (
              <Select.Option key={type} value={type}>
                <Space>
                  <div
                    className={`note-type-swatch note-swatch-${NOTE_TYPE_CONFIG[type]?.color === "default" ? "default" : NOTE_TYPE_CONFIG[type]?.color}`}
                  />

                  {NOTE_TYPE_CONFIG[type]?.label ?? type}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="note_content"
          label="Note Content"
          rules={[
            { required: true, message: "Please enter note content" },
            { min: 5, message: "Note must be at least 5 characters" },
          ]}
        >
          <Input.TextArea rows={4} placeholder="Update your note..." maxLength={2000} showCount />
        </Form.Item>

        <Text type="secondary" className="note-private-text">
          Private/system flags cannot be changed after creation.
        </Text>
      </Form>
    </Modal>
  );
}

export default EditNoteModal;
