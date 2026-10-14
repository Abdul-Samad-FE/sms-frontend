import React from 'react';
import {
  DataTable,
  TableActions,
  ActionButton,
  DeleteAction,
  MutedCell,
  PrimaryCell,
  StatusTag,
  renderMono,
  renderMuted,
  renderText,
} from '../../../components/ui';

const STATUS_TONES = {
  Active: 'success',
  Inactive: 'danger',
  'On Leave': 'warning',
};

/**
 * Server-paginated teachers table with permission-gated text actions.
 *
 * @param {{
 *   teachers?: Array<import('../../../api/teachers').TeacherRecord>,
 *   loading?: boolean,
 *   pagination?: import('antd').TablePaginationConfig,
 *   onView?: (teacher) => void,
 *   onEdit?: (teacher) => void,
 *   onDelete?: (id: number) => void,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   deletingId?: number|null,
 * }} props
 */
export default function TeacherTable({
  teachers = [],
  loading = false,
  pagination,
  onView,
  onEdit,
  onDelete,
  canUpdate = false,
  canDelete = false,
  deletingId = null,
}) {
  const columns = [
    {
      title: 'Employee Code',
      dataIndex: 'employee_code',
      key: 'employee_code',
      render: renderMono,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <PrimaryCell secondary={record.email}>{name}</PrimaryCell>
      ),
    },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: renderText },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: renderMuted },
    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
      render: renderText,
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: renderText,
    },
    {
      title: 'Class Teacher Of',
      dataIndex: 'class_names',
      key: 'class_names',
      render: (names) =>
        names?.length ? (
          <span>{names.join(', ')}</span>
        ) : (
          <MutedCell>—</MutedCell>
        ),
    },
    {
      title: 'Login',
      dataIndex: 'has_login',
      key: 'has_login',
      render: (hasLogin) => (
        <StatusTag tone={hasLogin ? 'primary' : 'neutral'}>
          {hasLogin ? 'Yes' : 'No'}
        </StatusTag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <StatusTag tone={STATUS_TONES[status]}>{status}</StatusTag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      fixed: 'right',
      render: (_, record) => (
        <TableActions>
          <ActionButton onClick={() => onView?.(record)}>View</ActionButton>
          {canUpdate && (
            <ActionButton onClick={() => onEdit?.(record)}>Edit</ActionButton>
          )}
          {canDelete && (
            <DeleteAction
              title="Delete this teacher?"
              description={
                record.has_login
                  ? 'Their login account will be removed and they will be unassigned from their classes.'
                  : 'They will be unassigned from their classes.'
              }
              loading={deletingId === record.id}
              onConfirm={() => onDelete?.(record.id)}
            />
          )}
        </TableActions>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={teachers}
      loading={loading}
      pagination={pagination}
      emptyText="No teachers found."
    />
  );
}
