import React, { useState } from 'react';
import { Alert, Button, Input, Select, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import {
  useDeleteTeacher,
  useTeacherSummary,
  useTeachers,
} from '../../hooks/useTeachers';
import { usePagination } from '../../hooks/usePagination';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { listAllTeachers } from '../../api/teachers';
import ExportCsvButton from '../../components/ExportCsvButton';
import {
  CheckCircleIcon,
  UserCheckIcon,
  UsersIcon,
} from '../../components/Icons';
import {
  ContentCard,
  PageContainer,
  PageHeader,
  StatCard,
  StatGrid,
} from '../../components/ui';
import TeacherTable from './components/TeacherTable';
import TeacherFormModal from './components/TeacherFormModal';
import TeacherViewModal from './components/TeacherViewModal';

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'On Leave', label: 'On Leave' },
  { value: 'Inactive', label: 'Inactive' },
];

const TEACHER_CSV_COLUMNS = [
  { header: 'Employee Code', key: 'employee_code' },
  { header: 'Name', key: 'name' },
  { header: 'Gender', key: 'gender' },
  { header: 'Email', key: 'email' },
  { header: 'Phone', key: 'phone' },
  { header: 'CNIC', key: 'cnic' },
  { header: 'Qualification', key: 'qualification' },
  { header: 'Specialization', key: 'specialization' },
  { header: 'Joining Date', key: 'joining_date' },
  {
    header: 'Class Teacher Of',
    accessor: (t) => (t.class_names || []).join('; '),
  },
  { header: 'Login', accessor: (t) => (t.has_login ? 'Yes' : 'No') },
  { header: 'Status', key: 'status' },
];

/**
 * Teachers module — staff profiles with optional login accounts. Teacher
 * sign-in accounts are created here, not in the Users module.
 */
export default function Teachers() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('teacher:create');
  const canUpdate = hasPermission('teacher:update');
  const canDelete = hasPermission('teacher:delete');

  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [toEdit, setToEdit] = useState(null);
  const [toView, setToView] = useState(null);

  const search = useDebouncedValue(searchText.trim(), 300) || undefined;
  const statusParam = status === 'all' ? undefined : status;
  const paging = usePagination({ resetKeys: [search, statusParam] });

  const teachersQuery = useTeachers({
    ...paging.params,
    search,
    status: statusParam,
  });
  const summaryQuery = useTeacherSummary();
  const deleteMutation = useDeleteTeacher();

  const summary = summaryQuery.data;
  const total = teachersQuery.data?.meta.total ?? 0;

  const openCreate = () => {
    setToEdit(null);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ message: 'Teacher deleted.' });
    } catch (err) {
      notification.error({
        message: 'Failed to delete teacher',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Teachers"
        subtitle="Manage teaching staff, their class assignments and login accounts."
        actions={
          <>
            <ExportCsvButton
              filename="teachers"
              columns={TEACHER_CSV_COLUMNS}
              rows={teachersQuery.data?.items ?? []}
              fetchRows={() => listAllTeachers({ search, status: statusParam })}
            />
            {canCreate && (
              <Button type="primary" onClick={openCreate}>
                + Add Teacher
              </Button>
            )}
          </>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          label="Total Teachers"
          value={summary?.total ?? 0}
          icon={<UsersIcon />}
          tone="primary"
          loading={summaryQuery.isLoading}
          hint={summary ? `${summary.with_login} with login access` : undefined}
        />
        <StatCard
          label="Active"
          value={summary?.active ?? 0}
          icon={<CheckCircleIcon />}
          tone="success"
          loading={summaryQuery.isLoading}
        />
        <StatCard
          label="Male"
          value={summary?.male ?? 0}
          icon={<UserCheckIcon />}
          tone="info"
          loading={summaryQuery.isLoading}
        />
        <StatCard
          label="Female"
          value={summary?.female ?? 0}
          icon={<UserCheckIcon />}
          tone="accent"
          loading={summaryQuery.isLoading}
        />
      </StatGrid>

      {teachersQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title="Failed to load teachers."
          description={teachersQuery.error?.response?.data?.detail}
          action={
            <Button size="small" danger onClick={() => teachersQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <ContentCard
          title="Teaching Staff"
          subtitle={`${total} teacher${total === 1 ? '' : 's'}`}
          flush
          extra={
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Select
                value={status}
                onChange={setStatus}
                options={STATUS_FILTERS}
                aria-label="Filter by status"
                className="w-full sm:w-[150px]"
              />
              <Input.Search
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search name, code, email, phone"
                aria-label="Search teachers"
                className="w-full sm:w-[280px]"
              />
            </div>
          }
        >
          <TeacherTable
            teachers={teachersQuery.data?.items ?? []}
            loading={teachersQuery.isFetching}
            pagination={paging.tableProps(teachersQuery.data?.meta)}
            onView={setToView}
            onEdit={(t) => {
              setToEdit(t);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
            canUpdate={canUpdate}
            canDelete={canDelete}
            deletingId={
              deleteMutation.isPending ? deleteMutation.variables : null
            }
          />
        </ContentCard>
      )}

      <TeacherFormModal
        open={formOpen}
        editData={toEdit}
        onClose={() => {
          setFormOpen(false);
          setToEdit(null);
        }}
      />
      <TeacherViewModal teacher={toView} onClose={() => setToView(null)} />
    </PageContainer>
  );
}
