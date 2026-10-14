import React, { useState } from 'react';
import { Alert, Button, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useRolesPage, useDeleteRole } from '../../hooks/useRoles';
import { usePagination } from '../../hooks/usePagination';
import RoleTable from './components/RoleTable';
import RoleFormModal from './components/RoleFormModal';
import { PageContainer, PageHeader } from '../../components/ui';

/**
 * Role administration — view roles with their permissions/modules. Creating,
 * editing and deleting roles is a platform right (`role:manage`, Global Admin).
 */
export default function Roles() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('role:manage');

  const [modalOpen, setModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);

  const paging = usePagination();
  const rolesQuery = useRolesPage(paging.params);
  const deleteMutation = useDeleteRole();

  const roles = rolesQuery.data?.items ?? [];

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
    <PageContainer>
      <PageHeader
        title="Role & Permission Management"
        subtitle="Define roles, assign permissions (UBAC) and module access (RBAC)."
        actions={
          canManage && (
            <Button type="primary" onClick={handleAdd}>
              + Add Role
            </Button>
          )
        }
      />

      {!canManage && (
        <Alert
          type="info"
          showIcon
          title="Role management is read-only for your account. Only superadmins can create, edit, or delete roles."
        />
      )}

      {rolesQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title="Failed to load roles."
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
      ) : (
        <RoleTable
          roles={roles}
          loading={rolesQuery.isFetching}
          pagination={paging.tableProps(rolesQuery.data?.meta)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canManage={canManage}
          deletingId={
            deleteMutation.isPending ? deleteMutation.variables : null
          }
        />
      )}

      <RoleFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setRoleToEdit(null);
        }}
        editData={roleToEdit}
      />
    </PageContainer>
  );
}
