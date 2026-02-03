/**
 * Loading Component
 *
 * Centralized loading indicator used throughout the application.
 */

import type { FC } from "react";
import { Spin, SpinProps } from "antd";
import "./Loading.css";

export interface LoadingProps extends SpinProps {
  /** Loading message */
  message?: string;
  /** Whether to center in viewport */
  fullPage?: boolean;
}

/**
 * Loading component with optional message
 */
export const Loading: FC<LoadingProps> = ({
  message,
  fullPage = false,
  size = "large",
  ...spinProps
}) => {
  const content = (
    <div className="app-loading-container">
      <Spin size={size} {...spinProps} />
      {message != null && message !== "" && <div className="app-loading-message">{message}</div>}
    </div>
  );

  if (fullPage) {
    return <div className="app-loading-fullpage">{content}</div>;
  }

  return content;
};

export default Loading;
