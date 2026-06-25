import React from 'react';
import { Button, Empty, Popconfirm, Space, Table, Tag } from 'antd';
import { EyeIcon, EditIcon, Trash2Icon } from '../../../components/Icons';

/**
 * Classes table with per-class student counts and permission-gated actions.
 *
 * @param {{
 *   classes?: Array<import('../../../api/classes').ClassRecord>,
 *   loading?: boolean,
 *   studentCountByClass?: Map<number, number>,
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
  studentCountByClass = new Map(),
  onView,
  onEdit,
  onDelete,
  canUpdate = false,
  canDelete = false,
  deletingId = null,
}) {
  const columns = [
    {
      title: 'Class Name',
      dataIndex: 'class_name',
      key: 'class_name',
      render: (text) => (
        <span className="font-semibold text-[var(--foreground)]">{text}</span>
      ),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: (section) =>
        section ? (
          <Tag className="border-0">{section}</Tag>
        ) : (
          <span className="text-[var(--muted-foreground)]">—</span>
        ),
    },
    {
      title: 'Students',
      key: 'students',
      render: (_, record) => (
        <span className="font-mono">
          {studentCountByClass.get(record.id) ?? 0}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeIcon className="w-4 h-4" />}
            onClick={() => onView?.(record)}
          >
            View
          </Button>
          {canUpdate && (
            <Button
              size="small"
              icon={<EditIcon className="w-4 h-4" />}
              onClick={() => onEdit?.(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Delete this class?"
              description="Students in this class will be unassigned."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete?.(record.id)}
            >
              <Button
                size="small"
                danger
                loading={deletingId === record.id}
                icon={<Trash2Icon className="w-4 h-4" />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="card-glass p-0 overflow-hidden border-[var(--card-border)] shadow-sm">
      <Table
        columns={columns}
        dataSource={classes}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: <Empty description="No classes yet." />,
        }}
      />
    </div>
  );
}
