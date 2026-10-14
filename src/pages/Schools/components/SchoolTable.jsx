import React from 'react';
import { Popconfirm, Switch, Tooltip } from 'antd';
import {
  ActionButton,
  DataTable,
  DateCell,
  EmptyCell,
  MonoCell,
  PrimaryCell,
  TableActions,
  TextCell,
} from '../../../components/ui';
import SchoolStatusTag from './SchoolStatusTag';

const renderCount = (value) => <MonoCell>{value ?? 0}</MonoCell>;

/**
 * Tenant list. The status Switch is the primary lifecycle control; archive is
 * secondary and reversible; permanent deletion lives in its own modal on the
 * page (never inline) because it is irreversible.
 *
 * @param {{
 *   schools?: Array<import('../../../api/schools').SchoolRecord>,
 *   loading?: boolean,
 *   pagination?: object,
 *   onEdit?: (school) => void,
 *   onToggleStatus?: (school, nextActive: boolean) => void,
 *   onArchive?: (school) => void,
 *   onRestore?: (school) => void,
 *   onPurge?: (school) => void,
 *   togglingId?: number|null,
 *   archivingId?: number|null,
 *   showOrganization?: boolean,   Global Admin view (schools of every org)
 *   canUpdate?: boolean,          school:update — edit / suspend / activate
 *   canArchive?: boolean,         school:archive — archive / restore
 *   canPurge?: boolean,           school:purge — permanent delete (Global)
 * }} props
 */
export default function SchoolTable({
  schools = [],
  loading = false,
  pagination,
  onEdit,
  onToggleStatus,
  onArchive,
  onRestore,
  onPurge,
  togglingId = null,
  archivingId = null,
  showOrganization = false,
  canUpdate = false,
  canArchive = false,
  canPurge = false,
}) {
  const columns = [
    {
      title: 'School',
      key: 'name',
      render: (_, record) => (
        <PrimaryCell secondary={record.uc_name}>{record.name}</PrimaryCell>
      ),
    },
    ...(showOrganization
      ? [
          {
            title: 'Organization',
            dataIndex: 'organization_name',
            key: 'organization_name',
            render: (name) => <TextCell>{name}</TextCell>,
          },
        ]
      : []),
    {
      title: 'EMIS Code',
      dataIndex: 'emis_code',
      key: 'emis_code',
      render: (code) => <MonoCell>{code}</MonoCell>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => <SchoolStatusTag school={record} />,
    },
    {
      title: 'Students',
      dataIndex: 'student_count',
      key: 'student_count',
      align: 'right',
      render: renderCount,
    },
    {
      title: 'Users',
      dataIndex: 'user_count',
      key: 'user_count',
      align: 'right',
      render: renderCount,
    },
    {
      title: 'Classes',
      dataIndex: 'class_count',
      key: 'class_count',
      align: 'right',
      render: renderCount,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => <DateCell value={value} />,
    },
    {
      title: 'Active',
      key: 'active',
      align: 'center',
      render: (_, record) => {
        const archived = !!record.deleted_at;
        return (
          <Tooltip
            title={
              archived
                ? 'Restore this school before activating it'
                : record.is_active
                  ? 'Suspend — blocks sign-in for all of this school’s users'
                  : 'Activate — restores sign-in for this school’s users'
            }
          >
            {/* span keeps the tooltip alive while the switch is disabled */}
            <span className="inline-flex">
              <Switch
                size="small"
                aria-label={`${record.is_active && !archived ? 'Suspend' : 'Activate'} ${record.name}`}
                checked={!archived && record.is_active}
                disabled={archived || !canUpdate}
                loading={togglingId === record.id}
                onChange={(checked) => onToggleStatus?.(record, checked)}
              />
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        const archived = !!record.deleted_at;
        if (archived) {
          if (!canArchive && !canPurge) return <EmptyCell />;
          return (
            <TableActions>
              {canArchive && (
                <ActionButton onClick={() => onRestore?.(record)}>
                  Restore
                </ActionButton>
              )}
              {canPurge && (
                <ActionButton
                  danger
                  tooltip="Permanently delete this school and all of its data"
                  onClick={() => onPurge?.(record)}
                >
                  Delete forever
                </ActionButton>
              )}
            </TableActions>
          );
        }
        if (!canUpdate && !canArchive) return <EmptyCell />;
        return (
          <TableActions>
            {canUpdate && (
              <ActionButton onClick={() => onEdit?.(record)}>Edit</ActionButton>
            )}
            {canArchive && (
              <Popconfirm
                title="Archive this school?"
                description={
                  <span className="block max-w-xs">
                    It is hidden and suspended, but nothing is deleted — you can
                    restore it at any time.
                  </span>
                }
                okText="Archive"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                placement="topRight"
                onConfirm={() => onArchive?.(record)}
              >
                <ActionButton danger loading={archivingId === record.id}>
                  Archive
                </ActionButton>
              </Popconfirm>
            )}
          </TableActions>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      dataSource={schools}
      loading={loading}
      pagination={pagination}
      rowClassName={(record) => (record.deleted_at ? 'opacity-60' : '')}
      emptyText="No schools found."
    />
  );
}
