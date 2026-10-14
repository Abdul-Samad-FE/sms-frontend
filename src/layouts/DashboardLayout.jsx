import React, { Suspense } from 'react';
import { Layout, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import './DashboardLayout.css';

const { Content } = Layout;

/** Shown inside the content area while a lazily-loaded page downloads. */
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spin size="large" />
    </div>
  );
}

/**
 * App shell: fixed sidebar + content area. Used as a parent route, it renders
 * the active child page through <Outlet />; `children` is still supported for
 * one-off usage.
 */
const DashboardLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen relative !bg-[var(--background)]">
      <div className="dashboard-bg">
        <div className="dashboard-bg-overlay" />
      </div>

      <Sidebar collapsed={true} />
      <Layout
        className="relative z-[1] transition-all duration-200 !bg-transparent"
        style={{ marginLeft: 65 }}
      >
        <Content className="p-0 h-full min-h-screen relative z-[1]">
          <div className="relative z-[2] h-full min-h-screen">
            <TopBar />
            <Suspense fallback={<PageLoader />}>
              {children ?? <Outlet />}
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
