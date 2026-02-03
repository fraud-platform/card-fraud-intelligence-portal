import { type JSX } from "react";
import { Spin } from "antd";

/**
 * Loading fallback for lazy-loaded routes
 */
export function RouteLoadingFallback(): JSX.Element {
  return (
    <div className="route-loading-container">
      <Spin size="large" />
    </div>
  );
}

/**
 * Default route component - placeholder that redirects
 */
export function DefaultRoute(): JSX.Element {
  return (
    <div className="default-route-container">
      <Spin size="large" tip="Redirecting..." />
    </div>
  );
}
