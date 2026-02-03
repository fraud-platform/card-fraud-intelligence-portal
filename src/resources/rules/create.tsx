/**
 * Rules Create
 *
 * Form for creating new fraud rules with condition builder.
 * Only accessible to makers.
 */

import { useState, useMemo, type FC } from "react";
import { Create, useForm } from "@refinedev/antd";
import { Card, Form, Input, InputNumber, Select, Space, Typography } from "antd";
import type { ConditionNode, GroupNode, RuleVersion } from "../../types/domain";
import { LogicalOperator, RuleType } from "../../types/enums";
import { conditionNodeToPersistedTree } from "../../shared/utils/conditionTree";
import { ConditionBuilder } from "./components/ConditionBuilder";
import { AstPreview } from "./components/AstPreview";
import { ScopeConfig } from "./components/ScopeConfig";
import "./rules.css";

const ruleTypeOptions = Object.values(RuleType).map((v) => ({ label: v, value: v }));

const emptyRoot: GroupNode = { kind: "group", op: LogicalOperator.AND, children: [] };

export const RuleCreate: FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "rules",
    redirect: "list",
  });

  const [condition, setCondition] = useState<ConditionNode>(emptyRoot);
  const [scope, setScope] = useState<RuleVersion["scope"] | null>(null);

  const persistedTree = useMemo(() => conditionNodeToPersistedTree(condition), [condition]);

  const wrappedFormProps = useMemo(() => {
    return {
      ...formProps,
      onFinish: (values: Record<string, unknown>) => {
        const payload = {
          ...values,
          condition_tree: persistedTree,
          scope,
        };
        return formProps.onFinish?.(payload);
      },
    };
  }, [formProps, persistedTree, scope]);

  return (
    <Create saveButtonProps={saveButtonProps} contentProps={{ variant: "outlined", size: "small" }}>
      <Form
        {...wrappedFormProps}
        layout="vertical"
        initialValues={{
          rule_type: RuleType.ALLOWLIST,
          priority: 100,
        }}
      >
        <Form.Item
          label="Rule Name"
          name="rule_name"
          rules={[{ required: true, message: "Rule name is required" }]}
        >
          <Input placeholder="e.g. High amount MCC block" autoComplete="off" />
        </Form.Item>

        <Form.Item
          label="Rule Type"
          name="rule_type"
          rules={[{ required: true, message: "Rule type is required" }]}
        >
          <Select options={ruleTypeOptions} />
        </Form.Item>

        <Form.Item
          label="Priority"
          name="priority"
          rules={[{ required: true, message: "Priority is required" }]}
        >
          <InputNumber min={0} className="full-width" />
        </Form.Item>

        <ScopeConfig value={scope} onChange={setScope} />

        <Card title="Conditions" size="small" variant="outlined">
          <Space direction="vertical" className="full-width" size="small">
            <Typography.Text type="secondary">
              Conditions are stored as structured JSON (no runtime execution in UI).
            </Typography.Text>
            <ConditionBuilder value={condition} onChange={setCondition} />
          </Space>
        </Card>

        <AstPreview ast={persistedTree} title="Condition Tree Preview" />
      </Form>
    </Create>
  );
};

export default RuleCreate;
