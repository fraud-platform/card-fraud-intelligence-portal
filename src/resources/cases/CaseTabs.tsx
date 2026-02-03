import { Card, Tabs, Table, Spin, Empty, Timeline, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactElement } from "react";
import type { CaseActivity } from "../../types/case";
import type { CaseTransaction } from "./types";
import { formatDateTime } from "./utils";

const { Text } = Typography;

export default function CaseTabs({
  transactions,
  txnLoading,
  activities,
  activityLoading,
  transactionColumns,
}: Readonly<{
  transactions: CaseTransaction[];
  txnLoading: boolean;
  activities: CaseActivity[];
  activityLoading: boolean;
  transactionColumns: ColumnsType<CaseTransaction>;
}>): ReactElement {
  const renderActivityList = (acts: CaseActivity[], loading: boolean): ReactElement => (
    <Spin spinning={loading}>
      {acts.length === 0 ? (
        <Empty description="No activity recorded" />
      ) : (
        <Timeline
          items={acts.map((activity) => ({
            children: (
              <div>
                <Text strong>{activity.activity_description}</Text>
                <br />
                <Text type="secondary" className="activity-meta">
                  {activity.performed_by_name ?? activity.performed_by} •{" "}
                  {formatDateTime(activity.created_at)}
                </Text>
              </div>
            ),
          }))}
        />
      )}
    </Spin>
  );

  const tabItems = [
    {
      key: "transactions",
      label: `Transactions (${transactions.length})`,
      children: (
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          rowKey="transaction_id"
          loading={txnLoading}
          size="small"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: "activity",
      label: "Activity Log",
      children: renderActivityList(activities, activityLoading),
    },
  ];

  return (
    <Card size="small">
      <Tabs items={tabItems} />
    </Card>
  );
}
