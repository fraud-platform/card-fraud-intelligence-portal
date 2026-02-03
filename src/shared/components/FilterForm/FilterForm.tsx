/**
 * FilterForm Component
 *
 * Reusable filter form component for list views.
 */

import type { FC, ReactNode } from "react";
import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import "./filter-form.css";

/**
 * Configuration for a single filter field
 */
export interface FilterFieldConfig {
  /** Field name (matches form key) */
  name: string;
  /** Display label placeholder */
  placeholder: string;
  /** Width of the input (optional, for Select) */
  width?: number;
  /** Pre-defined options (for Select) */
  options?: Array<{ label: string; value: string | number }>;
  /** Whether to use Select instead of Input */
  isSelect?: boolean;
}

/**
 * Props for the FilterForm component
 */
export interface FilterFormProps {
  /** Form instance from useTable */
  formProps: {
    form?: FormInstance;
    onFinish?: (values: Record<string, unknown>) => void;
  };
  /** Configuration array for filter fields */
  fields: FilterFieldConfig[];
  /** Additional class name */
  className?: string;
}

/**
 * Renders a single filter field based on its config
 */
function renderFilterField(config: FilterFieldConfig): ReactNode {
  const { name, placeholder, width, options, isSelect } = config;

  if (isSelect === true && options != null && options.length > 0) {
    return (
      <Form.Item key={name} name={name}>
        <Select
          placeholder={placeholder}
          allowClear
          className={width != null ? `w-${width}` : undefined}
          options={options}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item key={name} name={name}>
      <Input placeholder={placeholder} allowClear />
    </Form.Item>
  );
}

/**
 * FilterForm Component
 *
 * Renders an inline filter form based on configuration.
 *
 * @example
 * ```tsx
 * <FilterForm
 *   formProps={searchFormProps}
 *   fields={[
 *     { name: 'search', placeholder: 'Search rules' },
 *     { name: 'rule_type', placeholder: 'Rule type', isSelect: true, width: 200, options: ruleTypeOptions },
 *   ]}
 * />
 * ```
 */
export const FilterForm: FC<FilterFormProps> = ({ formProps, fields, className }) => {
  return (
    <Form
      layout="inline"
      form={formProps.form}
      onFinish={formProps.onFinish}
      className={`${className ?? ""} filter-form`}
    >
      {fields.map(renderFilterField)}
    </Form>
  );
};

export default FilterForm;
