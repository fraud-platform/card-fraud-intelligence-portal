/**
 * Theme Toggle Component
 *
 * Provides controls for:
 * - Toggling between compact and comfortable density
 * - Toggling between light and dark mode
 * - Displaying keyboard shortcut hints
 */

import type { JSX } from "react";
import { Button, Space, Tooltip, Dropdown } from "antd";
import {
  CompressOutlined,
  ExpandOutlined,
  MoonOutlined,
  SunOutlined,
  LaptopOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTheme, type ThemeMode } from "../../theme";
import "./ThemeToggle.css";

/**
 * Theme Toggle Component
 */
export function ThemeToggle(): JSX.Element {
  const { density, toggleDensity, themeMode, setThemeMode, isDark, openCommandPalette } =
    useTheme();

  const isCompact = density === "compact";

  const themeItems = [
    {
      key: "light",
      icon: <SunOutlined />,
      label: "Light",
      onClick: () => setThemeMode("light" as ThemeMode),
    },
    {
      key: "dark",
      icon: <MoonOutlined />,
      label: "Dark",
      onClick: () => setThemeMode("dark" as ThemeMode),
    },
    {
      key: "system",
      icon: <LaptopOutlined />,
      label: "System",
      onClick: () => setThemeMode("system" as ThemeMode),
    },
  ];

  return (
    <Space size="small">
      {/* Command Palette Shortcut */}
      <Tooltip title="Command Palette (Ctrl+K)">
        <Button type="text" icon={<SearchOutlined />} onClick={openCommandPalette} size="small">
          <kbd className="shortcut-kbd">⌘K</kbd>
        </Button>
      </Tooltip>

      {/* Density Toggle */}
      <Tooltip title={isCompact ? "Switch to Comfortable" : "Switch to Compact"}>
        <Button
          type="text"
          icon={isCompact ? <CompressOutlined /> : <ExpandOutlined />}
          onClick={toggleDensity}
          size="small"
        />
      </Tooltip>

      {/* Theme Mode Toggle */}
      <Dropdown
        menu={{
          items: themeItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: item.onClick,
          })),
          selectedKeys: [themeMode],
        }}
        placement="bottomRight"
      >
        <Button type="text" icon={isDark ? <MoonOutlined /> : <SunOutlined />} size="small" />
      </Dropdown>
    </Space>
  );
}

export default ThemeToggle;
