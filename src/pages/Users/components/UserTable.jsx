import React from 'react';
import { Button, Empty, Popconfirm, Space, Table, Tag } from 'antd';
import { EditIcon, Trash2Icon } from '../../../components/Icons';

/**
 * Users table with role / school / status and permission-gated actions.
 *
 * @param {{
 *   users?: Array<import('../../../api/users').UserRecord>,
 *   loading?: boolean,
 *   schoolNameById?: Map<number, string>,
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
  loading = false,
  schoolNameById = new Map(),
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
        <div>
          <div className="font-semibold text-[var(--foreground)]">{text}</div>
          <div className="text-[11px] text-[var(--muted-foreground)]">
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (role, record) =>
        record.is_superuser ? (
          <Tag color="purple" className="border-0">
            Superadmin
          </Tag>
        ) : role ? (
          <Tag color="blue" className="border-0">
            {role}
          </Tag>
        ) : (
          <span className="text-[var(--muted-foreground)]">—</span>
        ),
    },
    {
      title: 'School',
      dataIndex: 'school_id',
      key: 'school_id',
      render: (schoolId) =>
        schoolId == null ? (
          <span className="text-[var(--muted-foreground)]">All (global)</span>
        ) : (
          schoolNameById.get(schoolId) ?? `#${schoolId}`
        ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'} className="border-0">
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isSelf = record.id === currentUserId;
        return (
          <Space>
            {canUpdate && (
              <Button
                size="small"
                icon={<EditIcon className="w-4 h-4" />}
                onClick={() => onEdit?.(record)}
              />
            )}
            {canDelete && (
              <Popconfirm
                title="Delete this user?"
                okText="Delete"
                okButtonProps={{ danger: true }}
                disabled={isSelf}
                onConfirm={() => onDelete?.(record.id)}
              >
                <Button
                  size="small"
                  danger
                  disabled={isSelf}
                  title={isSelf ? 'You cannot delete your own account' : undefined}
                  loading={deletingId === record.id}
                  icon={<Trash2Icon className="w-4 h-4" />}
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    });
  }

  return (
    <div className="card-glass p-0 overflow-hidden border-[var(--card-border)] shadow-sm">
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <Empty description="No users found." /> }}
      />
    </div>
  );
}
