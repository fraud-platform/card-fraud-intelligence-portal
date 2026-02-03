/**
 * CardInfoPanel Component
 *
 * Collapsible panel showing card information.
 */

import type { FC } from "react";
import { Descriptions, Tag, Typography } from "antd";
import type { Transaction } from "../../../types/transaction";

const { Text } = Typography;

export interface CardInfoPanelProps {
  transaction: Transaction;
}

/**
 * Card information panel component
 */
export const CardInfoPanel: FC<CardInfoPanelProps> = ({ transaction }) => {
  return (
    <Descriptions size="small" column={2}>
      <Descriptions.Item label="Card ID">
        <Text code>{transaction.card_id}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Last 4 Digits">
        <Text strong>****{transaction.card_last4}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Network">
        <Tag color="blue">{transaction.card_network}</Tag>
      </Descriptions.Item>
    </Descriptions>
  );
};
