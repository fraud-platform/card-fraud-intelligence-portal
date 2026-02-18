/**
 * Network Status Indicator Component
 *
 * Displays a visual indicator when the browser is offline.
 * Shows in the header area for visibility without blocking workflow.
 */

import { type FC, type ReactElement } from "react";
import { Badge, Tooltip, Typography } from "antd";
import { WifiOutlined, DisconnectOutlined } from "@ant-design/icons";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

const { Text } = Typography;

interface NetworkStatusIndicatorProps {
  showLabel?: boolean;
}

/**
 * Compact network status indicator for the header.
 * Shows green dot when online, red when offline.
 */
export const NetworkStatusIndicator: FC<NetworkStatusIndicatorProps> = ({
  showLabel = false,
}): ReactElement => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const showReconnected = wasOffline && isOnline;

  if (isOnline && !showLabel) {
    return (
      <Tooltip title={showReconnected ? "Connection restored" : "Online"}>
        <Badge status="success" className="network-status-badge" />
      </Tooltip>
    );
  }

  if (!isOnline) {
    return (
      <Tooltip title="You are offline. Some features may be unavailable.">
        <span className="network-status-offline">
          <DisconnectOutlined style={{ color: "#ff4d4f" }} />
          {showLabel && <Text type="danger">Offline</Text>}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={showReconnected ? "Connection restored" : "Online"}>
      <span className="network-status-online">
        <WifiOutlined style={{ color: "#52c41a" }} />
        {showLabel && <Text type="success">Online</Text>}
      </span>
    </Tooltip>
  );
};

export default NetworkStatusIndicator;
