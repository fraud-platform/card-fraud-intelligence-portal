import { type FC, useEffect } from "react";
import { Button, Card, Form, Input, Checkbox, Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useLogin } from "@refinedev/core";
import { ROLE_DISPLAY_LABELS, type SystemRole } from "../types/domain";
import { isAuth0Enabled } from "../app/auth0Client";
import "./Login.css";

type LoginParams =
  | {
      // Dev/localStorage login
      username: string;
      roles: SystemRole[];
      returnTo?: string;
    }
  | {
      // Auth0 redirect login
      returnTo: string;
    };

export const LoginPage: FC = () => {
  const { mutate: login, isPending } = useLogin<LoginParams>();

  useEffect(() => {
    console.warn("[Login] ====== LOGIN PAGE RENDERED ======");
    console.warn("[Login] Current URL:", globalThis.location.href);
    console.warn("[Login] Auth0 enabled:", isAuth0Enabled());
  }, []);

  const onFinish = (values: Extract<LoginParams, { username: string }>): void => {
    login(values);
  };

  const handleGoogleLogin = (): void => {
    console.warn("[Login] Google login button clicked");
    login({ returnTo: "/" });
  };

  return (
    <div className="login-root">
      <div className="login-container">
        <div className="login-branding">
          <div className="login-logo">
            <div className="login-logo-icon">🛡️</div>
          </div>
          <Typography.Title level={1} className="login-main-title">
            Card Fraud Intelligence Portal
          </Typography.Title>
          <Typography.Paragraph className="login-subtitle">
            Enterprise Fraud Detection & Rule Management Platform
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" className="login-description">
            Advanced rule authoring, real-time transaction monitoring, and comprehensive fraud
            investigation tools for financial institutions. Built for security teams who demand
            precision and compliance.
          </Typography.Paragraph>
          <div className="login-features">
            <Typography.Text className="login-feature">✓ Visual Rule Builder</Typography.Text>
            <Typography.Text className="login-feature">✓ Maker-Checker Workflows</Typography.Text>
            <Typography.Text className="login-feature">✓ Real-time Analytics</Typography.Text>
          </div>
        </div>
        <Card className="login-card" variant="outlined">
          <Typography.Title level={3} className="login-title">
            Development Environment
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="login-dev-description">
            Select your testing persona and roles below. This login mode is only available in
            development environments for testing purposes.
          </Typography.Paragraph>

          {isAuth0Enabled() ? (
            <div className="login-auth-section">
              <Typography.Paragraph type="secondary" className="login-auth-description">
                Sign in with your organization&apos;s Google Workspace account. Access is managed by
                your IT administrator.
              </Typography.Paragraph>
              <Button
                type="primary"
                block
                size="large"
                loading={isPending}
                onClick={handleGoogleLogin}
                icon={<GoogleOutlined />}
                className="login-google-button"
              >
                Continue with Google Workspace
              </Button>
              <Typography.Paragraph type="secondary" className="login-auth-help">
                Don&apos;t have access? Contact your system administrator to request account
                provisioning.
              </Typography.Paragraph>
            </div>
          ) : (
            <Form<Extract<LoginParams, { username: string }>>
              layout="vertical"
              initialValues={{ roles: ["RULE_MAKER"], username: "maker" }}
              onFinish={onFinish}
            >
              <Form.Item
                name="roles"
                label="Roles"
                rules={[{ required: true, message: "At least one role is required" }]}
              >
                <Checkbox.Group>
                  {Object.entries(ROLE_DISPLAY_LABELS).map(([role, label]) => (
                    <Checkbox key={role} value={role}>
                      {label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Username is required" }]}
              >
                <Input autoComplete="username" placeholder="e.g., alice" />
              </Form.Item>

              <Form.Item className="login-form-item-no-margin">
                <Button type="primary" htmlType="submit" block loading={isPending}>
                  Sign in
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
