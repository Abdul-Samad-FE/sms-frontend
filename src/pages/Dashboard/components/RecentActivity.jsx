import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from '../../../context/AuthContext';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import { usePagination } from '../../../hooks/usePagination';
import {
  ContentCard,
  DataTable,
  EmptyCell,
  MutedCell,
  StatusTag,
  TextCell,
} from '../../../components/ui';

dayjs.extend(relativeTime);

/**
 * @typedef {import('../../../api/dashboard').RecentActivityItem} RecentActivityItem
 */

/** Tone an activity row by the verb in its action string. */
const ACTION_TONES = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  sign: 'accent',
  login: 'neutral',
  logout: 'neutral',
};

/** "create_student" -> "Create Student" */
const humanize = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const actionTone = (action) => {
  const verb = String(action || '').split('_')[0];
  return ACTION_TONES[verb] ?? 'neutral';
};

/**
 * Recent audit-trail activity feed for the dashboard.
 *
 * @param {{ items?: RecentActivityItem[], loading?: boolean }} props
 */
export default function RecentActivity({ items = [], loading = false }) {
  // Users who may read the audit trail page through it server-side; everyone
  // else sees the short feed that ships with the dashboard payload.
  const { hasPermission } = useAuth();
  const canBrowseAudit = hasPermission('audit:read');
  const paging = usePagination({ initialPageSize: 5 });
  const auditQuery = useAuditLogs(paging.params, { enabled: canBrowseAudit });
  const rows = canBrowseAudit ? (auditQuery.data?.items ?? []) : items;

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <StatusTag tone={actionTone(action)}>{humanize(action)}</StatusTag>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
      render: (entity, record) =>
        entity ? (
          <span>
            {humanize(entity)}
            {record.entity_id != null && (
              <span className="ds-cell-muted"> #{record.entity_id}</span>
            )}
          </span>
        ) : (
          <EmptyCell />
        ),
    },
    {
      title: 'By',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name) => <TextCell>{name || 'System'}</TextCell>,
    },
    {
      title: 'When',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (ts) =>
        ts ? (
          <span title={dayjs(ts).format('YYYY-MM-DD HH:mm:ss')}>
            <MutedCell>{dayjs(ts).fromNow()}</MutedCell>
          </span>
        ) : (
          <EmptyCell />
        ),
    },
  ];

  return (
    <ContentCard
      title="Recent Activity"
      subtitle="Latest actions recorded in the audit trail"
      flush
      className="h-full"
    >
      <DataTable
        columns={columns}
        dataSource={rows}
        loading={canBrowseAudit ? auditQuery.isFetching : loading}
        pagination={
          canBrowseAudit
            ? paging.tableProps(auditQuery.data?.meta)
            : { pageSize: 5 }
        }
        emptyText="No recent activity yet"
      />
    </ContentCard>
  );
}
