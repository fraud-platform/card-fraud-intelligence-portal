/**
 * Value Editor Components
 *
 * Extracted from ConditionBuilder for maintainability.
 * Provides input components for different value types.
 */

import React from "react";
import { DatePicker, Input, InputNumber, Select, Space, Typography } from "antd";
import type { Dayjs } from "dayjs";
import type { RuleField } from "../../../../types/domain";
import { DataType, Operator } from "../../../../types/enums";
import "./condition-builder.css";
import { type ValidationError, MAX_STRING_LENGTH, MAX_MULTI_VALUES } from "./validation";

export interface ValueEditorProps {
  field?: RuleField;
  operator: Operator;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
  validationErrors?: ValidationError[];
}

function isNoValueOperator(op: Operator): boolean {
  return op === Operator.IS_NULL || op === Operator.IS_NOT_NULL;
}

function isRangeOperator(op: Operator): boolean {
  return op === Operator.BETWEEN;
}

function isMultiOperator(op: Operator): boolean {
  return op === Operator.IN || op === Operator.NOT_IN;
}

export function NumericRangeEditor({
  value,
  disabled,
  onChange,
  validationErrors,
}: Readonly<ValueEditorProps>): React.ReactElement {
  const v = Array.isArray(value) ? value : [];
  const min = typeof v[0] === "number" ? v[0] : undefined;
  const max = typeof v[1] === "number" ? v[1] : undefined;
  const hasError = validationErrors?.some((e) => e.field === "value") ?? false;

  return (
    <Space>
      <InputNumber
        disabled={disabled}
        placeholder="Min"
        value={min}
        onChange={(next) => onChange([next ?? null, max ?? null])}
        status={hasError ? "error" : undefined}
      />
      <Typography.Text>to</Typography.Text>
      <InputNumber
        disabled={disabled}
        placeholder="Max"
        value={max}
        onChange={(next) => onChange([min ?? null, next ?? null])}
        status={hasError ? "error" : undefined}
      />
    </Space>
  );
}

export function DateRangeEditor({
  disabled,
  onChange,
  validationErrors,
}: Readonly<ValueEditorProps>): React.ReactElement {
  const hasError = validationErrors?.some((e) => e.field === "value") ?? false;
  return (
    <DatePicker.RangePicker
      disabled={disabled}
      onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates?.[0] == null || dates[1] == null) {
          onChange([]);
          return;
        }
        onChange([dates[0].toISOString(), dates[1].toISOString()]);
      }}
      status={hasError ? "error" : undefined}
      placeholder={["Start date", "End date"]}
    />
  );
}

export function StringRangeEditor({
  value,
  disabled,
  onChange,
  validationErrors,
}: Readonly<ValueEditorProps>): React.ReactElement {
  const v = Array.isArray(value) ? value : [];
  const min = typeof v[0] === "string" ? v[0] : "";
  const max = typeof v[1] === "string" ? v[1] : "";
  const hasError = validationErrors?.some((e) => e.field === "value") ?? false;

  return (
    <Space>
      <Input
        disabled={disabled}
        placeholder="Min"
        value={min}
        onChange={(e) => onChange([e.target.value, max])}
        status={hasError ? "error" : undefined}
        maxLength={MAX_STRING_LENGTH}
      />
      <Typography.Text>to</Typography.Text>
      <Input
        disabled={disabled}
        placeholder="Max"
        value={max}
        onChange={(e) => onChange([min, e.target.value])}
        status={hasError ? "error" : undefined}
        maxLength={MAX_STRING_LENGTH}
      />
    </Space>
  );
}

export function RangeValueEditor(props: Readonly<ValueEditorProps>): React.ReactElement {
  const { field } = props;
  const dataType = field?.data_type;

  if (dataType === DataType.NUMBER) {
    return <NumericRangeEditor {...props} />;
  }

  if (dataType === DataType.DATE) {
    return <DateRangeEditor {...props} />;
  }

  return <StringRangeEditor {...props} />;
}

export function MultiValueEditor(props: Readonly<ValueEditorProps>): React.ReactElement {
  const { value, disabled, onChange, validationErrors } = props;
  const v = Array.isArray(value) ? value.map(String) : [];
  const hasError = validationErrors?.some((e) => e.field === "value") ?? false;
  const valueCount = v.length;

  return (
    <div className="value-min-width-220">
      <Select
        disabled={disabled}
        mode="tags"
        className="full-width"
        value={v}
        onChange={(next) => {
          if (next.length > MAX_MULTI_VALUES) {
            // Don't allow more than max values
            return;
          }
          onChange(next);
        }}
        placeholder="Enter one or more values (press Enter after each)"
        status={hasError ? "error" : undefined}
        maxTagCount="responsive"
      />
      <Typography.Text type="secondary" className="value-help-text">
        {valueCount} / {MAX_MULTI_VALUES} values
      </Typography.Text>
    </div>
  );
}

export function SingleValueEditor(props: Readonly<ValueEditorProps>): React.ReactElement {
  const { field, value, disabled, onChange, validationErrors } = props;
  const dataType = field?.data_type;
  const hasError = validationErrors?.some((e) => e.field === "value") ?? false;

  if (dataType === DataType.NUMBER) {
    return (
      <InputNumber
        disabled={disabled}
        value={typeof value === "number" ? value : undefined}
        onChange={(n) => onChange(n ?? null)}
        className="value-min-width-160"
        status={hasError ? "error" : undefined}
        placeholder="Enter number"
      />
    );
  }

  if (dataType === DataType.DATE) {
    return (
      <DatePicker
        disabled={disabled}
        onChange={(d) => onChange(d === null ? null : d.toISOString())}
        status={hasError ? "error" : undefined}
        placeholder="Select date"
      />
    );
  }

  const stringValue = typeof value === "string" ? value : "";
  const showCount = dataType === DataType.STRING || dataType === undefined || dataType === null;

  return (
    <Input
      disabled={disabled}
      value={stringValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value"
      className="value-min-width-220"
      status={hasError ? "error" : undefined}
      maxLength={MAX_STRING_LENGTH}
      showCount={showCount ? { formatter: (info) => `${info.count}/${MAX_STRING_LENGTH}` } : false}
    />
  );
}

export function ValueEditor(props: Readonly<ValueEditorProps>): React.ReactElement | null {
  const { field, operator, value, disabled, onChange, validationErrors } = props;
  if (isNoValueOperator(operator)) {
    return null;
  }

  if (isRangeOperator(operator)) {
    return (
      <RangeValueEditor
        field={field}
        operator={operator}
        value={value}
        disabled={disabled}
        onChange={onChange}
        validationErrors={validationErrors}
      />
    );
  }

  if (isMultiOperator(operator)) {
    return (
      <MultiValueEditor
        field={field}
        operator={operator}
        value={value}
        disabled={disabled}
        onChange={onChange}
        validationErrors={validationErrors}
      />
    );
  }

  return (
    <SingleValueEditor
      field={field}
      operator={operator}
      value={value}
      disabled={disabled}
      onChange={onChange}
      validationErrors={validationErrors}
    />
  );
}
