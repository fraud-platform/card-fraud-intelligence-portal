import { useState, type FC } from "react";
import { Button, Card, Modal, Space, Tag, Typography, Input } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { RecommendationDetail, AcknowledgeRequest } from "../../../types/opsAnalyst";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const TYPE_LABELS: Record<string, string> = {
  review_priority: "Review Priority",
  case_action: "Case Action",
  rule_candidate: "Rule Candidate",
};

interface Props {
  recommendation: RecommendationDetail;
  onAcknowledge: (id: string, req: AcknowledgeRequest) => Promise<void>;
}

export const RecommendationCard: FC<Props> = ({ recommendation, onAcknowledge }) => {
  const [loading, setLoading] = useState(false);
  const [commentModal, setCommentModal] = useState<"ACKNOWLEDGED" | "REJECTED" | null>(null);
  const [comment, setComment] = useState("");

  const isOpen = recommendation.status === "OPEN";
  const payload = recommendation.payload as { title?: string; impact?: string };

  const handleAction = async (action: "ACKNOWLEDGED" | "REJECTED"): Promise<void> => {
    setLoading(true);
    try {
      const normalizedComment = comment.trim();
      await onAcknowledge(recommendation.recommendation_id, {
        action,
        comment: normalizedComment === "" ? undefined : normalizedComment,
      });
      setCommentModal(null);
      setComment("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        size="small"
        style={{ width: "100%" }}
        title={
          <Space>
            <Tag>{TYPE_LABELS[recommendation.type] ?? recommendation.type}</Tag>
            <Tag color={recommendation.status === "OPEN" ? "blue" : "default"}>
              {recommendation.status}
            </Tag>
          </Space>
        }
        extra={
          isOpen ? (
            <Space>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                loading={loading}
                onClick={() => setCommentModal("ACKNOWLEDGED")}
              >
                Acknowledge
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                loading={loading}
                onClick={() => setCommentModal("REJECTED")}
              >
                Reject
              </Button>
            </Space>
          ) : (
            <Text type="secondary">
              {recommendation.acknowledged_at !== null &&
              recommendation.acknowledged_at !== undefined
                ? new Date(recommendation.acknowledged_at).toLocaleString()
                : recommendation.status}
            </Text>
          )
        }
      >
        {payload.title != null && payload.title !== "" && (
          <Paragraph strong style={{ marginBottom: 4 }}>
            {payload.title}
          </Paragraph>
        )}
        {payload.impact != null && payload.impact !== "" && (
          <Paragraph type="secondary">{payload.impact}</Paragraph>
        )}
      </Card>

      <Modal
        open={commentModal !== null}
        title={
          commentModal === "ACKNOWLEDGED" ? "Acknowledge Recommendation" : "Reject Recommendation"
        }
        onOk={() => {
          if (commentModal !== null) {
            handleAction(commentModal).catch(console.error);
          }
        }}
        onCancel={() => {
          setCommentModal(null);
          setComment("");
        }}
        confirmLoading={loading}
        okText={commentModal === "ACKNOWLEDGED" ? "Acknowledge" : "Reject"}
        okButtonProps={{ danger: commentModal === "REJECTED" }}
      >
        <TextArea
          rows={3}
          placeholder="Optional comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </>
  );
};
