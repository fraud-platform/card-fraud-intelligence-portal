/**
 * Rule Fields Edit
 *
 * Form for editing existing rule field definitions.
 * Only accessible to makers. field_key is immutable.
 */

import { type FC } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch, Alert, Card } from "antd";
import { DataType, Operator } from "../../types/enums";
import { useEditAuthorization } from "../../shared/hooks/useEditAuthorization";

const dataTypeOptions = Object.values(DataType).map((v) => ({
  label: v,
  value: v,
}));

const operatorOptions = Object.values(Operator).map((v) => ({
  label: v,
  value: v,
}));

export const RuleFieldEdit: FC = () => {
  const { formProps, saveButtonProps, query } = useForm({
    resource: "rule-fields",
    redirect: "list",
  });

  const { canEdit, isLoading, reason } = useEditAuthorization({
    resource: "rule-fields",
    params: query?.data?.data,
  });

  // Show loading or unauthorized message
  if (isLoading) {
    return <Edit isLoading={true} contentProps={{ variant: "outlined", size: "small" }} />;
  }

  if (!canEdit) {
    return (
      <Edit contentProps={{ variant: "outlined", size: "small" }}>
        <Alert
          message="Access Denied"
          description={
            reason ??
            "You do not have permission to edit rule fields. Only makers can edit rule fields."
          }
          type="error"
          showIcon
        />
      </Edit>
    );
  }

  return (
    <Edit saveButtonProps={saveButtonProps} contentProps={{ variant: "outlined", size: "small" }}>
      <Form {...formProps} layout="vertical">
        <Card title="Field Details" size="small" variant="outlined">
          <Form.Item label="Field Key" name="field_key">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Display Name"
            name="display_name"
            rules={[{ required: true, message: "Display name is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Data Type" name="data_type">
            <Select
              options={dataTypeOptions}
              disabled
              placeholder="Select data type"
              aria-label="Data Type select"
            />
          </Form.Item>

          <Form.Item
            label="Allowed Operators"
            name="allowed_operators"
            rules={[{ required: true, message: "Select at least one operator" }]}
          >
            <Select
              mode="multiple"
              options={operatorOptions}
              placeholder="Select operators"
              aria-label="Allowed Operators select"
            />
          </Form.Item>

          <Form.Item label="Multi-value Allowed" name="multi_value_allowed" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Sensitive" name="is_sensitive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Card>
      </Form>
    </Edit>
  );
};

export default RuleFieldEdit;
