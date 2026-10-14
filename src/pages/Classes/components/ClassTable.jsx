import React from 'react';
import {
  DataTable,
  TableActions,
  ActionButton,
  DeleteAction,
  MonoCell,
  MutedCell,
  renderPrimary,
  renderText,
} from '../../../components/ui';

/**
 * Classes table: class teacher, enrolment and gender split per class, with
 * permission-gated actions. Pagination is driven by the server.
 *
 * @param {{
 *   classes?: Array<import('../../../api/classes').ClassRecord>,
 *   loading?: boolean,
 *   pagination?: import('antd').TablePaginationConfig,
 *   onView?: (cls) => void,
 *   onEdit?: (cls) => void,
 *   onDelete?: (id: number) => void,
 *   canUpdate?: boolean,
 *   canDelete?: boolean,
 *   deletingId?: number|null,
 * }} props
 */
export default function ClassTable({
  classes = [],
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
      title: 'Class',
      dataIndex: 'class_name',
      key: 'class_name',
      render: renderPrimary,
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: renderText,
    },
    {
      title: 'Class Teacher',
      dataIndex: 'class_teacher_name',
      key: 'class_teacher_name',
      render: (name) =>
        name ? renderText(name) : <MutedCell>Not assigned</MutedCell>,
    },
    {
      title: 'Students',
      dataIndex: 'student_count',
      key: 'student_count',
      align: 'right',
      render: (n) => <MonoCell>{n ?? 0}</MonoCell>,
    },
    {
      title: 'Male',
      dataIndex: 'male_count',
      key: 'male_count',
      align: 'right',
      render: (n) => <MonoCell>{n ?? 0}</MonoCell>,
    },
    {
      title: 'Female',
      dataIndex: 'female_count',
      key: 'female_count',
      align: 'right',
      render: (n) => <MonoCell>{n ?? 0}</MonoCell>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <TableActions>
          <ActionButton onClick={() => onView?.(record)}>View</ActionButton>
          {canUpdate && (
            <ActionButton onClick={() => onEdit?.(record)}>Edit</ActionButton>
          )}
          {canDelete && (
            <DeleteAction
              title="Delete this class?"
              description="Students in this class will be unassigned."
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
      dataSource={classes}
      loading={loading}
      pagination={pagination}
      emptyText="No classes yet."
    />
  );
}
