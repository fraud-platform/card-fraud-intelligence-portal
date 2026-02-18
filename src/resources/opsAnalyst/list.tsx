import { useState, type FC } from "react";
import { List, Select, Space, Statistic, Tag, Typography } from "antd";
import { useOpsAnalystRecommendations } from "../../hooks/useOpsAnalystRecommendations";
import { RecommendationCard } from "./components/RecommendationCard";

const { Title } = Typography;

export const OpsAnalystRecommendationList: FC = () => {
  const [severity, setSeverity] = useState<string | undefined>();
  const { recommendations, total, loading, error, acknowledge } = useOpsAnalystRecommendations({
    severity,
  });

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Space align="baseline">
        <Title level={4} style={{ margin: 0 }}>
          AI Recommendations
        </Title>
        <Statistic value={total} suffix="open" style={{ marginLeft: 16 }} />
        <Select
          allowClear
          placeholder="Filter by severity"
          style={{ width: 160 }}
          onChange={setSeverity}
          options={["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => ({ label: s, value: s }))}
        />
      </Space>

      {error != null && error !== "" && <Tag color="red">{error}</Tag>}

      <List
        loading={loading}
        dataSource={recommendations}
        renderItem={(rec) => (
          <List.Item key={rec.recommendation_id}>
            <RecommendationCard recommendation={rec} onAcknowledge={acknowledge} />
          </List.Item>
        )}
      />
    </Space>
  );
};

export default OpsAnalystRecommendationList;
