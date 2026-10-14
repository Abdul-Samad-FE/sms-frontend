import React from 'react';
import {
  ActionButton,
  ContentCard,
  DataTable,
  DeleteAction,
  MutedCell,
  PrimaryCell,
  StatusTag,
  TableActions,
  TextCell,
  EmptyCell,
} from '../../../components/ui';

/** "global" -> "Global Admin" etc. */
export const levelLabel = (level) =>
  ({
    global: 'Global Admin',
    super_admin: 'Super Admin',
    school: 'School',
  })[level] ?? 'School';

const LEVEL_TONES = {
  global: 'accent',
  super_admin: 'primary',
  school: 'info',
};

/**
 * Users table with level / role / tenant / status and permission-gated
 * actions.
 *
 * @param {{
 *   users?: Array<import('../../../api/users').UserRecord>,
 *   total?: number,             total matching users (all pages)
 *   loading?: boolean,
 *   pagination?: import('antd').TablePaginationConfig,
 *   toolbar?: React.ReactNode,  search / filters for the card header
 *   currentUserId?: number,
 *   onEdit?: (user) => void,
 *   onDelete?: (id: number) => void,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   deletingId?: number|null,
 * }} props
 */
export default function UserTable({
  users = [],
  total = users.length,
  loading = false,
  pagination,
  toolbar,
  currentUserId,
  onEdit,
  onDelete,
  canUpdate = false,
  canDelete = false,
  deletingId = null,
}) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <PrimaryCell secondary={record.email}>{text}</PrimaryCell>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <StatusTag tone={LEVEL_TONES[level] ?? 'info'}>
          {levelLabel(level)}
        </StatusTag>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      // Global / Super Admin roles are implied by the level.
      render: (role, record) =>
        record.level && record.level !== 'school' ? (
          <EmptyCell />
        ) : (
          <TextCell>{role}</TextCell>
        ),
    },
    {
      title: 'Organization / School',
      key: 'tenant',
      render: (_, record) => {
        if (record.level === 'global') return <MutedCell>Platform</MutedCell>;
        const school =
          record.school_name ??
          (record.school_id != null ? `#${record.school_id}` : null);
        if (record.level === 'super_admin') {
          return (
            <PrimaryCell secondary="All schools">
              {record.organization_name ?? '—'}
            </PrimaryCell>
          );
        }
        return (
          <PrimaryCell secondary={record.organization_name}>
            {school}
          </PrimaryCell>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <StatusTag tone={active ? 'success' : 'danger'}>
          {active ? 'Active' : 'Inactive'}
        </StatusTag>
      ),
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        const isSelf = record.id === currentUserId;
        return (
          <TableActions>
            {canUpdate && (
              <ActionButton onClick={() => onEdit?.(record)}>Edit</ActionButton>
            )}
            {canDelete && (
              <DeleteAction
                title="Delete this user?"
                disabled={isSelf}
                tooltip={
                  isSelf ? 'You cannot delete your own account' : undefined
                }
                loading={deletingId === record.id}
                onConfirm={() => onDelete?.(record.id)}
              />
            )}
          </TableActions>
        );
      },
    });
  }

  return (
    <ContentCard
      title="All Users"
      subtitle={`${total} account${total === 1 ? '' : 's'}`}
      extra={toolbar}
      flush
    >
      <DataTable
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={pagination}
        emptyText="No users found."
      />
    </ContentCard>
  );
}
