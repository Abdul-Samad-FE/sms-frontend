import React from 'react';
import { Table, Tag, Button } from 'antd';

export default function AlertTable({ alerts }) {
  const columns = [
    {
      title: 'Warning ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: 'Alert Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-base">{text}</div>
          <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{record.details}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Priority',
      dataIndex: 'priority_level',
      key: 'priority_level',
      render: (level) => {
        const colors = {
          P1: 'var(--incident-p1)',
          P2: 'var(--incident-p2)',
          P3: 'var(--incident-p3)',
          P4: 'var(--incident-p4)',
          P5: 'var(--incident-p5)',
        };
        const bgColors = {
          P1: 'var(--incident-p1-bg)',
          P2: 'var(--incident-p2-bg)',
          P3: 'var(--incident-p3-bg)',
          P4: 'var(--incident-p4-bg)',
          P5: 'var(--incident-p5-bg)',
        };
        return (
          <span 
            className="px-2 py-1 rounded border-0 text-xs font-semibold" 
            style={{ color: colors[level], backgroundColor: bgColors[level] || 'var(--tag-bg)' }}
          >
            {level}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Active') color = 'error';
        if (status === 'In Progress') color = 'processing';
        if (status === 'Pending') color = 'warning';
        return <Tag color={color} className="border-0 font-medium">{status}</Tag>;
      }
    },
    {
      title: 'Score',
      dataIndex: 'priority_score',
      key: 'score',
      render: (score) => {
        let color = 'var(--success)';
        if (score > 80) color = 'var(--danger)';
        else if (score > 50) color = 'var(--warning)';
        
        return (
          <div className="flex items-center gap-2">
            <span style={{ color }} className="font-semibold w-6">{score}</span>
            <div className="w-16 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden border border-[var(--border)]">
              <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }}></div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button size="small" className="bg-transparent border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="card-glass p-0 overflow-hidden outline-none border-[var(--card-border)] shadow-sm">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center header-glass">
        <h3 className="text-lg font-semibold m-0 text-[var(--foreground)]">Recent Dashboard Alerts</h3>
      </div>
      <div className="ai-reports-table">
        <Table 
          columns={columns} 
          dataSource={alerts} 
          rowKey="id" 
          pagination={{ pageSize: 5 }} 
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
}
