/**
 * Command Palette Component
 *
 * Global command palette for quick navigation using cmd+k (or ctrl+k).
 * Provides fuzzy search across all routes and common actions.
 */

import { useState, useEffect, useCallback, useMemo, type JSX, type ReactNode } from "react";
import { Command } from "cmdk";
import { Modal, Tag, Divider } from "antd";
import {
  SearchOutlined,
  HomeOutlined,
  FileTextOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  UnorderedListOutlined,
  DollarOutlined,
  ContainerOutlined,
  BarChartOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useTheme } from "../../theme";
import { getCommandPaletteRoutes } from "../../routes/config";
import "./CommandPalette.css";

/**
 * Command palette item type
 */
interface CommandItem {
  id: string;
  title: string;
  path: string;
  icon?: ReactNode;
  keywords: string[];
  shortcut?: string;
}

/**
 * Get icon for route based on title
 */
function getIconForRoute(title: string): ReactNode {
  const iconMap: Record<string, ReactNode> = {
    "Rule Fields": <DatabaseOutlined />,
    Rules: <FileTextOutlined />,
    "Rule Sets": <FolderOutlined />,
    Approvals: <CheckCircleOutlined />,
    "Audit Logs": <AuditOutlined />,
    Worklist: <UnorderedListOutlined />,
    Transactions: <DollarOutlined />,
    Cases: <ContainerOutlined />,
    Metrics: <BarChartOutlined />,
    Home: <HomeOutlined />,
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (title.includes(key)) return icon;
  }

  return <SearchOutlined />;
}

/**
 * Command Palette Component
 */
export function CommandPalette(): JSX.Element {
  const { isCommandPaletteOpen, closeCommandPalette, openCommandPalette, isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Get all available routes
  const commands = useMemo<CommandItem[]>(() => {
    const routes = getCommandPaletteRoutes();
    return routes.map((route) => ({
      id: route.path,
      title: route.title,
      path: route.path,
      icon: getIconForRoute(route.title),
      keywords: route.keywords ?? [],
    }));
  }, []);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (search.trim() === "") return commands;

    const searchLower = search.toLowerCase();
    return commands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(searchLower);
      const keywordMatch = cmd.keywords.some((k) => k.includes(searchLower));
      return titleMatch || keywordMatch;
    });
  }, [commands, search]);

  // Handle command selection
  const handleSelect = useCallback(
    (value: string) => {
      const command = commands.find((cmd) => cmd.id === value);
      if (command !== undefined) {
        void navigate(command.path);
        closeCommandPalette();
        setSearch("");
      }
    },
    [commands, navigate, closeCommandPalette]
  );

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isCommandPaletteOpen) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
      }

      // Escape to close
      if (e.key === "Escape" && isCommandPaletteOpen) {
        closeCommandPalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, closeCommandPalette, openCommandPalette]);

  return (
    <Modal
      open={isCommandPaletteOpen}
      onCancel={closeCommandPalette}
      footer={null}
      width={640}
      centered
      className={`command-palette-modal ${isDark ? "dark" : "light"}`}
    >
      <Command label="Command Palette" className="command-palette" loop shouldFilter={false}>
        <div className="command-palette-search">
          <SearchOutlined className="search-icon" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search routes and commands..."
            className="command-input"
            autoFocus
          />
          <kbd className="shortcut-hint">ESC</kbd>
        </div>

        <Divider className="command-divider" />

        <Command.List className="command-list">
          <Command.Empty className="command-empty">
            No results found for &quot;{search}&quot;
          </Command.Empty>

          {filteredCommands.length > 0 && (
            <Command.Group heading="Navigation">
              {filteredCommands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.id}
                  onSelect={handleSelect}
                  className="command-item"
                >
                  <div className="command-item-content">
                    <span className="command-icon">{command.icon}</span>
                    <span className="command-title">{command.title}</span>
                  </div>
                  <Tag className="command-tag">{command.path}</Tag>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="command-footer">
          <div className="command-footer-item">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="command-footer-item">
            <kbd>↵</kbd>
            <span>to select</span>
          </div>
          <div className="command-footer-item">
            <kbd>esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </Command>
    </Modal>
  );
}

export default CommandPalette;
