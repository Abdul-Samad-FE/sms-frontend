import React from 'react';
import { Tag } from 'antd';
import {
  ActionButton,
  ContentCard,
  DataTable,
  DeleteAction,
  MonoCell,
  MutedCell,
  PrimaryCell,
  StatusTag,
  TableActions,
} from '../../../components/ui';

/** Canonical roles are re-seeded on startup — block deletion to avoid surprises. */
const PROTECTED_ROLES = new Set(['superadmin', 'admin', 'teacher', 'staff']);

/** Chip list for the expanded-row detail panel. */
function ChipGroup({ label, items, renderItem }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="ds-label">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items?.length ? (
          items.map(renderItem)
        ) : (
          <span className="ds-caption">None</span>
        )}
      </div>
    </div>
  );
}

/**
 * Roles table. Expand a row to inspect its permissions + modules.
 *
 * @param {{
 *   roles?: Array<import('../../../api/admin').RoleRecord>,
 *   loading?: boolean,
 *   pagination?: object,
 *   onEdit?: (role) => void,
 *   onDelete?: (id: number) => void,
 *   canManage?: boolean,
 *   deletingId?: number|null,
 * }} props
 */
export default function RoleTable({
  roles = [],
  loading = false,
  pagination,
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
        <PrimaryCell>
          <span className="capitalize">{text}</span>
        </PrimaryCell>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (d) => <MutedCell>{d}</MutedCell>,
    },
    {
      title: 'Permissions',
      key: 'permissions',
      align: 'center',
      render: (_, r) => <MonoCell>{r.permissions?.length ?? 0}</MonoCell>,
    },
    {
      title: 'Modules',
      key: 'modules',
      align: 'center',
      render: (_, r) => <MonoCell>{r.modules?.length ?? 0}</MonoCell>,
    },
  ];

  if (canManage) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        const isProtected = PROTECTED_ROLES.has(record.role_name);
        return (
          <TableActions>
            <ActionButton onClick={() => onEdit?.(record)}>Edit</ActionButton>
            <DeleteAction
              title="Delete this role?"
              description="Users assigned to it will lose their role."
              disabled={isProtected}
              tooltip={
                isProtected ? 'Built-in roles cannot be deleted' : undefined
              }
              loading={deletingId === record.id}
              onConfirm={() => onDelete?.(record.id)}
            />
          </TableActions>
        );
      },
    });
  }

  const expandedRowRender = (role) => (
    <div className="flex flex-col gap-4 px-2 py-3">
      <ChipGroup
        label="Permissions"
        items={role.permissions}
        renderItem={(p) => (
          <Tag
            key={p.id}
            variant="filled"
            className="!m-0 ds-cell-mono"
            title={p.description || ''}
          >
            {p.permission_key}
          </Tag>
        )}
      />
      <ChipGroup
        label="Modules"
        items={role.modules}
        renderItem={(m) => (
          <StatusTag key={m.id} tone="primary">
            {m.display_name}
          </StatusTag>
        )}
      />
    </div>
  );

  return (
    <ContentCard
      title="Roles"
      subtitle="Expand a row to see its permissions and modules."
      flush
    >
      <DataTable
        columns={columns}
        dataSource={roles}
        loading={loading}
        pagination={pagination}
        expandable={{ expandedRowRender }}
        emptyText="No roles found."
      />
    </ContentCard>
  );
}
