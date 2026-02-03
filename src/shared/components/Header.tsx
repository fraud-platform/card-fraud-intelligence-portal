/**
 * Custom Header Component
 *
 * Displays user info and logout button in the top right.
 * Used with ThemedLayoutV2 for proper enterprise layout.
 */

import { type FC, useState, useEffect, useCallback, useMemo } from "react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { Avatar, Button, Dropdown, Space, Typography, theme, type MenuProps } from "antd";
import { LogoutOutlined, UserOutlined, DownOutlined, CheckOutlined } from "@ant-design/icons";
import { usePermissions } from "../../hooks/usePermissions";
import { useRolesWithHelpers } from "../../hooks/useRoles";
import { getActiveUserRole, setActiveUserRole } from "@/app/authProvider";
import { ROLE_DISPLAY_LABELS, type SystemRole } from "@/types/domain";

interface UserIdentity {
  user_id?: string;
  username?: string;
  display_name?: string;
  email?: string;
  roles?: string[];
}

export const Header: FC = () => {
  const { token: _token } = theme.useToken();
  const { data: user } = useGetIdentity<UserIdentity>();
  const { mutate: logout } = useLogout();
  const { capabilities } = usePermissions();
  const { roles: assignedRoles, isPlatformAdmin } = useRolesWithHelpers();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(() => getActiveUserRole());

  const handleLogout = useCallback((): void => {
    setIsLoggingOut(true);
    logout();
  }, [logout]);

  const rolesList = useMemo(() => (Array.isArray(user?.roles) ? user.roles : []), [user]);

  useEffect(() => {
    const onActiveRoleChanged = (): void => setActiveRole(getActiveUserRole());
    window.addEventListener("active-role-changed", onActiveRoleChanged);
    return () => window.removeEventListener("active-role-changed", onActiveRoleChanged);
  }, []);

  const primaryRole = assignedRoles.length > 0 ? assignedRoles[0] : null;
  const displayRole = activeRole ?? (rolesList.length > 0 ? rolesList[0] : primaryRole) ?? "USER";
  const roleLabel =
    ROLE_DISPLAY_LABELS[displayRole as SystemRole] ?? String(displayRole).toUpperCase();

  const buildMenuItems = useCallback((): MenuProps["items"] => {
    const userInfoItem = {
      key: "user-info",
      label: (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{user?.display_name ?? user?.username ?? "User"}</Typography.Text>
          <Typography.Text type="secondary" className="header-user-email">
            {roleLabel}
          </Typography.Text>
        </Space>
      ),
      disabled: true,
    } as const;

    const roleItems = rolesList.map((r) => ({
      key: `role-${r}`,
      label: (
        <Space>
          {activeRole === r ? <CheckOutlined /> : <span className="header-checkspace" />}
          <Typography.Text>{ROLE_DISPLAY_LABELS[r as SystemRole] ?? String(r)}</Typography.Text>
        </Space>
      ),
      onClick: () => {
        setActiveUserRole(r as SystemRole);
        setActiveRole(r);
      },
    }));

    const items: MenuProps["items"] = [userInfoItem];

    if (roleItems.length > 0) {
      items.push({ type: "divider" });
      items.push(...roleItems);
    }

    items.push({ type: "divider" });

    items.push({
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => handleLogout(),
    });

    return items;
  }, [user, activeRole, roleLabel, handleLogout, rolesList]);

  return (
    <div className="header-actions">
      <Dropdown menu={{ items: buildMenuItems() }} trigger={["click"]} placement="bottomRight">
        <Button type="text" loading={isLoggingOut}>
          <Space>
            <Avatar size="small" icon={<UserOutlined />} className="header-avatar" />
            <Typography.Text className="header-user-text" ellipsis>
              {user?.display_name ?? user?.username ?? "User"}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              className={`header-role-badge ${(capabilities?.isAdmin ?? false) || isPlatformAdmin ? "header-role-badge-admin" : "header-role-badge-default"}`}
            >
              {roleLabel}
            </Typography.Text>
            <DownOutlined className="chevron-icon" />
          </Space>
        </Button>
      </Dropdown>
    </div>
  );
};

export default Header;
