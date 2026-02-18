import { type JSX } from "react";
import { Skeleton, Space, Spin } from "antd";

/**
 * Loading fallback for lazy-loaded routes.
 * Uses skeleton UI for better perceived performance.
 */
export function RouteLoadingFallback(): JSX.Element {
  return (
    <div className="route-loading-container">
      <Space direction="vertical" className="route-loading-skeleton" size="middle">
        <Skeleton.Input active style={{ width: 200 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </Space>
    </div>
  );
}

/**
 * Default route component - placeholder that redirects.
 * Uses skeleton UI while redirect decision is being made.
 */
export function DefaultRoute(): JSX.Element {
  return (
    <div className="default-route-container">
      <Space direction="vertical" className="route-loading-skeleton" size="middle">
        <Spin size="small" />
        <Skeleton.Input active size="small" style={{ width: 150 }} />
      </Space>
    </div>
  );
}
