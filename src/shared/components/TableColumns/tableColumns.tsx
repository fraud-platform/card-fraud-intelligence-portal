/**
 * Table Column Builders
 *
 * Factory functions for creating common table column patterns.
 * Reduces duplication across list components.
 */

import type { FC } from "react";
import { Space, Tag, Typography } from "antd";
import "./tableColumns.css";
import type { ColumnType } from "antd/es/table";
import { EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import {
  columnWidths,
  getStatusColor,
  getRuleTypeColor,
  getDataTypeColor,
  getEntityTypeColor,
} from "../../../theme/tokens";
import { labelForEnumValue } from "../../utils/format";

/**
 * Action buttons configuration
 */
export interface ActionButtonsConfig {
  /** Enable show button */
  show?: boolean;
  /** Enable edit button */
  edit?: boolean;
  /** Enable delete button */
  delete?: boolean;
  /** Custom action buttons */
  custom?: Array<{
    key: string;
    button: FC<{ record: unknown }>;
  }>;
}

/* eslint-disable react-refresh/only-export-components */
/**
 * Creates a text column with optional ellipsis
 */
export function textColumn<T extends object>(
  dataIndex: keyof T | string,
  title: string,
  options?: {
    width?: number;
    ellipsis?: boolean;
    code?: boolean;
  }
): ColumnType<T> {
  const {
    width = columnWidths.name,
    ellipsis: enableEllipsis = false,
    code = false,
  } = options ?? {};

  return {
    dataIndex: dataIndex as string,
    title,
    width,
    ellipsis: enableEllipsis,
    render: (value: unknown) => {
      if (value == null) return null;
      const content =
        typeof value === "string" || typeof value === "number" || typeof value === "boolean"
          ? String(value)
          : "";
      return code ? (
        <Typography.Text code ellipsis={{ tooltip: content }} className="code-ellipsis">
          {content}
        </Typography.Text>
      ) : (
        <Typography.Text ellipsis={enableEllipsis}>{content}</Typography.Text>
      );
    },
  };
}

/**
 * Creates a status/tag column with color mapping
 */
export function tagColumn<T extends object>(
  dataIndex: keyof T | string,
  title: string,
  colorFn: (value: string) => string,
  options?: {
    width?: number;
    labelFn?: (value: string) => string;
  }
): ColumnType<T> {
  const { width = columnWidths.status, labelFn } = options ?? {};

  return {
    dataIndex: dataIndex as string,
    title,
    width,
    render: (value: unknown) => {
      if (value == null) return null;
      let strValue = "";
      if (typeof value === "string") {
        strValue = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        strValue = String(value);
      }
      const label = labelFn !== undefined ? labelFn(strValue) : strValue;
      return <Tag color={colorFn(strValue)}>{label}</Tag>;
    },
  };
}

/**
 * Creates an actions column with buttons
 */
export function actionsColumn<T extends object>(
  getId: (record: T) => string,
  config: ActionButtonsConfig = {}
): ColumnType<T> {
  const { show = true, edit = true, delete: del = false, custom = [] } = config;

  return {
    title: "Actions",
    dataIndex: "actions",
    width: columnWidths.actions,
    fixed: "right",
    render: (_, record) => (
      <Space size={4}>
        {show && <ShowButton size="small" recordItemId={getId(record)} />}
        {edit && <EditButton size="small" recordItemId={getId(record)} />}
        {del && <DeleteButton size="small" recordItemId={getId(record)} aria-label="delete" />}
        {custom.map(({ key, button: Button }) => (
          <Button key={key} record={record} />
        ))}
      </Space>
    ),
  };
}

/**
 * Pre-configured column builders for common patterns
 */

export const Columns = {
  /** Status column using getStatusColor */
  status: <T extends object>(dataIndex: keyof T | string, title = "Status") =>
    tagColumn(dataIndex, title, getStatusColor),

  /** Rule type column using getRuleTypeColor */
  ruleType: <T extends object>(dataIndex: keyof T | string = "rule_type", title = "Type") =>
    tagColumn(dataIndex, title, getRuleTypeColor),

  /** Entity type column using getEntityTypeColor */
  entityType: <T extends object>(
    dataIndex: keyof T | string = "entity_type",
    title = "Entity Type"
  ) => tagColumn(dataIndex, title, getEntityTypeColor),

  /** Data type column using getDataTypeColor with label formatting */
  dataType: <T extends object>(dataIndex: keyof T | string = "data_type", title = "Type") =>
    tagColumn(dataIndex, title, getDataTypeColor, { labelFn: labelForEnumValue }),

  /** Created by column */
  createdBy: <T extends object>(dataIndex: keyof T | string = "created_by", title = "Created By") =>
    textColumn<T>(dataIndex, title, { width: columnWidths.user, ellipsis: true }),

  /** Created at column */
  createdAt: <T extends object>(dataIndex: keyof T | string = "created_at", title = "Created At") =>
    textColumn<T>(dataIndex, title, { width: columnWidths.date }),

  /** Actions column with show/edit buttons */
  actions: <T extends object>(getId: (record: T) => string, config?: ActionButtonsConfig) =>
    actionsColumn(getId, { show: true, edit: true, ...config }),

  /** Actions column with show only */
  actionsShowOnly: <T extends object>(getId: (record: T) => string) =>
    actionsColumn(getId, { show: true, edit: false, delete: false }),

  /** Actions column with show/edit/delete */
  actionsWithDelete: <T extends object>(getId: (record: T) => string) =>
    actionsColumn(getId, { show: true, edit: true, delete: true }),
} as const;
