/**
 * Rule Fields Create
 *
 * Form for creating new rule field definitions.
 * Only accessible to makers.
 * Now includes auto-suggested field_id from the field registry API.
 */

import { useEffect, type FC, useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import { useCan, useNavigation, useNotification } from "@refinedev/core";
import { Alert, Card, Form, Input, InputNumber, Select, Switch, Typography } from "antd";
import "./list.css";
import { DataType, Operator } from "../../types/enums";
import { fieldDefinitionsApi } from "../../api/fieldDefinitions";
import { dataProvider } from "../../app/dataProvider";

const { Text } = Typography;

const dataTypeOptions = Object.values(DataType).map((v) => ({
  label: v,
  value: v,
}));

const operatorOptions = Object.values(Operator).map((v) => ({
  label: v,
  value: v,
}));

interface FieldFormLike {
  setFieldsValue: (values: { field_id: number }) => void;
}

type NotifyFn =
  | ((args: { type: "warning" | "error"; message: string; description: string }) => void)
  | undefined;

async function getFallbackFieldId(): Promise<number | null> {
  try {
    const response = await dataProvider.getList<{ field_id?: number }>({
      resource: "rule-fields",
      pagination: { pageSize: 1000 },
    });

    const usedIds = new Set(
      response.data
        .map((item) => item.field_id)
        .filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0)
    );

    for (let candidate = 1; candidate <= 10000; candidate += 1) {
      if (!usedIds.has(candidate)) {
        return candidate;
      }
    }
  } catch {
    // ignore and use timestamp fallback below
  }

  const timeBasedCandidate = (Math.floor(Date.now() / 1000) % 9000) + 1000;
  return timeBasedCandidate;
}

async function hydrateFieldId(
  form: FieldFormLike | undefined,
  open: NotifyFn,
  setNextFieldId: (id: number | null) => void,
  setIsLoadingFieldId: (isLoading: boolean) => void
): Promise<void> {
  try {
    const response = await fieldDefinitionsApi.getNextFieldId();
    setNextFieldId(response.next_field_id);
    form?.setFieldsValue({ field_id: response.next_field_id });
  } catch {
    const fallbackId = await getFallbackFieldId();
    if (fallbackId !== null) {
      setNextFieldId(fallbackId);
      form?.setFieldsValue({ field_id: fallbackId });
      open?.({
        type: "warning",
        message: "Using fallback field ID",
        description: `Auto-suggest service unavailable. Using fallback ID ${fallbackId}.`,
      });
    } else {
      open?.({
        type: "error",
        message: "Failed to fetch next field ID",
        description: "Please enter a field ID manually.",
      });
      setNextFieldId(null);
    }
  } finally {
    setIsLoadingFieldId(false);
  }
}

/**
 * Helper component to render the field ID help text based on loading state
 */
interface FieldIdHelpTextProps {
  isLoading: boolean;
  nextFieldId: number | null;
}

const FieldIdHelpText: FC<FieldIdHelpTextProps> = ({ isLoading, nextFieldId }) => {
  if (isLoading) {
    return <Text type="secondary">Loading next field ID...</Text>;
  }
  if (nextFieldId !== null) {
    return (
      <Text type="secondary">Auto-suggested: {nextFieldId}. Can be overridden if needed.</Text>
    );
  }
  return <Text type="warning">Failed to load auto-suggested ID. Please enter manually.</Text>;
};

export const RuleFieldCreate: FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "rule-fields",
    redirect: "show",
  });
  const { open } = useNotification();

  const { data: canCreateData } = useCan({ resource: "rule-fields", action: "create" });
  const { list } = useNavigation();

  const [nextFieldId, setNextFieldId] = useState<number | null>(null);
  const [isLoadingFieldId, setIsLoadingFieldId] = useState(true);

  useEffect(() => {
    void hydrateFieldId(
      formProps.form as FieldFormLike | undefined,
      open as NotifyFn,
      setNextFieldId,
      setIsLoadingFieldId
    );
  }, [formProps.form, open]);

  useEffect(() => {
    if (canCreateData != null && !canCreateData.can) {
      list("rule-fields");
    }
  }, [canCreateData, list]);

  if (canCreateData == null) {
    return <Create isLoading contentProps={{ variant: "outlined", size: "small" }} />;
  }

  if (!canCreateData.can) {
    return (
      <Create contentProps={{ variant: "outlined", size: "small" }}>
        <Alert
          message="Access Denied"
          description={
            canCreateData.reason ??
            "You do not have permission to create rule fields. Only makers can create rule fields."
          }
          type="error"
          showIcon
        />
      </Create>
    );
  }

  return (
    <Create saveButtonProps={saveButtonProps} contentProps={{ variant: "outlined", size: "small" }}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          is_active: true,
          is_sensitive: false,
          multi_value_allowed: false,
          allowed_operators: [Operator.EQ],
          data_type: DataType.STRING,
          field_id: nextFieldId,
        }}
      >
        <Card title="Field Details" size="small" variant="outlined">
          <Form.Item
            label="Field ID"
            name="field_id"
            rules={[{ required: true, message: "Field ID is required" }]}
            extra={<FieldIdHelpText isLoading={isLoadingFieldId} nextFieldId={nextFieldId} />}
          >
            <InputNumber
              min={1}
              max={10000}
              className="full-width"
              placeholder="e.g. 27"
              disabled={isLoadingFieldId}
            />
          </Form.Item>

          <Form.Item
            label="Field Key"
            name="field_key"
            rules={[
              { required: true, message: "Field key is required" },
              {
                pattern: /^[a-z][a-z0-9_]*$/,
                message: "Must be snake_case starting with a letter",
              },
            ]}
            extra="Unique identifier in snake_case (e.g., risk_score, txn_count_24h)"
          >
            <Input placeholder="e.g. risk_score" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Display Name"
            name="display_name"
            rules={[{ required: true, message: "Display name is required" }]}
          >
            <Input placeholder="e.g. Risk Score" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={2}
              placeholder="Explain what this field represents and how it should be used"
            />
          </Form.Item>

          <Form.Item
            label="Data Type"
            name="data_type"
            rules={[{ required: true, message: "Data type is required" }]}
          >
            <Select
              options={dataTypeOptions}
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
    </Create>
  );
};

export default RuleFieldCreate;
