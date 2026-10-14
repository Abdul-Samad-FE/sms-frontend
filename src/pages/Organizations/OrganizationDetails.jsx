import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Popconfirm, Skeleton, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import {
  useOrganization,
  useSetOrganizationStatus,
} from '../../hooks/useOrganizations';
import {
  ContentCard,
  DataTable,
  MonoCell,
  PageContainer,
  PageHeader,
  PrimaryCell,
  StatCard,
  StatGrid,
  StatusTag,
} from '../../components/ui';
import {
  Building2Icon,
  NetworkIcon,
  ShieldIcon,
  UsersIcon,
} from '../../components/Icons';
import SchoolStatusTag from '../Schools/components/SchoolStatusTag';
import AddOwnerModal from './components/AddOwnerModal';
import OrganizationEditModal from './components/OrganizationEditModal';
import { apiError } from './components/formRules';

/**
 * One organization: its schools and owners (Super Admins).
 * Global Admins can rename, suspend / reactivate and add owners; Super
 * Admins see their own organization read-only.
 */
export default function OrganizationDetails() {
  const { organizationId } = useParams();
  const id = Number(organizationId);
  const navigate = useNavigate();
  const { hasPermission, isGlobal } = useAuth();
  const canUpdate = hasPermission('organization:update');

  const query = useOrganization(Number.isFinite(id) ? id : null);
  const statusMutation = useSetOrganizationStatus();
  const [editOpen, setEditOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);

  const org = query.data;

  const toggleStatus = async () => {
    try {
      await statusMutation.mutateAsync({ id, isActive: !org.is_active });
      notification.success({
        message: org.is_active
          ? 'Organization suspended'
          : 'Organization reactivated',
      });
    } catch (err) {
      notification.error({
        message: 'Failed to change status',
        description: apiError(err),
      });
    }
  };

  const schoolColumns = [
    {
      title: 'School',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <PrimaryCell>{name}</PrimaryCell>,
    },
    {
      title: 'EMIS Code',
      dataIndex: 'emis_code',
      key: 'emis_code',
      render: (code) => <MonoCell>{code}</MonoCell>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, school) => <SchoolStatusTag school={school} />,
    },
  ];

  const ownerColumns = [
    {
      title: 'Owner',
      dataIndex: 'name',
      key: 'name',
      render: (name, owner) => (
        <PrimaryCell secondary={owner.email}>{name}</PrimaryCell>
      ),
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

  const headerActions = org && (
    <>
      {isGlobal && (
        <Button onClick={() => navigate('/organizations')}>← Back</Button>
      )}
      {canUpdate && <Button onClick={() => setEditOpen(true)}>Edit</Button>}
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
                ? 'Every user of every school in it is locked out until it is reactivated.'
                : 'Its users can sign in again.'}
            </span>
          }
          okText={org.is_active ? 'Suspend' : 'Reactivate'}
          cancelText="Cancel"
          okButtonProps={{ danger: org.is_active }}
          placement="bottomRight"
          onConfirm={toggleStatus}
        >
          <Button danger={org.is_active} loading={statusMutation.isPending}>
            {org.is_active ? 'Suspend' : 'Activate'}
          </Button>
        </Popconfirm>
      )}
      {canUpdate && (
        <Button type="primary" onClick={() => setOwnerOpen(true)}>
          + Add Owner
        </Button>
      )}
    </>
  );

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Organization" icon={<NetworkIcon />} />
        <Alert
          type="error"
          showIcon
          title="Organization not found or failed to load."
          description={apiError(query.error)}
          action={
            isGlobal && (
              <Button size="small" onClick={() => navigate('/organizations')}>
                Back to list
              </Button>
            )
          }
        />
      </PageContainer>
    );
  }

  const schools = org?.schools ?? [];
  const owners = org?.owners ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={
          org ? (
            <span className="inline-flex flex-wrap items-center gap-3">
              {org.name}
              <StatusTag tone={org.is_active ? 'success' : 'warning'}>
                {org.is_active ? 'Active' : 'Suspended'}
              </StatusTag>
            </span>
          ) : (
            'Organization'
          )
        }
        subtitle={
          isGlobal
            ? 'Schools and owners of this organization.'
            : 'Your organization — the schools you own. Contact the platform administrator to add owners.'
        }
        icon={<NetworkIcon />}
        actions={headerActions}
      />

      {query.isLoading ? (
        <div className="ds-card p-5">
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : (
        <>
          <StatGrid columns={4}>
            <StatCard
              label="Schools"
              value={org?.school_count ?? schools.length}
              icon={<Building2Icon />}
              tone="primary"
            />
            <StatCard
              label="Students"
              value={org?.student_count ?? 0}
              icon={<UsersIcon />}
              tone="info"
            />
            <StatCard
              label="Users"
              value={org?.user_count ?? 0}
              icon={<UsersIcon />}
              tone="accent"
            />
            <StatCard
              label="Owners"
              value={org?.owner_count ?? owners.length}
              icon={<ShieldIcon />}
              tone="success"
            />
          </StatGrid>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <ContentCard
              title="Schools"
              subtitle={`${schools.length} school(s)`}
              flush
              className="xl:col-span-3"
            >
              {/* Small embedded list from the detail payload. */}
              <DataTable
                columns={schoolColumns}
                dataSource={schools}
                emptyText="No schools yet."
              />
            </ContentCard>
            <ContentCard
              title="Owners"
              subtitle="Super Admins of this organization"
              flush
              className="xl:col-span-2"
            >
              <DataTable
                columns={ownerColumns}
                dataSource={owners}
                emptyText="No owners yet."
              />
            </ContentCard>
          </div>
        </>
      )}

      <OrganizationEditModal
        open={editOpen}
        organization={org}
        onClose={() => setEditOpen(false)}
      />
      <AddOwnerModal
        open={ownerOpen}
        organizationId={id}
        organizationName={org?.name}
        onClose={() => setOwnerOpen(false)}
      />
    </PageContainer>
  );
}
