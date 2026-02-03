/**
 * Case Create Page
 *
 * Create a new investigation case.
 */

import type { JSX } from "react";
import { Card, Form, Input, Select, Button, Space, Typography, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useGo } from "@refinedev/core";
import { CASE_TYPE_CONFIG, type CaseCreateRequest } from "../../types/case";
import { RISK_LEVEL_CONFIG } from "../../types/worklist";
import { useCreateCase } from "../../hooks";
import "./list.css";

const { Title } = Typography;

/**
 * Case Create Page
 */
export default function CaseCreate(): JSX.Element {
  const go = useGo();

  const [form] = Form.useForm<CaseCreateRequest>();
  const { createCase, isCreating } = useCreateCase();

  const handleSubmit = (values: CaseCreateRequest): void => {
    createCase(values)
      .then((newCase) => {
        void message.success("Case created successfully");
        go({ to: `/cases/show/${newCase.id}` });
      })
      .catch(() => {
        void message.error("Failed to create case");
      });
  };

  return (
    <Space direction="vertical" size="middle" className="cases-container">
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => go({ to: "/cases" })}>
          Back to Cases
        </Button>
      </Space>

      <Card
        title={
          <Title level={4} className="cases-title">
            Create New Case
          </Title>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            case_type: "INVESTIGATION",
            risk_level: "MEDIUM",
          }}
          className="form-max-width"
        >
          <Form.Item
            name="case_type"
            label="Case Type"
            rules={[{ required: true, message: "Please select a case type" }]}
          >
            <Select>
              {Object.entries(CASE_TYPE_CONFIG).map(([value, config]) => (
                <Select.Option key={value} value={value}>
                  {config.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter a title" },
              { min: 5, message: "Title must be at least 5 characters" },
            ]}
          >
            <Input placeholder="Brief description of the investigation" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Detailed description of the case..." />
          </Form.Item>

          <Form.Item name="risk_level" label="Risk Level">
            <Select>
              {Object.entries(RISK_LEVEL_CONFIG).map(([value, config]) => (
                <Select.Option key={value} value={value}>
                  {config.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isCreating}>
                Create Case
              </Button>
              <Button onClick={() => go({ to: "/cases" })}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
}
