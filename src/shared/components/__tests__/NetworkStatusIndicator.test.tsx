/**
 * Tests for NetworkStatusIndicator component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { NetworkStatusIndicator } from "../NetworkStatusIndicator";

vi.mock("../../../hooks/useNetworkStatus", () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true, wasOffline: false })),
}));

import { useNetworkStatus } from "../../../hooks/useNetworkStatus";

const mockedUseNetworkStatus = vi.mocked(useNetworkStatus);

describe("NetworkStatusIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders success badge when online", () => {
    mockedUseNetworkStatus.mockReturnValue({ isOnline: true, wasOffline: false });

    render(<NetworkStatusIndicator />);

    expect(document.querySelector(".ant-badge-status-success")).toBeInTheDocument();
  });

  it("renders offline indicator when offline", () => {
    mockedUseNetworkStatus.mockReturnValue({ isOnline: false, wasOffline: true });

    render(<NetworkStatusIndicator showLabel />);

    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("renders offline icon when offline without label", () => {
    mockedUseNetworkStatus.mockReturnValue({ isOnline: false, wasOffline: true });

    render(<NetworkStatusIndicator showLabel={false} />);

    expect(screen.queryByText("Offline")).not.toBeInTheDocument();
    expect(document.querySelector(".network-status-offline")).toBeInTheDocument();
  });

  it("renders with label when showLabel is true and online", () => {
    mockedUseNetworkStatus.mockReturnValue({ isOnline: true, wasOffline: false });

    render(<NetworkStatusIndicator showLabel />);

    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("shows reconnection indicator when wasOffline and online", () => {
    mockedUseNetworkStatus.mockReturnValue({ isOnline: true, wasOffline: true });

    render(<NetworkStatusIndicator />);

    const badge = document.querySelector(".network-status-badge");
    expect(badge).toBeInTheDocument();
  });
});
