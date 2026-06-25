import React from 'react';
import { Table, Tag, Empty } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * @typedef {import('../../../api/dashboard').RecentActivityItem} RecentActivityItem
 */

/** Colour an activity row by the verb in its action string. */
const ACTION_COLORS = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  login: 'default',
  logout: 'default',
  sign_up: 'cyan',
};

/** "create_student" -> "Create Student" */
const humanize = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const actionColor = (action) => {
  const verb = String(action || '').split('_')[0];
  return ACTION_COLORS[verb] ?? 'default';
};

/**
 * Recent audit-trail activity feed for the dashboard.
 *
 * @param {{ items?: RecentActivityItem[], loading?: boolean }} props
 */
export default function RecentActivity({ items = [], loading = false }) {
  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={actionColor(action)} className="border-0 font-medium">
          {humanize(action)}
        </Tag>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
      render: (entity, record) =>
        entity ? (
          <span className="text-[var(--foreground)]">
            {humanize(entity)}
            {record.entity_id != null && (
              <span className="text-[var(--muted-foreground)]">
                {' '}
                #{record.entity_id}
              </span>
            )}
          </span>
        ) : (
          <span className="text-[var(--muted-foreground)]">—</span>
        ),
    },
    {
      title: 'By',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name) => (
        <span className="text-[var(--foreground)]">{name || 'System'}</span>
      ),
    },
    {
      title: 'When',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (ts) =>
        ts ? (
          <span
            className="text-[var(--muted-foreground)] text-sm"
            title={dayjs(ts).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(ts).fromNow()}
          </span>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div className="card-glass p-0 overflow-hidden outline-none border-[var(--card-border)] shadow-sm">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center header-glass">
        <h3 className="text-lg font-semibold m-0 text-[var(--foreground)]">
          Recent Activity
        </h3>
      </div>
      <div className="ai-reports-table">
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5, hideOnSinglePage: true }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No recent activity yet"
              />
            ),
          }}
        />
      </div>
    </div>
  );
}
