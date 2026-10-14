import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Switch } from 'antd';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  Building2Icon,
  CalendarIcon,
  DashboardIcon,
  FileTextIcon,
  LayersIcon,
  LogoIcon,
  LogoutIcon,
  NetworkIcon,
  ShieldIcon,
  UserCheckIcon,
  UserCogIcon,
  UsersIcon,
} from './Icons';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ collapsed = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, setTheme } = useTheme();
  const {
    logout,
    hasPermission,
    hasModule,
    isSchoolUser,
    isSuperAdmin,
    organization,
  } = useAuth();

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
      key: '/teachers',
      icon: <UserCheckIcon className="text-2xl" />,
      label: 'Teachers',
      visible: () => hasPermission('teacher:read'),
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
      key: '/examination',
      icon: <FileTextIcon className="text-2xl" />,
      label: 'Examination',
      visible: () => hasPermission('exam:read'),
    },
    {
      key: '/organizations',
      icon: <NetworkIcon className="text-2xl" />,
      label: 'Organizations',
      visible: () => hasModule('organizations') && !isSuperAdmin,
    },
    {
      // Owners get a read-only view of their own organization.
      key: `/organizations/${organization?.id}`,
      icon: <NetworkIcon className="text-2xl" />,
      label: 'My Organization',
      visible: () =>
        isSuperAdmin &&
        organization?.id != null &&
        hasPermission('organization:read'),
    },
    {
      key: '/schools',
      icon: <Building2Icon className="text-2xl" />,
      label: 'Schools',
      // Managing schools spans tenants — Global Admins and owners only.
      visible: () => !isSchoolUser && hasPermission('school:read'),
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
        selectedKeys={[
          // Highlight the section for nested routes too (e.g. /classes/12).
          items.find(
            (i) =>
              location.pathname === i.key ||
              location.pathname.startsWith(`${i.key}/`)
          )?.key ?? location.pathname,
        ]}
        items={items}
        onClick={({ key }) => navigate(key)}
      />

      <div className="mt-auto mb-4 flex flex-col items-center gap-6">
        {/* Theme Toggle */}
        <div className="sidebar-theme-toggle">
          <Switch
            aria-label="Dark theme"
            checked={isDark}
            onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            className="theme-switch-compact"
          />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="sidebar-logout"
        >
          <LogoutIcon style={{ width: '22px', height: '22px' }} />
        </button>
      </div>
    </Sider>
  );
};

export default Sidebar;
