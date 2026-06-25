import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, Tabs, notification } from 'antd';
import {
  usePermissionsCatalog,
  useModulesCatalog,
} from '../../../hooks/useAdminCatalog';
import { useCreateRole, useUpdateRole } from '../../../hooks/useRoles';
import PermissionAssignment from './PermissionAssignment';
import ModuleAssignment from './ModuleAssignment';

/**
 * Create / edit a role with its UBAC permissions and RBAC module access.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   editData?: import('../../../api/admin').RoleRecord | null,
 * }} props
 */
export default function RoleFormModal({ open, onClose, editData }) {
  const [form] = Form.useForm();
  const isEdit = !!editData;

  const [permissionIds, setPermissionIds] = useState([]);
  const [moduleIds, setModuleIds] = useState([]);

  const { data: permissions = [] } = usePermissionsCatalog({ enabled: open });
  const { data: modules = [] } = useModulesCatalog({ enabled: open });
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  useEffect(() => {
    if (!open) return;
    if (editData) {
      form.setFieldsValue({
        role_name: editData.role_name,
        description: editData.description ?? '',
      });
      setPermissionIds((editData.permissions ?? []).map((p) => p.id));
      setModuleIds((editData.modules ?? []).map((m) => m.id));
    } else {
      form.resetFields();
      setPermissionIds([]);
      setModuleIds([]);
    }
  }, [open, editData, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const payload = {
      role_name: values.role_name.trim(),
      description: values.description?.trim() || null,
      permission_ids: permissionIds,
      module_ids: moduleIds,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData.id, payload });
        notification.success({ message: 'Role updated successfully.' });
      } else {
        await createMutation.mutateAsync(payload);
        notification.success({ message: 'Role created successfully.' });
      }
      onClose();
    } catch (err) {
      notification.error({
        message: isEdit ? 'Failed to update role' : 'Failed to create role',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const tabs = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <Form form={form} layout="vertical" className="pt-2">
          <Form.Item
            name="role_name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter a role name' }]}
          >
            <Input placeholder="e.g. coordinator" maxLength={100} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={2}
              maxLength={255}
              placeholder="What is this role for?"
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'permissions',
      label: `Permissions (${permissionIds.length})`,
      children: (
        <PermissionAssignment
          permissions={permissions}
          value={permissionIds}
          onChange={setPermissionIds}
        />
      ),
    },
    {
      key: 'modules',
      label: `Modules (${moduleIds.length})`,
      children: (
        <div className="pt-2">
          <ModuleAssignment
            modules={modules}
            value={moduleIds}
            onChange={setModuleIds}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={isEdit ? `Edit Role: ${editData.role_name}` : 'Add Role'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      width={640}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Tabs defaultActiveKey="details" items={tabs} />
    </Modal>
  );
}
