import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  DataTable,
  TableActions,
  ActionButton,
  DeleteAction,
  StatusTag,
  PrimaryCell,
  renderText,
  renderMuted,
  renderMono,
  renderDate,
} from '../../../components/ui';

/**
 * @param {{
 *   students: Object[],
 *   loading?: boolean,
 *   pagination?: import('antd').TablePaginationConfig,
 *   deletingId?: number|null,
 *   onEdit: (s: Object) => void,
 *   onViewDetail: (s: Object) => void,
 *   onViewCard: (s: Object) => void,
 *   onDelete: (id: number) => void,
 * }} props
 */
export default function StudentTable({
  students,
  loading,
  pagination,
  deletingId = null,
  onEdit,
  onViewDetail,
  onViewCard,
  onDelete,
}) {
  // Read-only viewers (e.g. the Global Admin) only get View / ID Card.
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('student:update');
  const canDelete = hasPermission('student:delete');

  const columns = [
    {
      title: 'Admission No',
      dataIndex: 'admission_number',
      key: 'admission_number',
      render: renderMono,
      fixed: 'left',
    },
    {
      title: 'Enroll No',
      dataIndex: 'enroll_no',
      key: 'enroll_no',
      render: renderMono,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <PrimaryCell>{text}</PrimaryCell>,
      width: 200,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: renderText,
    },
    {
      title: 'Class',
      dataIndex: 'class_name',
      key: 'class_name',
      render: renderText,
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: renderText,
    },
    {
      title: "Father's Name",
      dataIndex: 'father_name',
      key: 'father_name',
      width: 150,
      render: renderText,
    },
    {
      title: 'Contact',
      dataIndex: 'father_contact',
      key: 'father_contact',
      render: renderMuted,
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dob',
      key: 'dob',
      render: renderDate,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 200,
      render: renderMuted,
    },
    {
      title: 'Admission Date',
      dataIndex: 'admission_date',
      key: 'admission_date',
      render: renderDate,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag>{status}</StatusTag>,
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <TableActions>
          <ActionButton onClick={() => onViewDetail(record)}>View</ActionButton>
          <ActionButton onClick={() => onViewCard(record)}>
            ID Card
          </ActionButton>
          {canUpdate && (
            <ActionButton onClick={() => onEdit(record)}>Edit</ActionButton>
          )}
          {canDelete && (
            <DeleteAction
              title="Delete this student?"
              loading={deletingId === record.id}
              onConfirm={() => onDelete(record.id)}
            />
          )}
        </TableActions>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={students}
      loading={loading}
      pagination={pagination}
      emptyText="No students found."
    />
  );
}
