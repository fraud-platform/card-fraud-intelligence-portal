/**
 * Enterprise Layout Component
 *
 * Density-first layout for rule authoring and analyst review.
 * - Compact sidebar with all resource menus grouped
 * - Minimal header with user info
 * - Maximum content area for data
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
  type ReactElement,
} from "react";
import { Layout, Menu, Typography, Avatar, Dropdown, Button, Space, type MenuProps } from "antd";
import {
  DatabaseOutlined,
  FileTextOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  UnorderedListOutlined,
  DollarOutlined,
  ContainerOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { usePermissions } from "../../../hooks/usePermissions";
import { getActiveUserRole, setActiveUserRole } from "../../../app/authProvider";
import type { SystemRole } from "../../../types/domain";
import "./Layout.css";

const { Sider, Header, Content } = Layout;

interface UserIdentity {
  user_id?: string;
  username?: string;
  display_name?: string;
  email?: string;
  roles?: string[];
}

interface EnterpriseLayoutProps {
  children: ReactNode;
}

type MenuItem = Required<MenuProps>["items"][number];

function getMenuItem(key: string, icon: ReactNode, label: string): MenuItem {
  return {
    key,
    icon,
    label,
  } as MenuItem;
}

function getMenuGroup(label: string, children: MenuItem[]): MenuItem {
  return {
    type: "group",
    label,
    children,
  } as MenuItem;
}

const RULE_MANAGEMENT_MENU = getMenuGroup("Rule Management", [
  getMenuItem("/rule-fields", <DatabaseOutlined />, "Rule Fields"),
  getMenuItem("/rules", <FileTextOutlined />, "Rules"),
  getMenuItem("/rulesets", <FolderOutlined />, "Rule Sets"),
  getMenuItem("/approvals", <CheckCircleOutlined />, "Approvals"),
  getMenuItem("/audit-logs", <AuditOutlined />, "Audit Logs"),
]);

const ROLE_DISPLAY_LABELS: Record<string, string> = {
  RULE_MAKER: "Rule Maker",
  RULE_CHECKER: "Rule Checker",
  RULE_VIEWER: "Rule Viewer",
  FRAUD_ANALYST: "Fraud Analyst",
  FRAUD_SUPERVISOR: "Fraud Supervisor",
  PLATFORM_ADMIN: "Platform Admin",
};

const FRAUD_OPERATIONS_MENU = getMenuGroup("Fraud Operations", [
  getMenuItem("/worklist", <UnorderedListOutlined />, "Worklist"),
  getMenuItem("/transactions", <DollarOutlined />, "All Transactions"),
  getMenuItem("/cases", <ContainerOutlined />, "Cases"),
  getMenuItem("/transaction-metrics", <BarChartOutlined />, "Metrics"),
]);

const MENU_ITEMS: MenuItem[] = [RULE_MANAGEMENT_MENU, FRAUD_OPERATIONS_MENU];

function SidebarMenu({
  collapsed,
  onCollapse,
  getSelectedKey,
  onMenuClick,
  items,
}: Readonly<{
  collapsed: boolean;
  onCollapse: (c: boolean) => void;
  getSelectedKey: () => string;
  onMenuClick: MenuProps["onClick"];
  items: MenuItem[];
}>): ReactElement {
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={200}
      collapsedWidth={56}
      className="app-sider"
    >
      <div className={`sider-header ${collapsed ? "collapsed" : ""}`}>
        <span className="brand-badge">FI</span>
        {!collapsed && (
          <Typography.Text strong className="brand-text">
            Fraud Intelligence
          </Typography.Text>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        onClick={onMenuClick}
        items={items}
        className="sider-menu"
      />
    </Sider>
  );
}

function HeaderBar({
  collapsed,
  onToggle,
  user,
  isLoggingOut,
  userMenuItems,
  activeRole,
}: Readonly<{
  collapsed: boolean;
  onToggle: () => void;
  user?: UserIdentity;
  isLoggingOut: boolean;
  userMenuItems: MenuProps["items"];
  activeRole: string | null;
}>): ReactElement {
  const displayRole = activeRole ?? (user?.roles ?? [])[0] ?? "user";
  const displayLabel = ROLE_DISPLAY_LABELS[displayRole] ?? displayRole;

  return (
    <Header className="app-header">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        className="header-toggle"
      />

      <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
        <Button type="text" loading={isLoggingOut} className="user-button">
          <Space size={8}>
            <Avatar size={24} icon={<UserOutlined />} className="header-avatar avatar-primary" />
            <span className="user-name">{user?.display_name ?? user?.username ?? "User"}</span>
            <span
              className={`role-label ${displayRole === "RULE_CHECKER" ? "role-label-checker" : "role-label-user"}`}
            >
              {displayLabel}
            </span>
            <DownOutlined className="chevron-icon" />
          </Space>
        </Button>
      </Dropdown>
    </Header>
  );
}

export const EnterpriseLayout: FC<EnterpriseLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useGetIdentity<UserIdentity>();
  const { capabilities, isLoading: permissionsLoading } = usePermissions();
  const { mutate: logout } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(() => getActiveUserRole());

  useEffect(() => {
    const onRoleChanged = (): void => setActiveRole(getActiveUserRole());
    window.addEventListener("active-role-changed", onRoleChanged);
    return () => window.removeEventListener("active-role-changed", onRoleChanged);
  }, []);

  const handleRoleSwitch = useCallback((role: string) => {
    setActiveUserRole(role as SystemRole);
    setActiveRole(role);
  }, []);

  const menuItems = useMemo(() => {
    if (permissionsLoading) {
      return MENU_ITEMS;
    }

    const items: MenuItem[] = [];
    const canAccessRules =
      capabilities.canReadRules ||
      capabilities.canCreateRules ||
      capabilities.canApproveRules ||
      capabilities.isAdmin;
    const canAccessOps =
      capabilities.canViewTransactions ||
      capabilities.canReviewTransactions ||
      capabilities.canCreateCases ||
      capabilities.isAdmin;

    if (canAccessRules) {
      items.push(RULE_MANAGEMENT_MENU);
    }
    if (canAccessOps) {
      items.push(FRAUD_OPERATIONS_MENU);
    }

    return items.length > 0 ? items : MENU_ITEMS;
  }, [capabilities, permissionsLoading]);

  const handleLogout = useCallback((): void => {
    setIsLoggingOut(true);
    logout();
  }, [logout]);

  /* eslint-disable-next-line complexity */
  const getSelectedKey = (): string => {
    const path = location.pathname;
    for (const group of menuItems) {
      if (group == null || typeof group !== "object" || !("children" in group)) continue;
      const children = group.children;
      if (!Array.isArray(children)) continue;
      // Narrow children to MenuItem[] and perform explicit checks on `key`
      const childrenItems = children as MenuItem[];
      const match = childrenItems.find((mi) => {
        if (mi == null || typeof mi !== "object") return false;
        const key = mi.key as unknown;
        if (key == null) return false;
        if (typeof key !== "string") return false;
        return path.startsWith(key);
      });
      if (match != null) {
        const key = match.key;
        if (key != null && typeof key === "string") return key;
      }
    }
    const firstGroup = menuItems[0];
    if (firstGroup != null && typeof firstGroup === "object" && "children" in firstGroup) {
      const children = firstGroup.children;
      if (Array.isArray(children) && children.length > 0) {
        const firstItem = children[0] as MenuItem | undefined;
        if (firstItem != null && typeof firstItem === "object") {
          const key = firstItem.key as unknown;
          if (typeof key === "string") return key;
        }
      }
    }
    return "/worklist";
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    void navigate(key);
  };

  const rolesList = useMemo(() => (Array.isArray(user?.roles) ? user.roles : []), [user]);

  const userMenuItems: MenuProps["items"] = useMemo(() => {
    const items: NonNullable<MenuProps["items"]> = [
      {
        key: "user-info",
        label: (
          <div className="user-info-block">
            <Typography.Text strong className="user-info-name">
              {user?.display_name ?? user?.username ?? "User"}
            </Typography.Text>
            <Typography.Text type="secondary" className="user-info-email">
              {user?.email ?? ""}
            </Typography.Text>
          </div>
        ),
        disabled: true,
      },
    ];

    if (rolesList.length > 1) {
      items.push({ type: "divider" });
      for (const r of rolesList) {
        items.push({
          key: `role-${r}`,
          label: (
            <Space>
              {activeRole === r ? (
                <CheckOutlined />
              ) : (
                <span style={{ width: 14, display: "inline-block" }} />
              )}
              <Typography.Text>{ROLE_DISPLAY_LABELS[r] ?? r}</Typography.Text>
            </Space>
          ),
          onClick: () => handleRoleSwitch(r),
        });
      }
    }

    items.push({ type: "divider" });
    items.push({
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign out",
      danger: true,
      onClick: () => handleLogout(),
    });

    return items;
  }, [user, rolesList, activeRole, handleLogout, handleRoleSwitch]);

  return (
    <Layout className="app-root">
      <SidebarMenu
        collapsed={collapsed}
        onCollapse={setCollapsed}
        getSelectedKey={getSelectedKey}
        onMenuClick={handleMenuClick}
        items={menuItems}
      />

      <Layout>
        <HeaderBar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          user={user}
          isLoggingOut={isLoggingOut}
          userMenuItems={userMenuItems}
          activeRole={activeRole}
        />

        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default EnterpriseLayout;
