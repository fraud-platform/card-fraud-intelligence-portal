/**
 * Audit Logs List
 *
 * Lists all audit log entries with filtering by entity type, action, and date range.
 * Supports search by entity ID and pagination.
 */

import type { FC } from "react";
import { List, ShowButton, useTable } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { Card, DatePicker, Form, Input, Select, Space, Table, Tag, Typography } from "antd";
import "./audit-logs.css";
import "../../shared/styles/widths.css";
import type { AuditLog } from "../../types/domain";
import { AuditAction, EntityType } from "../../types/enums";
import {
  compactTableProps,
  columnWidths,
  getStatusColor,
  mergePagination,
} from "../../theme/tokens";
import { buildFilters, enumToOptions } from "../../shared/utils/filters";

const { RangePicker } = DatePicker;

const entityTypeOptions = enumToOptions(EntityType);
const actionOptions = enumToOptions(AuditAction);

export const AuditLogList: FC = () => {
  const { tableProps, searchFormProps } = useTable<
    AuditLog,
    HttpError,
    {
      entity_id?: string;
      entity_type?: EntityType;
      action?: AuditAction;
      date_from?: string;
      date_to?: string;
    }
  >({
    resource: "audit-logs",
    syncWithLocation: true,
    onSearch: (values) => {
      // Build base filters
      const baseFilters = buildFilters(values, [
        { field: "entity_id", operator: "contains" },
        { field: "entity_type" },
        { field: "action" },
      ]);

      // Add date range filters separately (they use different field names)
      const { date_from, date_to } = values;
      return [
        ...baseFilters,
        ...(date_from != null && date_from !== ""
          ? [{ field: "performed_at", operator: "gte" as const, value: date_from }]
          : []),
        ...(date_to != null && date_to !== ""
          ? [{ field: "performed_at", operator: "lte" as const, value: date_to }]
          : []),
      ];
    },
  });

  return (
    <List>
      <Card size="small" variant="outlined">
        <Form layout="inline" {...searchFormProps} className="filter-form audit-filter-form">
          <Form.Item name="entity_id">
            <Input placeholder="Search by entity ID" allowClear className="w-200" />
          </Form.Item>
          <Form.Item name="entity_type">
            <Select
              placeholder="Entity type"
              allowClear
              className="w-180"
              options={entityTypeOptions}
            />
          </Form.Item>
          <Form.Item name="action">
            <Select placeholder="Action" allowClear className="w-150" options={actionOptions} />
          </Form.Item>
          <Form.Item name="date_from" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="date_to" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Date range">
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              onChange={(dates) => {
                if (dates?.[0] != null && dates[1] != null) {
                  searchFormProps.form?.setFieldsValue({
                    date_from: dates[0].toISOString(),
                    date_to: dates[1].toISOString(),
                  });
                } else {
                  searchFormProps.form?.setFieldsValue({
                    date_from: undefined,
                    date_to: undefined,
                  });
                }
                searchFormProps.form?.submit();
              }}
            />
          </Form.Item>
        </Form>

        <Table
          {...tableProps}
          {...compactTableProps}
          rowKey="audit_id"
          pagination={mergePagination(tableProps.pagination)}
        >
          <Table.Column<AuditLog>
            dataIndex="audit_id"
            title="Audit ID"
            width={columnWidths.id}
            render={(v: string) => (
              <Typography.Text code ellipsis={{ tooltip: v }} className="code-ellipsis">
                {v}
              </Typography.Text>
            )}
          />
          <Table.Column<AuditLog>
            dataIndex="entity_type"
            title="Entity Type"
            width={columnWidths.type}
            render={(v: EntityType) => <Tag color="blue">{v}</Tag>}
          />
          <Table.Column<AuditLog>
            dataIndex="entity_id"
            title="Entity ID"
            width={columnWidths.id}
            render={(v: string) => (
              <Typography.Text code ellipsis={{ tooltip: v }} className="code-ellipsis">
                {v}
              </Typography.Text>
            )}
          />
          <Table.Column<AuditLog>
            dataIndex="action"
            title="Action"
            width={90}
            render={(v: AuditAction) => <Tag color={getStatusColor(v)}>{v}</Tag>}
          />
          <Table.Column<AuditLog>
            dataIndex="performed_by"
            title="Performed By"
            width={columnWidths.user}
            ellipsis
          />
          <Table.Column<AuditLog>
            dataIndex="performed_at"
            title="Timestamp"
            width={columnWidths.date}
            render={(v: string) => <Typography.Text>{v}</Typography.Text>}
          />
          <Table.Column<AuditLog>
            title="Actions"
            dataIndex="actions"
            width={80}
            fixed="right"
            render={(_, record) => (
              <Space size={4}>
                <ShowButton size="small" recordItemId={record.audit_id} />
              </Space>
            )}
          />
        </Table>
      </Card>
    </List>
  );
};

export default AuditLogList;
