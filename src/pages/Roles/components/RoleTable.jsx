import React from 'react';
import { Button, Empty, Popconfirm, Space, Table, Tag } from 'antd';
import { EditIcon, Trash2Icon } from '../../../components/Icons';

/** Canonical roles are re-seeded on startup — block deletion to avoid surprises. */
const PROTECTED_ROLES = new Set(['superadmin', 'admin', 'teacher', 'staff']);

/**
 * Roles table. Expand a row to inspect its permissions + modules.
 *
 * @param {{
 *   roles?: Array<import('../../../api/admin').RoleRecord>,
 *   loading?: boolean,
 *   onEdit?: (role) => void,
 *   onDelete?: (id: number) => void,
 *   canManage?: boolean,
 *   deletingId?: number|null,
 * }} props
 */
export default function RoleTable({
  roles = [],
  loading = false,
  onEdit,
  onDelete,
  canManage = false,
  deletingId = null,
}) {
  const columns = [
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (text) => (
        <span className="font-semibold capitalize text-[var(--foreground)]">
          {text}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (d) => d || <span className="text-[var(--muted-foreground)]">—</span>,
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, r) => <Tag color="blue">{r.permissions?.length ?? 0}</Tag>,
    },
    {
      title: 'Modules',
      key: 'modules',
      render: (_, r) => <Tag color="geekblue">{r.modules?.length ?? 0}</Tag>,
    },
  ];

  if (canManage) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isProtected = PROTECTED_ROLES.has(record.role_name);
        return (
          <Space>
            <Button
              size="small"
              icon={<EditIcon className="w-4 h-4" />}
              onClick={() => onEdit?.(record)}
            />
            <Popconfirm
              title="Delete this role?"
              description="Users assigned to it will lose their role."
              okText="Delete"
              okButtonProps={{ danger: true }}
              disabled={isProtected}
              onConfirm={() => onDelete?.(record.id)}
            >
              <Button
                size="small"
                danger
                disabled={isProtected}
                title={isProtected ? 'Built-in roles cannot be deleted' : undefined}
                loading={deletingId === record.id}
                icon={<Trash2Icon className="w-4 h-4" />}
              />
            </Popconfirm>
          </Space>
        );
      },
    });
  }

  const expandedRowRender = (role) => (
    <div className="flex flex-col gap-3 py-2">
      <div>
        <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1">
          PERMISSIONS
        </p>
        <div className="flex flex-wrap gap-1">
          {role.permissions?.length ? (
            role.permissions.map((p) => (
              <Tag key={p.id} className="border-0" title={p.description || ''}>
                {p.permission_key}
              </Tag>
            ))
          ) : (
            <span className="text-[var(--muted-foreground)] text-sm">None</span>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1">
          MODULES
        </p>
        <div className="flex flex-wrap gap-1">
          {role.modules?.length ? (
            role.modules.map((m) => (
              <Tag key={m.id} color="geekblue" className="border-0">
                {m.display_name}
              </Tag>
            ))
          ) : (
            <span className="text-[var(--muted-foreground)] text-sm">None</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="card-glass p-0 overflow-hidden border-[var(--card-border)] shadow-sm">
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <Empty description="No roles found." /> }}
      />
    </div>
  );
}
