/**
 * Audit Log Show
 *
 * Displays audit log entry details including old and new values.
 * Read-only view for tracking changes and actions in the system.
 */

import { useState, useEffect, type FC } from "react";
import { Show } from "@refinedev/antd";
import { useNotification } from "@refinedev/core";
import { Card, Tag, Typography } from "antd";
import { Descriptions } from "../../shared/compat/antdCompat";
import { useParams } from "react-router";
import type { AuditLog } from "../../types/domain";
import { get } from "../../api/httpClient";
import { AUDIT_LOGS } from "../../api/endpoints";
import { JsonViewer } from "../../shared/components/JsonViewer";
import { AuditAction } from "../../types/enums";
import "./audit-logs.css";

export const AuditLogShow: FC = () => {
  const params = useParams();
  const auditId = params.id;
  const { open } = useNotification();

  const [loading, setLoading] = useState(true);
  const [auditLog, setAuditLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      if (auditId == null || auditId === "") return;

      try {
        const response = await get<AuditLog>(AUDIT_LOGS.GET(auditId));
        if (cancelled) return;

        setAuditLog(response);
      } catch (error) {
        if (cancelled) return;
        open?.({
          type: "error",
          message: "Failed to load audit log",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [auditId, open]);

  if (loading) {
    return <Show isLoading contentProps={{ variant: "outlined", size: "small" }} />;
  }

  if (auditLog == null) {
    return (
      <Show title="Audit Log not found" contentProps={{ variant: "outlined", size: "small" }} />
    );
  }

  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case AuditAction.CREATE:
        return "green";
      case AuditAction.UPDATE:
        return "blue";
      case AuditAction.DELETE:
        return "red";
      case AuditAction.APPROVE:
        return "cyan";
      case AuditAction.REJECT:
        return "orange";
      case AuditAction.SUBMIT:
        return "purple";
      case AuditAction.COMPILE:
        return "geekblue";
      default:
        return "default";
    }
  };

  return (
    <Show
      title={`Audit Log: ${auditLog.audit_id}`}
      contentProps={{ variant: "outlined", size: "small" }}
    >
      <Card title="Details" size="small" variant="outlined">
        <Descriptions column={2} size="small" variant="outlined">
          <Descriptions.Item label="Audit ID" span={2}>
            {auditLog.audit_id}
          </Descriptions.Item>
          <Descriptions.Item label="Entity Type">
            <Tag color="blue">{auditLog.entity_type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Entity ID">{auditLog.entity_id}</Descriptions.Item>
          <Descriptions.Item label="Action">
            <Tag color={getActionColor(auditLog.action)}>{auditLog.action}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Performed By">{auditLog.performed_by}</Descriptions.Item>
          <Descriptions.Item label="Timestamp" span={2}>
            {auditLog.performed_at}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {auditLog.old_value != null && (
        <Card title="Old Value" size="small" className="audit-card-spaced" variant="outlined">
          <JsonViewer data={auditLog.old_value} copyable maxHeight={400} />
        </Card>
      )}

      {auditLog.new_value != null && (
        <Card title="New Value" size="small" className="audit-card-spaced" variant="outlined">
          <JsonViewer data={auditLog.new_value} copyable maxHeight={400} />
        </Card>
      )}

      {auditLog.old_value == null && auditLog.new_value == null && (
        <Card title="No Change Data" size="small" className="audit-card-spaced" variant="outlined">
          <Typography.Text type="secondary">
            This audit log entry does not contain change data.
          </Typography.Text>
        </Card>
      )}
    </Show>
  );
};

export default AuditLogShow;
