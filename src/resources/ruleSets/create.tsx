/**
 * RuleSets Create
 *
 * Form for creating new rule sets.
 * Only accessible to makers.
 */

import type { FC } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Card, Form, Input, Select } from "antd";
import { RuleType, RulesetEnvironment } from "../../types/enums";

const ruleTypeOptions = Object.values(RuleType).map((v) => ({ label: v, value: v }));

const environmentOptions = Object.values(RulesetEnvironment).map((v) => ({
  label: v,
  value: v,
}));

const regionOptions = [
  { label: "India", value: "INDIA" },
  { label: "NAM", value: "NAM" },
  { label: "APAC", value: "APAC" },
  { label: "EMEA", value: "EMEA" },
  { label: "LATAM", value: "LATAM" },
];

const countryOptions = [
  { label: "India", value: "IN" },
  { label: "Singapore", value: "SG" },
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "GB" },
  { label: "Germany", value: "DE" },
  { label: "Canada", value: "CA" },
  { label: "Australia", value: "AU" },
  { label: "Japan", value: "JP" },
  { label: "Brazil", value: "BR" },
  { label: "France", value: "FR" },
];

export const RuleSetCreate: FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "rulesets",
    redirect: "list",
  });

  return (
    <Create saveButtonProps={saveButtonProps} contentProps={{ variant: "outlined", size: "small" }}>
      <Form {...formProps} layout="vertical">
        <Card title="Rule Set Details" size="small" variant="outlined">
          <Form.Item label="Name" name="name">
            <Input placeholder="Enter ruleset name (optional)" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter description (optional)" rows={3} />
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
            label="Environment"
            name="environment"
            rules={[{ required: true, message: "Environment is required" }]}
            initialValue={RulesetEnvironment.LOCAL}
          >
            <Select
              placeholder="Select environment"
              options={environmentOptions}
              aria-label="Environment select"
            />
          </Form.Item>

          <Form.Item
            label="Region"
            name="region"
            rules={[{ required: true, message: "Region is required" }]}
            initialValue="INDIA"
          >
            <Select
              placeholder="Select region"
              options={regionOptions}
              aria-label="Region select"
            />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: "Country is required" }]}
            initialValue="IN"
          >
            <Select
              placeholder="Select country"
              options={countryOptions}
              aria-label="Country select"
            />
          </Form.Item>
        </Card>
      </Form>
    </Create>
  );
};

export default RuleSetCreate;
