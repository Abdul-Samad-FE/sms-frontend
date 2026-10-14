import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Input,
  Modal,
  Segmented,
  Switch,
  notification,
} from 'antd';
import {
  useSchoolsPage,
  useArchiveSchool,
  useRestoreSchool,
  useSetSchoolStatus,
} from '../../hooks/useSchools';
import SchoolTable from './components/SchoolTable';
import SchoolFormModal from './components/SchoolFormModal';
import SchoolSummaryCards from './components/SchoolSummaryCards';
import PurgeSchoolModal from './components/PurgeSchoolModal';
import ExportCsvButton from '../../components/ExportCsvButton';
import { ContentCard, PageContainer, PageHeader } from '../../components/ui';
import { usePagination } from '../../hooks/usePagination';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 10;

/**
 * School management for Global Admins (every organization) and Super Admins
 * (their own organization). Create schools, edit their details, and drive the
 * lifecycle: active → suspended → archived → permanently deleted (Global
 * only). Every action is gated by its permission key; the API enforces the
 * same rules.
 */
export default function Schools() {
  const { hasPermission, isGlobal } = useAuth();
  const canCreate = hasPermission('school:create');
  const canUpdate = hasPermission('school:update');
  const canArchive = hasPermission('school:archive');
  const canPurge = hasPermission('school:purge');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [includeArchived, setIncludeArchived] = useState(false);
  const paging = usePagination({ initialPageSize: PAGE_SIZE });

  const [formOpen, setFormOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState(null);
  const [schoolToPurge, setSchoolToPurge] = useState(null);

  const query = useSchoolsPage({
    ...paging.params,
    search: search.trim() || undefined,
    status: statusFilter,
    include_archived: includeArchived,
  });

  const statusMutation = useSetSchoolStatus();
  const archiveMutation = useArchiveSchool();
  const restoreMutation = useRestoreSchool();

  const schools = query.data?.items ?? [];
  const meta = query.data?.meta;

  const summary = useMemo(() => {
    const active = schools.filter((s) => s.is_active && !s.deleted_at).length;
    return {
      total: meta?.total ?? schools.length,
      activeCount: active,
      inactiveCount: schools.length - active,
      studentTotal: schools.reduce((sum, s) => sum + (s.student_count ?? 0), 0),
    };
  }, [schools, meta]);

  const resetToFirstPage = paging.reset;

  const handleAdd = () => {
    setSchoolToEdit(null);
    setFormOpen(true);
  };

  const handleEdit = (school) => {
    setSchoolToEdit(school);
    setFormOpen(true);
  };

  const runMutation = async (promise, successMessage, errorMessage) => {
    try {
      await promise;
      notification.success({ message: successMessage });
    } catch (err) {
      notification.error({
        message: errorMessage,
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const handleToggleStatus = (school, nextActive) => {
    if (nextActive) {
      runMutation(
        statusMutation.mutateAsync({ id: school.id, isActive: true }),
        `"${school.name}" is now active.`,
        'Failed to activate school'
      );
      return;
    }
    // Suspending logs every one of the school's users out — make that explicit.
    Modal.confirm({
      title: `Suspend "${school.name}"?`,
      content: (
        <span>
          All {school.user_count ?? 0} user accounts in this school will be
          unable to sign in, and anyone currently signed in is logged out on
          their next request. No data is deleted, and you can reactivate at any
          time.
        </span>
      ),
      okText: 'Suspend',
      okButtonProps: { danger: true },
      onOk: () =>
        runMutation(
          statusMutation.mutateAsync({ id: school.id, isActive: false }),
          `"${school.name}" has been suspended.`,
          'Failed to suspend school'
        ),
    });
  };

  const handleArchive = (school) =>
    runMutation(
      archiveMutation.mutateAsync(school.id),
      `"${school.name}" has been archived.`,
      'Failed to archive school'
    );

  const handleRestore = (school) =>
    runMutation(
      restoreMutation.mutateAsync(school.id),
      `"${school.name}" was restored — it stays suspended until you activate it.`,
      'Failed to restore school'
    );

  const handlePurge = (school) => {
    setSchoolToPurge(school);
    setIncludeArchived(true);
  };

  const headerActions = (
    <>
      <ExportCsvButton
        filename="schools"
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Organization', key: 'organization_name' },
          { header: 'EMIS Code', key: 'emis_code' },
          { header: 'Union Council', key: 'uc_name' },
          { header: 'Address', key: 'address' },
          {
            header: 'Status',
            accessor: (s) =>
              s.deleted_at ? 'Archived' : s.is_active ? 'Active' : 'Suspended',
          },
          { header: 'Students', key: 'student_count' },
          { header: 'Users', key: 'user_count' },
          { header: 'Classes', key: 'class_count' },
        ]}
        rows={schools}
      />
      {canCreate && (
        <Button type="primary" onClick={handleAdd}>
          + Add School
        </Button>
      )}
    </>
  );

  const filters = (
    <>
      <Input.Search
        allowClear
        aria-label="Search schools"
        placeholder="Search name, EMIS code or UC"
        className="w-full sm:!w-64"
        onSearch={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        onChange={(e) => {
          if (!e.target.value) {
            setSearch('');
            resetToFirstPage();
          }
        }}
      />
      <Segmented
        aria-label="Filter by status"
        value={statusFilter}
        onChange={(value) => {
          setStatusFilter(value);
          resetToFirstPage();
        }}
        options={[
          { label: 'All', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'inactive' },
        ]}
      />
      <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--muted-foreground)]">
        <Switch
          size="small"
          checked={includeArchived}
          onChange={(checked) => {
            setIncludeArchived(checked);
            resetToFirstPage();
          }}
        />
        Show archived
      </label>
    </>
  );

  return (
    <PageContainer>
      <PageHeader
        title="School Management"
        subtitle="Register schools and control tenant access across the system."
        actions={headerActions}
      />

      <SchoolSummaryCards {...summary} />

      {query.isError ? (
        <Alert
          type="error"
          showIcon
          title="Failed to load schools."
          description={
            query.error?.response?.data?.detail ||
            'You may not have permission to manage schools.'
          }
          action={
            <Button size="small" danger onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <ContentCard title="Schools" extra={filters} flush>
          <SchoolTable
            schools={schools}
            loading={query.isLoading || query.isFetching}
            pagination={paging.tableProps(meta)}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onPurge={handlePurge}
            showOrganization={isGlobal}
            canUpdate={canUpdate}
            canArchive={canArchive}
            canPurge={canPurge}
            togglingId={
              statusMutation.isPending ? statusMutation.variables?.id : null
            }
            archivingId={
              archiveMutation.isPending ? archiveMutation.variables : null
            }
          />
        </ContentCard>
      )}

      <SchoolFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSchoolToEdit(null);
        }}
        editData={schoolToEdit}
      />

      <PurgeSchoolModal
        open={!!schoolToPurge}
        school={schoolToPurge}
        onClose={() => setSchoolToPurge(null)}
      />
    </PageContainer>
  );
}
