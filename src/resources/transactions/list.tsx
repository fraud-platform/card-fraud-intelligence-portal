/**
 * Transactions List
 *
 * Lists all transactions with filtering for fraud analyst review.
 * Supports filtering by decision, card, merchant, date range, and rules.
 */

import { useTable, List, ShowButton } from "@refinedev/antd";
import { useMemo, type FC } from "react";
import type { HttpError } from "@refinedev/core";
import {
  Card,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  DatePicker,
  Button,
  Switch,
  InputNumber,
} from "antd";
import "./list.css";
import type {
  Transaction,
  TransactionDecision,
  DecisionReason,
  EvaluationType,
} from "../../types/transaction";
import type { RiskLevel, TransactionStatus } from "../../types/review";
import {
  columnWidths,
  getDecisionColor,
  getDecisionReasonColor,
  getEvaluationTypeColor,
} from "../../theme/tokens";
import { formatCurrency } from "../../shared/utils/format";
import { buildTransactionFilters } from "./filters";

const { RangePicker } = DatePicker;

const decisionOptions: { label: string; value: TransactionDecision }[] = [
  { label: "APPROVE", value: "APPROVE" },
  { label: "DECLINE", value: "DECLINE" },
];

const reviewStatusOptions: { label: string; value: TransactionStatus }[] = [
  { label: "PENDING", value: "PENDING" },
  { label: "IN_REVIEW", value: "IN_REVIEW" },
  { label: "ESCALATED", value: "ESCALATED" },
  { label: "RESOLVED", value: "RESOLVED" },
  { label: "CLOSED", value: "CLOSED" },
];

const riskLevelOptions: { label: string; value: RiskLevel }[] = [
  { label: "CRITICAL", value: "CRITICAL" },
  { label: "HIGH", value: "HIGH" },
  { label: "MEDIUM", value: "MEDIUM" },
  { label: "LOW", value: "LOW" },
];

const decisionReasonOptions: { label: string; value: DecisionReason }[] = [
  { label: "RULE_MATCH", value: "RULE_MATCH" },
  { label: "VELOCITY_MATCH", value: "VELOCITY_MATCH" },
  { label: "SYSTEM_DECLINE", value: "SYSTEM_DECLINE" },
  { label: "DEFAULT_ALLOW", value: "DEFAULT_ALLOW" },
  { label: "MANUAL_REVIEW", value: "MANUAL_REVIEW" },
];

// Allow this file to re-export helper while keeping fast-refresh benefits
// eslint-disable-next-line react-refresh/only-export-components
export { buildTransactionFilters } from "./filters";

// Component is intentionally large; split if needed in future
// eslint-disable-next-line max-lines-per-function
export const TransactionList: FC = () => {
  const { tableProps, searchFormProps } = useTable<
    Transaction,
    HttpError,
    {
      search?: string;
      decision?: TransactionDecision | null;
      decision_reason?: DecisionReason | null;
      card_id?: string;
      merchant_id?: string;
      from_date?: string;
      to_date?: string;
      rule_id?: string;
      ruleset_id?: string;
      case_id?: string;
      assigned_to_me?: boolean;
      review_status?: TransactionStatus;
      risk_level?: RiskLevel;
      min_amount?: number;
      max_amount?: number;
      date_range?: [unknown, unknown] | null;
    }
  >({
    resource: "transactions",
    syncWithLocation: true,
    onSearch: buildTransactionFilters,
  });

  const columns = useMemo(
    () => [
      {
        dataIndex: "transaction_id",
        title: "Transaction ID",
        width: columnWidths.id,
        ellipsis: true,
        render: (value: string) => (
          <Typography.Text code className="tx-id-code">
            {value.slice(0, 8)}...
          </Typography.Text>
        ),
      },
      {
        dataIndex: "card_last4",
        title: "Card",
        width: 100,
        render: (_: unknown, record: Transaction) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>****{record.card_last4}</Typography.Text>
            <Tag color="blue" className="card-network-tag">
              {record.card_network}
            </Tag>
          </Space>
        ),
      },
      {
        dataIndex: "amount",
        title: "Amount",
        width: 120,
        align: "right" as const,
        render: (_: unknown, record: Transaction) => (
          <Typography.Text>{formatCurrency(record.amount, record.currency)}</Typography.Text>
        ),
      },
      {
        dataIndex: "merchant_id",
        title: "Merchant",
        width: 150,
        ellipsis: true,
        render: (_: unknown, record: Transaction) => (
          <Space direction="vertical" size={0}>
            <Typography.Text ellipsis className="merchant-text">
              {record.merchant_id}
            </Typography.Text>
            <Typography.Text type="secondary" className="merchant-mcc">
              MCC: {record.mcc}
            </Typography.Text>
          </Space>
        ),
      },
      {
        dataIndex: "decision",
        title: "Decision",
        width: 110,
        render: (value: TransactionDecision) => <Tag color={getDecisionColor(value)}>{value}</Tag>,
      },
      {
        dataIndex: "evaluation_type",
        title: "Eval",
        width: 90,
        render: (value: EvaluationType | null | undefined) =>
          value == null ? (
            <Typography.Text type="secondary">-</Typography.Text>
          ) : (
            <Tag color={getEvaluationTypeColor(value)}>{value}</Tag>
          ),
      },
      {
        dataIndex: "decision_reason",
        title: "Reason",
        width: 140,
        render: (value: DecisionReason) => (
          <Tag color={getDecisionReasonColor(value)} className="reason-tag">
            {value}
          </Tag>
        ),
      },
      {
        dataIndex: "ruleset_version",
        title: "Ruleset Ver",
        width: 100,
        align: "center" as const,
        render: (value: number) => <Typography.Text code>v{value}</Typography.Text>,
      },
      {
        dataIndex: "matched_rules",
        title: "Rules Matched",
        width: 120,
        align: "center" as const,
        render: (value: unknown[]) => (
          <Typography.Text strong>{value?.length ?? 0}</Typography.Text>
        ),
      },
      {
        dataIndex: "transaction_timestamp",
        title: "Timestamp",
        width: 170,
        render: (value: string) => (
          <Typography.Text className="timestamp-text">
            {new Date(value).toLocaleString()}
          </Typography.Text>
        ),
      },

      {
        title: "Actions",
        width: 80,
        fixed: "right" as const,
        render: (_: unknown, record: Transaction) => (
          <Space size={4}>
            <ShowButton size="small" recordItemId={record.transaction_id} />
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <List>
      <Card size="small" variant="outlined">
        <Form layout="inline" className="search-form" {...searchFormProps}>
          <Form.Item name="search">
            <Input placeholder="Search transaction ID" allowClear className="w-200" />
          </Form.Item>
          <Form.Item name="decision">
            <Select placeholder="Decision" allowClear className="w-140" options={decisionOptions} />
          </Form.Item>
          <Form.Item name="review_status">
            <Select
              placeholder="Review Status"
              allowClear
              className="w-150"
              options={reviewStatusOptions}
            />
          </Form.Item>
          <Form.Item name="risk_level">
            <Select
              placeholder="Risk Level"
              allowClear
              className="w-130"
              options={riskLevelOptions}
            />
          </Form.Item>
          <Form.Item name="decision_reason">
            <Select
              placeholder="Reason"
              allowClear
              className="w-160"
              options={decisionReasonOptions}
            />
          </Form.Item>
          <Form.Item name="card_id">
            <Input placeholder="Card ID" allowClear className="w-180" />
          </Form.Item>
          <Form.Item name="merchant_id">
            <Input placeholder="Merchant ID" allowClear className="w-180" />
          </Form.Item>
          <Form.Item name="rule_id">
            <Input placeholder="Rule ID" allowClear className="w-180" />
          </Form.Item>
          <Form.Item name="ruleset_id">
            <Input placeholder="Ruleset ID" allowClear className="w-180" />
          </Form.Item>
          <Form.Item name="case_id">
            <Input placeholder="Case ID" allowClear className="w-160" />
          </Form.Item>
          <Form.Item name="assigned_to_me" valuePropName="checked">
            <Switch checkedChildren="My Assigned" unCheckedChildren="All" />
          </Form.Item>
          <Form.Item name="min_amount">
            <InputNumber placeholder="Min Amount" min={0} className="w-140" />
          </Form.Item>
          <Form.Item name="max_amount">
            <InputNumber placeholder="Max Amount" min={0} className="w-140" />
          </Form.Item>
          <Form.Item name="date_range">
            <RangePicker placeholder={["From date", "To date"]} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Filter
            </Button>
          </Form.Item>
        </Form>

        <Table
          {...tableProps}
          columns={columns}
          scroll={{ x: 1200, y: 600 }}
          virtual={true}
          rowKey="transaction_id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} transactions`,
          }}
        />
      </Card>
    </List>
  );
};

export default TransactionList;
