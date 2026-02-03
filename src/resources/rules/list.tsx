/**
 * Rules List
 *
 * Lists all rules with filtering by type and status.
 * Supports search and pagination.
 */

import type { FC } from "react";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { Card, Form, Input, Select, Space, Table, Tag } from "antd";
import type { Rule } from "../../types/domain";
import { RuleStatus, RuleType } from "../../types/enums";
import {
  compactTableProps,
  columnWidths,
  getStatusColor,
  getRuleTypeColor,
  mergePagination,
} from "../../theme/tokens";
import { buildRuleFilters } from "./filters";
import { RuleVersionsDrawer } from "./components/RuleVersionsDrawer";
import { enumToOptions } from "../../shared/utils/filters";

const ruleTypeOptions = enumToOptions(RuleType);
const ruleStatusOptions = enumToOptions(RuleStatus);

export const RuleList: FC = () => {
  const { tableProps, searchFormProps } = useTable<
    Rule,
    HttpError,
    {
      search?: string;
      rule_type?: RuleType;
      status?: RuleStatus;
    }
  >({
    resource: "rules",
    syncWithLocation: true,
    onSearch: buildRuleFilters,
  });

  return (
    <List headerButtons={<CreateButton />}>
      <Card size="small" variant="outlined">
        <Form layout="inline" {...searchFormProps} className="form-spaced">
          <Form.Item name="search">
            <Input placeholder="Search rules" allowClear />
          </Form.Item>
          <Form.Item name="rule_type">
            <Select
              placeholder="Rule type"
              allowClear
              className="w-200"
              options={ruleTypeOptions}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="Status" allowClear className="w-220" options={ruleStatusOptions} />
          </Form.Item>
        </Form>

        <Table
          {...tableProps}
          {...compactTableProps}
          rowKey="rule_id"
          pagination={mergePagination(tableProps.pagination)}
        >
          <Table.Column<Rule>
            dataIndex="rule_name"
            title="Name"
            width={columnWidths.name}
            ellipsis={{ showTitle: true }}
          />
          <Table.Column<Rule>
            dataIndex="rule_type"
            title="Type"
            width={columnWidths.type}
            render={(v: RuleType) => <Tag color={getRuleTypeColor(v)}>{v}</Tag>}
          />
          <Table.Column<Rule>
            dataIndex="status"
            title="Status"
            width={columnWidths.status}
            render={(v: RuleStatus) => <Tag color={getStatusColor(v)}>{v}</Tag>}
          />
          <Table.Column<Rule>
            dataIndex="current_version"
            title="Ver"
            width={columnWidths.version}
            align="center"
            render={(_, record) => (
              <RuleVersionsDrawer
                ruleId={record.rule_id}
                ruleName={record.rule_name}
                currentVersion={record.current_version}
              />
            )}
          />
          <Table.Column<Rule>
            dataIndex="created_by"
            title="Created By"
            width={columnWidths.user}
            ellipsis
          />
          <Table.Column<Rule> dataIndex="created_at" title="Created At" width={columnWidths.date} />
          <Table.Column<Rule>
            title="Actions"
            dataIndex="actions"
            width={columnWidths.actions}
            fixed="right"
            render={(_, record) => (
              <Space size={4}>
                <ShowButton size="small" recordItemId={record.rule_id} />
                <EditButton size="small" recordItemId={record.rule_id} />
                <DeleteButton size="small" recordItemId={record.rule_id} aria-label="delete" />
              </Space>
            )}
          />
        </Table>
      </Card>
    </List>
  );
};

export default RuleList;
