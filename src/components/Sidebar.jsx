import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Switch } from 'antd';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  DashboardIcon,
  LogoIcon,
  LogoutIcon,
  UsersIcon,
} from './Icons';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar = ({ collapsed = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, setTheme } = useTheme();
  const { logout } = useAuth();

  const items = [
    {
      key: '/dashboard',
      icon: <DashboardIcon className="text-2xl" />,
      label: 'Dashboard',
    },
    {
      key: '/students',
      icon: <UsersIcon className="text-2xl" />,
      label: 'Students',
    },
  ];

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
        <LogoIcon style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
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
          <LogoutIcon style={{ width: '24px', height: '24px', color: '#ff4d4f' }} />
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
