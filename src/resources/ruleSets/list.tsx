/**
 * RuleSets List
 *
 * Lists all rule sets with filtering by type and status.
 * Supports search and pagination.
 */

import type { FC } from "react";
import { CreateButton, EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { Card, Form, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { RuleSet } from "../../types/domain";
import { RuleSetStatus, RuleType } from "../../types/enums";
import {
  compactTableProps,
  columnWidths,
  getStatusColor,
  getRuleTypeColor,
  mergePagination,
} from "../../theme/tokens";
import { buildRuleSetFilters } from "./filters";
import { RuleSetVersionsDrawer } from "./components/RuleSetVersionsDrawer";
import { enumToOptions } from "../../shared/utils/filters";

const ruleTypeOptions = enumToOptions(RuleType);
const ruleSetStatusOptions = enumToOptions(RuleSetStatus);

export const RuleSetList: FC = () => {
  const { tableProps, searchFormProps } = useTable<
    RuleSet,
    HttpError,
    {
      search?: string;
      rule_type?: RuleType;
      status?: RuleSetStatus;
    }
  >({
    resource: "rulesets",
    syncWithLocation: true,
    onSearch: buildRuleSetFilters,
  });

  return (
    <List headerButtons={<CreateButton />}>
      <Card size="small" variant="outlined">
        <Form layout="inline" {...searchFormProps} className="form-spaced">
          <Form.Item name="search">
            <Input placeholder="Search rule sets" allowClear />
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
            <Select
              placeholder="Status"
              allowClear
              className="w-220"
              options={ruleSetStatusOptions}
            />
          </Form.Item>
        </Form>

        <Table
          {...tableProps}
          {...compactTableProps}
          rowKey="ruleset_id"
          pagination={mergePagination(tableProps.pagination)}
        >
          <Table.Column<RuleSet>
            dataIndex="ruleset_id"
            title="RuleSet ID"
            width={columnWidths.id}
            ellipsis
          />
          <Table.Column<RuleSet>
            dataIndex="name"
            title="Name"
            width={200}
            ellipsis
            render={(v: string | null) =>
              v ?? <Typography.Text type="secondary">Unnamed</Typography.Text>
            }
          />
          <Table.Column<RuleSet>
            dataIndex="rule_type"
            title="Type"
            width={columnWidths.type}
            render={(v: RuleType) => <Tag color={getRuleTypeColor(v)}>{v}</Tag>}
          />
          <Table.Column<RuleSet>
            dataIndex="version"
            title="Ver"
            width={columnWidths.version}
            align="center"
            render={(v: number, record) => (
              <RuleSetVersionsDrawer
                rulesetId={record.ruleset_id}
                rulesetName={record.name}
                currentVersion={v}
              />
            )}
          />
          <Table.Column<RuleSet>
            dataIndex="status"
            title="Status"
            width={columnWidths.status}
            render={(v: RuleSetStatus) => <Tag color={getStatusColor(v)}>{v}</Tag>}
          />
          <Table.Column<RuleSet>
            dataIndex="created_by"
            title="Created By"
            width={columnWidths.user}
            ellipsis
          />
          <Table.Column<RuleSet>
            title="Actions"
            dataIndex="actions"
            width={columnWidths.actions}
            fixed="right"
            render={(_, record) => (
              <Space size={4}>
                <ShowButton size="small" recordItemId={record.ruleset_id} />
                <EditButton size="small" recordItemId={record.ruleset_id} />
              </Space>
            )}
          />
        </Table>
      </Card>
    </List>
  );
};

export default RuleSetList;
