/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays a fallback UI
 * instead of crashing the entire application.
 *
 * Based on React official documentation:
 * https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Alert, Button, Card, Space, Typography } from "antd";
import { captureError } from "../utils/sentry";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Optional custom fallback UI
   */
  fallback?: (error: Error, errorInfo: ErrorInfo | null, reset: () => void) => ReactNode;

  /**
   * Optional error callback
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={(error, errorInfo, reset) => (
 *   <CustomErrorUI error={error} onReset={reset} />
 * )}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Send error to Sentry (handles dev/prod check internally)
    captureError(error, {
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError != null) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error != null) {
      // Use custom fallback if provided
      if (fallback != null) {
        return fallback(error, errorInfo, this.handleReset);
      }

      // Default fallback UI
      return (
        <Card className="error-card" variant="outlined">
          <Space direction="vertical" className="error-space">
            <Alert
              message="Something went wrong"
              description="An unexpected error occurred. Please try again or contact support if the problem persists."
              type="error"
              showIcon
            />

            {import.meta.env.DEV && error != null ? (
              <Card
                type="inner"
                title="Error Details (Development Only)"
                size="small"
                variant="outlined"
              >
                <Space direction="vertical" className="error-space">
                  <Typography.Text strong>Error:</Typography.Text>
                  <Typography.Text code className="error-code">
                    {error.toString()}
                  </Typography.Text>

                  {errorInfo?.componentStack != null ? (
                    <>
                      <Typography.Text strong>Component Stack:</Typography.Text>
                      <Typography.Text code className="error-stack">
                        {errorInfo.componentStack}
                      </Typography.Text>
                    </>
                  ) : null}
                </Space>
              </Card>
            ) : null}

            <Button type="primary" onClick={this.handleReset}>
              Try Again
            </Button>
          </Space>
        </Card>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
