import React, { useMemo, useState } from 'react';
import { Alert, Button, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { useSchools } from '../../hooks/useSchools';
import { useTheme } from '../../theme';
import UserTable from './components/UserTable';
import UserFormModal from './components/UserFormModal';
import ExportCsvButton from '../../components/ExportCsvButton';

/**
 * User administration — list, create, edit, delete users; assign role, school,
 * status (and superadmin flag for superusers).
 */
export default function Users() {
  const { toggleTheme } = useTheme();
  const { user, hasPermission } = useAuth();
  const isSuper = user?.is_superuser === true;
  const canCreate = isSuper || hasPermission('user:create');
  const canUpdate = isSuper || hasPermission('user:update');
  const canDelete = isSuper || hasPermission('user:delete');

  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const usersQuery = useUsers();
  const { data: schools = [] } = useSchools({ enabled: isSuper });
  const deleteMutation = useDeleteUser();

  const users = usersQuery.data ?? [];

  const schoolNameById = useMemo(() => {
    const map = new Map();
    for (const s of schools) map.set(s.id, s.name);
    return map;
  }, [schools]);

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

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            User Management
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage accounts, assign roles and schools, and control access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ExportCsvButton
            filename="users"
            columns={[
              { header: 'Name', key: 'name' },
              { header: 'Email', key: 'email' },
              { header: 'Username', key: 'username' },
              { header: 'Role', key: 'role_name' },
              {
                header: 'School',
                accessor: (u) =>
                  u.school_id == null
                    ? 'All (global)'
                    : (schoolNameById.get(u.school_id) ?? `#${u.school_id}`),
              },
              {
                header: 'Active',
                accessor: (u) => (u.is_active ? 'Yes' : 'No'),
              },
              {
                header: 'Superadmin',
                accessor: (u) => (u.is_superuser ? 'Yes' : 'No'),
              },
            ]}
            rows={users}
          />
          {canCreate && (
            <Button
              type="primary"
              onClick={handleAdd}
              className="btn-primary border-0"
            >
              + Add User
            </Button>
          )}
          <button
            onClick={toggleTheme}
            className="hidden sm:block border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-4 py-2 flex-shrink-0 rounded-md text-sm font-medium cursor-pointer hover:bg-[var(--muted)] transition-colors shadow-sm"
          >
            Switch Theme
          </button>
        </div>
      </div>

      {usersQuery.isError ? (
        <div className="px-2">
          <Alert
            type="error"
            showIcon
            message="Failed to load users."
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
        </div>
      ) : (
        <div className="px-2">
          <UserTable
            users={users}
            loading={usersQuery.isLoading}
            schoolNameById={schoolNameById}
            currentUserId={user?.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canUpdate={canUpdate}
            canDelete={canDelete}
            deletingId={
              deleteMutation.isPending ? deleteMutation.variables : null
            }
          />
        </div>
      )}

      <UserFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUserToEdit(null);
        }}
        editData={userToEdit}
      />
    </div>
  );
}
