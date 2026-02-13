/**
 * Rule Fields List
 *
 * Lists all available rule fields with filtering and search.
 * Allows makers to view and manage metadata-driven field definitions.
 * Now includes field registry versioning support with field_id and status.
 */

import type { FC } from "react";
import { List, CreateButton, EditButton, ShowButton, useTable } from "@refinedev/antd";
import { useGo, type HttpError } from "@refinedev/core";
import { Card, Form, Input, Space, Table, Tag } from "antd";
import type { RuleField } from "../../types/domain";
import { DataType, Operator } from "../../types/enums";
import {
  compactTableProps,
  columnWidths,
  getDataTypeColor,
  mergePagination,
} from "../../theme/tokens";
import { labelForEnumValue } from "../../shared/utils/format";
import { buildFilters } from "../../shared/utils/filters";
import "./list.css";

// This list component intentionally keeps table/search in one place for maintainability.
// eslint-disable-next-line max-lines-per-function
export const RuleFieldList: FC = () => {
  const { tableProps, searchFormProps } = useTable<
    RuleField,
    HttpError,
    {
      search?: string;
      data_type?: DataType;
      is_active?: boolean;
    }
  >({
    syncWithLocation: true,
    onSearch: (values) =>
      buildFilters(values, [
        { field: "search", operator: "contains" },
        { field: "data_type" },
        { field: "is_active" },
      ]),
  });

  const go = useGo();

  return (
    <List headerButtons={<CreateButton />}>
      <Card size="small" variant="outlined">
        <Form layout="inline" {...searchFormProps} className="form-spaced">
          <Form.Item name="search">
            <Input placeholder="Search fields" allowClear />
          </Form.Item>
          <Form.Item name="data_type">
            <Input placeholder="Data type (e.g. STRING)" allowClear />
          </Form.Item>
          <Form.Item name="is_active">
            <Input placeholder="is_active (true/false)" allowClear />
          </Form.Item>
        </Form>

        <Table
          {...tableProps}
          {...compactTableProps}
          rowKey="field_key"
          pagination={mergePagination(tableProps.pagination)}
          onRow={(record) => ({
            onDoubleClick: () => {
              go({ to: { resource: "rule-fields", action: "show", id: record.field_key } });
            },
          })}
        >
          <Table.Column<RuleField>
            dataIndex="field_id"
            title="ID"
            width={60}
            align="center"
            render={(value: RuleField["field_id"]) => value ?? <Tag>-</Tag>}
          />
          <Table.Column<RuleField>
            dataIndex="field_key"
            title="Field Key"
            width={150}
            render={(value: RuleField["field_key"]) => <Tag color="blue">{value}</Tag>}
          />
          <Table.Column<RuleField>
            dataIndex="display_name"
            title="Display Name"
            width={columnWidths.name}
            ellipsis
          />
          <Table.Column<RuleField>
            dataIndex="data_type"
            title="Type"
            width={90}
            render={(value: DataType) => (
              <Tag color={getDataTypeColor(value)}>{labelForEnumValue(value)}</Tag>
            )}
          />
          <Table.Column<RuleField>
            dataIndex="allowed_operators"
            title="Operators"
            width={200}
            render={(ops: Operator[]) => {
              const operators = ops ?? [];
              return (
                <Space wrap size={2}>
                  {operators.slice(0, 3).map((op) => (
                    <Tag key={op} className="tag-mb-2">
                      {op}
                    </Tag>
                  ))}
                  {operators.length > 3 && <Tag>+{operators.length - 3}</Tag>}
                </Space>
              );
            }}
          />
          <Table.Column<RuleField>
            dataIndex="multi_value_allowed"
            title="Multi"
            width={60}
            align="center"
            render={(v: boolean) => (v ? <Tag color="green">Y</Tag> : <Tag>N</Tag>)}
          />
          <Table.Column<RuleField>
            dataIndex="is_sensitive"
            title="Sens"
            width={60}
            align="center"
            render={(v: boolean) => (v ? <Tag color="orange">Y</Tag> : <Tag>N</Tag>)}
          />
          <Table.Column<RuleField>
            dataIndex="is_active"
            title="Active"
            width={70}
            align="center"
            render={(v: boolean) => (v ? <Tag color="green">Y</Tag> : <Tag color="red">N</Tag>)}
          />
          <Table.Column<RuleField>
            dataIndex="current_version"
            title="Ver"
            width={60}
            align="center"
            render={(v: RuleField["current_version"]) => v ?? "-"}
          />
          <Table.Column<RuleField>
            dataIndex="current_status"
            title="Status"
            width={130}
            render={(status: string) => {
              if (status === undefined || status === null || status === "") return <Tag>-</Tag>;
              const statusConfig: Record<string, { color: string; label: string }> = {
                DRAFT: { color: "default", label: "Draft" },
                PENDING_APPROVAL: { color: "warning", label: "Pending" },
                APPROVED: { color: "success", label: "Approved" },
                REJECTED: { color: "error", label: "Rejected" },
                SUPERSEDED: { color: "info", label: "Superseded" },
              };
              const config = statusConfig[status] ?? { color: "default", label: status };
              return <Tag color={config.color}>{config.label}</Tag>;
            }}
          />
          <Table.Column<RuleField>
            title="Actions"
            dataIndex="actions"
            width={120}
            fixed="right"
            render={(_, record) => (
              <Space size={4}>
                <ShowButton size="small" recordItemId={record.field_key} />
                <EditButton size="small" recordItemId={record.field_key} />
              </Space>
            )}
          />
        </Table>
      </Card>
    </List>
  );
};

export default RuleFieldList;
