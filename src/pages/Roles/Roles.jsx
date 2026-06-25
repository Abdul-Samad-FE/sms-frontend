import React, { useState } from 'react';
import { Alert, Button, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useRoles, useDeleteRole } from '../../hooks/useRoles';
import { useTheme } from '../../theme';
import RoleTable from './components/RoleTable';
import RoleFormModal from './components/RoleFormModal';

/**
 * Role administration — view roles with their permissions/modules. Creating,
 * editing and deleting roles is restricted to superadmins (enforced server-side).
 */
export default function Roles() {
  const { toggleTheme } = useTheme();
  const { user } = useAuth();
  const canManage = user?.is_superuser === true;

  const [modalOpen, setModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);

  const rolesQuery = useRoles();
  const deleteMutation = useDeleteRole();

  const roles = rolesQuery.data ?? [];

  const handleAdd = () => {
    setRoleToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (role) => {
    setRoleToEdit(role);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ message: 'Role deleted successfully.' });
    } catch (err) {
      notification.error({
        message: 'Failed to delete role',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Role &amp; Permission Management
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Define roles, assign permissions (UBAC) and module access (RBAC).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {canManage && (
            <Button type="primary" onClick={handleAdd} className="btn-primary border-0">
              + Add Role
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

      {!canManage && (
        <div className="px-2">
          <Alert
            type="info"
            showIcon
            message="Role management is read-only for your account. Only superadmins can create, edit, or delete roles."
          />
        </div>
      )}

      {rolesQuery.isError ? (
        <div className="px-2">
          <Alert
            type="error"
            showIcon
            message="Failed to load roles."
            description={
              rolesQuery.error?.response?.data?.detail ||
              'You may not have permission to view roles.'
            }
            action={
              <Button size="small" danger onClick={() => rolesQuery.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : (
        <div className="px-2">
          <RoleTable
            roles={roles}
            loading={rolesQuery.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canManage={canManage}
            deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
          />
        </div>
      )}

      <RoleFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setRoleToEdit(null);
        }}
        editData={roleToEdit}
      />
    </div>
  );
}
