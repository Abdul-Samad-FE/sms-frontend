import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Input,
  Popconfirm,
  Segmented,
  notification,
} from 'antd';
import { useAuth } from '../../context/AuthContext';
import {
  useOrganizationOptions,
  useOrganizations,
  useSetOrganizationStatus,
} from '../../hooks/useOrganizations';
import { usePagination } from '../../hooks/usePagination';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import {
  ActionButton,
  ContentCard,
  DataTable,
  DateCell,
  MonoCell,
  PageContainer,
  PageHeader,
  PrimaryCell,
  StatCard,
  StatGrid,
  StatusTag,
  TableActions,
} from '../../components/ui';
import {
  Building2Icon,
  CheckCircleIcon,
  NetworkIcon,
  UsersIcon,
} from '../../components/Icons';
import OnboardOrganizationModal from './components/OnboardOrganizationModal';
import OrganizationEditModal from './components/OrganizationEditModal';
import { apiError } from './components/formRules';

const renderCount = (value) => <MonoCell>{value ?? 0}</MonoCell>;

const STATUS_PARAM = { all: undefined, active: true, suspended: false };

/**
 * Global Admin console — every organization (school owner) on the platform:
 * onboard new owners, rename, and suspend / reactivate organizations.
 * Super Admins are redirected to their own organization's read-only view.
 */
export default function Organizations() {
  const navigate = useNavigate();
  const { hasPermission, isSuperAdmin, organization } = useAuth();
  const canCreate = hasPermission('organization:create');
  const canUpdate = hasPermission('organization:update');

  const [searchText, setSearchText] = useState('');
  const search = useDebouncedValue(searchText.trim(), 300) || undefined;
  const [status, setStatus] = useState('all');
  const paging = usePagination({ resetKeys: [search, status] });

  const listQuery = useOrganizations(
    { ...paging.params, search, is_active: STATUS_PARAM[status] },
    { enabled: !isSuperAdmin }
  );
  // Platform totals for the KPI cards (organizations are few; one call).
  const allQuery = useOrganizationOptions({ enabled: !isSuperAdmin });
  const statusMutation = useSetOrganizationStatus();

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [toEdit, setToEdit] = useState(null);

  const totals = useMemo(() => {
    const all = allQuery.data ?? [];
    return {
      organizations: all.length,
      active: all.filter((o) => o.is_active).length,
      schools: all.reduce((sum, o) => sum + (o.school_count ?? 0), 0),
      students: all.reduce((sum, o) => sum + (o.student_count ?? 0), 0),
    };
  }, [allQuery.data]);

  if (isSuperAdmin && organization?.id != null) {
    return <Navigate to={`/organizations/${organization.id}`} replace />;
  }

  const toggleStatus = async (org) => {
    try {
      await statusMutation.mutateAsync({
        id: org.id,
        isActive: !org.is_active,
      });
      notification.success({
        message: org.is_active
          ? `${org.name} suspended`
          : `${org.name} reactivated`,
      });
    } catch (err) {
      notification.error({
        message: 'Failed to change status',
        description: apiError(err),
      });
    }
  };

  const columns = [
    {
      title: 'Organization',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <PrimaryCell>{name}</PrimaryCell>,
    },
    {
      title: 'Schools',
      dataIndex: 'school_count',
      key: 'school_count',
      align: 'right',
      render: renderCount,
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
      title: 'Owners',
      dataIndex: 'owner_count',
      key: 'owner_count',
      align: 'right',
      render: renderCount,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <StatusTag tone={active ? 'success' : 'warning'}>
          {active ? 'Active' : 'Suspended'}
        </StatusTag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => <DateCell value={value} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, org) => (
        <TableActions>
          <ActionButton onClick={() => navigate(`/organizations/${org.id}`)}>
            View
          </ActionButton>
          {canUpdate && (
            <ActionButton onClick={() => setToEdit(org)}>Edit</ActionButton>
          )}
          {canUpdate && (
            <Popconfirm
              title={
                org.is_active
                  ? 'Suspend this organization?'
                  : 'Reactivate this organization?'
              }
              description={
                <span className="block max-w-xs">
                  {org.is_active
                    ? 'Every user of every school in it is signed out and locked out until it is reactivated.'
                    : 'Its users can sign in again (schools keep their own status).'}
                </span>
              }
              okText={org.is_active ? 'Suspend' : 'Reactivate'}
              cancelText="Cancel"
              okButtonProps={{ danger: org.is_active }}
              placement="topRight"
              onConfirm={() => toggleStatus(org)}
            >
              <ActionButton
                danger={org.is_active}
                loading={
                  statusMutation.isPending &&
                  statusMutation.variables?.id === org.id
                }
              >
                {org.is_active ? 'Suspend' : 'Activate'}
              </ActionButton>
            </Popconfirm>
          )}
        </TableActions>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Organizations"
        subtitle="School owners on the platform and the schools they run."
        actions={
          canCreate && (
            <Button type="primary" onClick={() => setOnboardOpen(true)}>
              + Onboard Organization
            </Button>
          )
        }
      />

      <StatGrid columns={4}>
        <StatCard
          label="Organizations"
          value={totals.organizations}
          icon={<NetworkIcon />}
          tone="primary"
          loading={allQuery.isLoading}
        />
        <StatCard
          label="Active"
          value={totals.active}
          icon={<CheckCircleIcon />}
          tone="success"
          loading={allQuery.isLoading}
        />
        <StatCard
          label="Schools"
          value={totals.schools}
          icon={<Building2Icon />}
          tone="info"
          loading={allQuery.isLoading}
        />
        <StatCard
          label="Students"
          value={totals.students}
          icon={<UsersIcon />}
          tone="accent"
          loading={allQuery.isLoading}
        />
      </StatGrid>

      {listQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title="Failed to load organizations."
          description={apiError(listQuery.error)}
          action={
            <Button size="small" danger onClick={() => listQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <ContentCard
          title="All Organizations"
          subtitle={`${listQuery.data?.meta?.total ?? 0} organization(s)`}
          extra={
            <>
              <Input.Search
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search organizations"
                aria-label="Search organizations"
                className="w-full sm:!w-64"
              />
              <Segmented
                aria-label="Filter by status"
                value={status}
                onChange={setStatus}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Suspended', value: 'suspended' },
                ]}
              />
            </>
          }
          flush
        >
          <DataTable
            columns={columns}
            dataSource={listQuery.data?.items ?? []}
            loading={listQuery.isFetching}
            pagination={paging.tableProps(listQuery.data?.meta)}
            emptyText="No organizations yet."
          />
        </ContentCard>
      )}

      <OnboardOrganizationModal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
      />
      <OrganizationEditModal
        open={!!toEdit}
        organization={toEdit}
        onClose={() => setToEdit(null)}
      />
    </PageContainer>
  );
}
