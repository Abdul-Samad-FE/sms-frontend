import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Switch } from 'antd';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  CalendarIcon,
  DashboardIcon,
  LayersIcon,
  LogoIcon,
  LogoutIcon,
  ShieldIcon,
  UserCogIcon,
  UsersIcon,
} from './Icons';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ collapsed = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, setTheme } = useTheme();
  const { logout, hasPermission, hasModule } = useAuth();

  // Each item declares the access it needs; the sidebar hides what the user
  // can't reach. `visible` returns true when the current user has access.
  const allItems = [
    {
      key: '/dashboard',
      icon: <DashboardIcon className="text-2xl" />,
      label: 'Dashboard',
      visible: () => hasModule('dashboard'),
    },
    {
      key: '/students',
      icon: <UsersIcon className="text-2xl" />,
      label: 'Students',
      visible: () => hasPermission('student:read'),
    },
    {
      key: '/classes',
      icon: <LayersIcon className="text-2xl" />,
      label: 'Classes',
      visible: () => hasPermission('class:read'),
    },
    {
      key: '/attendance',
      icon: <CalendarIcon className="text-2xl" />,
      label: 'Attendance',
      visible: () => hasPermission('attendance:read'),
    },
    {
      key: '/users',
      icon: <UserCogIcon className="text-2xl" />,
      label: 'Users',
      visible: () => hasPermission('user:read'),
    },
    {
      key: '/roles',
      icon: <ShieldIcon className="text-2xl" />,
      label: 'Roles',
      visible: () => hasModule('admin'),
    },
  ];

  const items = allItems
    .filter((item) => item.visible())
    .map(({ visible, ...item }) => item);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={65}
      className="sidebar-glass"
    >
      <div className="h-16 flex justify-center items-center mb-5">
        <LogoIcon
          style={{ width: '32px', height: '32px', color: 'var(--primary)' }}
        />
      </div>
      <Menu
        theme={isDark ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
      />

      <div className="mt-auto mb-4 flex flex-col items-center gap-6">
        {/* Theme Toggle */}
        <div className="sidebar-theme-toggle">
          <Switch
            checked={isDark}
            onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            className="theme-switch-compact"
          />
        </div>

        {/* Logout */}
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity flex justify-center items-center p-2 rounded-lg hover:bg-white/5"
          onClick={handleLogout}
        >
          <LogoutIcon
            style={{ width: '24px', height: '24px', color: '#ff4d4f' }}
          />
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
