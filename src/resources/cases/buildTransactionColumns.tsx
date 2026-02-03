import { Tooltip, Typography, Button, Popconfirm, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatAmount, formatDateTime } from "./utils";
import type { CaseTransaction } from "./types";

const { Text } = Typography;

export function buildTransactionColumns(
  goTo: (transactionId: string) => void,
  onRemove: (transactionId: string) => void,
  removing: boolean
): ColumnsType<CaseTransaction> {
  return [
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      width: 160,
      render: (id: string) => (
        <Tooltip title={id}>
          <Text copyable className="tx-id-text">
            {id.slice(0, 12)}...
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => formatAmount(amount),
    },
    {
      title: "Decision",
      dataIndex: "decision",
      key: "decision",
      width: 100,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => goTo(record.transaction_id)}>
            View
          </Button>
          <Popconfirm
            title="Remove transaction from case?"
            onConfirm={() => onRemove(record.transaction_id)}
            okText="Remove"
            okButtonProps={{ danger: true, loading: removing }}
          >
            <Button size="small" danger disabled={removing}>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}

export default buildTransactionColumns;
