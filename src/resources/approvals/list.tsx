/**
 * Approvals List
 *
 * Lists all approval requests with filtering by status and entity type.
 * Allows checkers to review pending approvals.
 */

import type { FC } from "react";
import { List, ShowButton, useTable } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { Card, Form, Input, Select, Space, Table, Tag, Typography } from "antd";
import "../../shared/components/FilterForm/filter-form.css";
import "../../shared/styles/widths.css";
import type { Approval } from "../../types/domain";
import { ApprovalStatus, EntityType } from "../../types/enums";
import {
  compactTableProps,
  columnWidths,
  getStatusColor,
  getEntityTypeColor,
  mergePagination,
} from "../../theme/tokens";
import { buildFilters, enumToOptions } from "../../shared/utils/filters";

const approvalStatusOptions = enumToOptions(ApprovalStatus);
const entityTypeOptions = enumToOptions(EntityType);

export const ApprovalList: FC = () => {
  const { tableProps, searchFormProps } = useTable<
    Approval,
    HttpError,
    {
      entity_id?: string;
      status?: ApprovalStatus;
      entity_type?: EntityType;
    }
  >({
    resource: "approvals",
    syncWithLocation: true,
    onSearch: (values) =>
      buildFilters(values, [
        { field: "entity_id", operator: "contains" },
        { field: "status" },
        { field: "entity_type" },
      ]),
  });

  return (
    <List>
      <Card size="small" variant="outlined">
        <Form layout="inline" {...searchFormProps} className="filter-form">
          <Form.Item name="entity_id">
            <Input placeholder="Search by entity ID" allowClear />
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="Status"
              allowClear
              className="w-180"
              options={approvalStatusOptions}
            />
          </Form.Item>
          <Form.Item name="entity_type">
            <Select
              placeholder="Entity type"
              allowClear
              className="w-200"
              options={entityTypeOptions}
            />
          </Form.Item>
        </Form>

        <Table
          {...tableProps}
          {...compactTableProps}
          rowKey="approval_id"
          pagination={mergePagination(tableProps.pagination)}
        >
          <Table.Column<Approval>
            dataIndex="approval_id"
            title="Approval ID"
            width={columnWidths.id}
            ellipsis
          />
          <Table.Column<Approval>
            dataIndex="entity_type"
            title="Entity Type"
            width={columnWidths.type}
            render={(v: EntityType) => <Tag color={getEntityTypeColor(v)}>{v}</Tag>}
          />
          <Table.Column<Approval>
            dataIndex="entity_id"
            title="Entity ID"
            width={columnWidths.id}
            ellipsis
          />
          <Table.Column<Approval>
            dataIndex="status"
            title="Status"
            width={columnWidths.status}
            render={(v: ApprovalStatus) => <Tag color={getStatusColor(v)}>{v}</Tag>}
          />
          <Table.Column<Approval>
            dataIndex="maker"
            title="Submitted By"
            width={columnWidths.user}
            ellipsis
            render={(v: string) => <Typography.Text>{v}</Typography.Text>}
          />
          <Table.Column<Approval>
            dataIndex="created_at"
            title="Submitted At"
            width={columnWidths.date}
          />
          <Table.Column<Approval>
            title="Actions"
            dataIndex="actions"
            width={80}
            fixed="right"
            render={(_, record) => (
              <Space size={4}>
                <ShowButton size="small" recordItemId={record.approval_id} />
              </Space>
            )}
          />
        </Table>
      </Card>
    </List>
  );
};

export default ApprovalList;
