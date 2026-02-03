/**
 * MerchantInfoPanel Component
 *
 * Collapsible panel showing merchant information.
 */

import type { FC } from "react";
import { Descriptions, Tag, Typography } from "antd";
import type { Transaction } from "../../../types/transaction";

const { Text } = Typography;

export interface MerchantInfoPanelProps {
  transaction: Transaction;
}

/**
 * Merchant information panel component
 */
export const MerchantInfoPanel: FC<MerchantInfoPanelProps> = ({ transaction }) => {
  return (
    <Descriptions size="small" column={2}>
      <Descriptions.Item label="Merchant ID">
        <Text code>{transaction.merchant_id}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="MCC">
        <Tag>{transaction.mcc}</Tag>
      </Descriptions.Item>
    </Descriptions>
  );
};
