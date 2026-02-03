/**
 * RuleSets Edit
 *
 * Form for editing rule sets.
 * Only accessible to makers.
 */

import { type FC } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Alert, Card, Form, Input, Select } from "antd";
import { RuleSetStatus, RuleType } from "../../types/enums";
import { useEditAuthorization } from "../../shared/hooks/useEditAuthorization";

const ruleTypeOptions = Object.values(RuleType).map((v) => ({ label: v, value: v }));
const ruleSetStatusOptions = Object.values(RuleSetStatus).map((v) => ({ label: v, value: v }));

export const RuleSetEdit: FC = () => {
  const { formProps, saveButtonProps, query } = useForm({
    resource: "rulesets",
    redirect: "list",
  });

  const { canEdit, isLoading, reason } = useEditAuthorization({
    resource: "rulesets",
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
            "You do not have permission to edit rule sets. Only makers can edit rule sets."
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
        <Card title="Rule Set Details" size="small" variant="outlined">
          <Form.Item label="RuleSet ID" name="ruleset_id">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Name" name="name">
            <Input disabled placeholder="No name set" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea disabled rows={3} placeholder="No description" />
          </Form.Item>

          <Form.Item
            label="Rule Type"
            name="rule_type"
            rules={[{ required: true, message: "Rule type is required" }]}
          >
            <Select
              placeholder="Select rule type"
              options={ruleTypeOptions}
              aria-label="Rule Type select"
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select
              placeholder="Select status"
              options={ruleSetStatusOptions}
              aria-label="Status select"
            />
          </Form.Item>
        </Card>
      </Form>
    </Edit>
  );
};

export default RuleSetEdit;
