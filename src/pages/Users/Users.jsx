import React, { useState } from 'react';
import { Alert, Button, Input, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { listUsers } from '../../api/users';
import { MAX_PAGE_SIZE } from '../../api/pagination';
import { usePagination } from '../../hooks/usePagination';
import UserTable, { levelLabel } from './components/UserTable';
import UserFormModal from './components/UserFormModal';
import ExportCsvButton from '../../components/ExportCsvButton';
import { PageContainer, PageHeader } from '../../components/ui';

/**
 * User administration — list, create, edit, delete users. Which accounts a
 * user may create depends on their level (see UserFormModal); the list is
 * scoped server-side (Global: all, Super Admin: their organization, school
 * admin: their school).
 */
export default function Users() {
  const { user, hasPermission } = useAuth();
  const canCreate = hasPermission('user:create');
  const canUpdate = hasPermission('user:update');
  const canDelete = hasPermission('user:delete');

  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [searchText, setSearchText] = useState('');
  const search = useDebouncedValue(searchText.trim(), 300) || undefined;

  const paging = usePagination({ resetKeys: [search] });
  const usersQuery = useUsers({ search, ...paging.params });
  const deleteMutation = useDeleteUser();

  const users = usersQuery.data?.items ?? [];

  // CSV export covers every user matching the search, not just this page.
  const fetchAllForExport = async () =>
    (await listUsers({ search, page: 1, page_size: MAX_PAGE_SIZE })).items;

  const handleAdd = () => {
    setUserToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (u) => {
    setUserToEdit(u);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ message: 'User deleted successfully.' });
    } catch (err) {
      notification.error({
        message: 'Failed to delete user',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const headerActions = (
    <>
      <ExportCsvButton
        filename="users"
        columns={[
          { header: 'Name', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'Username', key: 'username' },
          { header: 'Level', accessor: (u) => levelLabel(u.level) },
          { header: 'Role', key: 'role_name' },
          { header: 'Organization', key: 'organization_name' },
          { header: 'School', key: 'school_name' },
          {
            header: 'Active',
            accessor: (u) => (u.is_active ? 'Yes' : 'No'),
          },
        ]}
        fetchRows={fetchAllForExport}
      />
      {canCreate && (
        <Button type="primary" onClick={handleAdd}>
          + Add User
        </Button>
      )}
    </>
  );

  return (
    <PageContainer>
      <PageHeader
        title="User Management"
        subtitle="Manage accounts, assign roles and schools, and control access."
        actions={headerActions}
      />

      {usersQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title="Failed to load users."
          description={
            usersQuery.error?.response?.data?.detail ||
            'You may not have permission to view users.'
          }
          action={
            <Button size="small" danger onClick={() => usersQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <UserTable
          users={users}
          total={usersQuery.data?.meta.total ?? 0}
          loading={usersQuery.isFetching}
          pagination={paging.tableProps(usersQuery.data?.meta)}
          toolbar={
            <Input.Search
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search name, email or username"
              aria-label="Search users"
              className="w-full sm:w-[280px]"
            />
          }
          currentUserId={user?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canUpdate={canUpdate}
          canDelete={canDelete}
          deletingId={
            deleteMutation.isPending ? deleteMutation.variables : null
          }
        />
      )}

      <UserFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUserToEdit(null);
        }}
        editData={userToEdit}
      />
    </PageContainer>
  );
}
