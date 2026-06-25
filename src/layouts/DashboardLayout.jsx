import React from 'react';
import { Layout } from 'antd';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../theme';
import './DashboardLayout.css';

const { Content } = Layout;

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
          <div className="relative z-[2] h-full min-h-screen">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
