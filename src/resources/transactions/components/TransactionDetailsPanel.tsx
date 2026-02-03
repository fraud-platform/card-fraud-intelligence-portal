/**
 * TransactionDetailsPanel Component
 *
 * Collapsible panel showing transaction information.
 */

import type { FC } from "react";
import { Descriptions, Typography } from "antd";
import { formatCurrency, formatDateTime } from "../../../shared/utils/format";
import type { Transaction } from "../../../types/transaction";

const { Text } = Typography;

export interface TransactionDetailsPanelProps {
  transaction: Transaction;
}

/**
 * Transaction information panel component
 */
export const TransactionDetailsPanel: FC<TransactionDetailsPanelProps> = ({ transaction }) => {
  return (
    <Descriptions size="small" column={2}>
      <Descriptions.Item label="Transaction ID">
        <Text code>{transaction.transaction_id}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Timestamp">
        {formatDateTime(transaction.transaction_timestamp)}
      </Descriptions.Item>
      <Descriptions.Item label="Amount">
        <Text strong>{formatCurrency(transaction.amount, transaction.currency)}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Ingestion Time">
        {formatDateTime(transaction.ingestion_timestamp)}
      </Descriptions.Item>
    </Descriptions>
  );
};
