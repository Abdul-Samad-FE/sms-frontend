import React, { useEffect } from 'react';
import { Form, Input, Modal, Select, Switch, notification } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { useRoles } from '../../../hooks/useRoles';
import { useSchools } from '../../../hooks/useSchools';
import { useCreateUser, useUpdateUser } from '../../../hooks/useUsers';

/**
 * Create / edit a user. Superadmins may set the school, superuser flag, and
 * any role; school-bound admins create users inside their own school only
 * (enforced server-side).
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   editData?: import('../../../api/users').UserRecord | null,
 * }} props
 */
export default function UserFormModal({ open, onClose, editData }) {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser === true;
  const isEdit = !!editData;

  const { data: roles = [] } = useRoles({ enabled: open });
  const { data: schools = [] } = useSchools({ enabled: open && isSuperuser });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  useEffect(() => {
    if (!open) return;
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        email: editData.email,
        username: editData.username ?? '',
        role_id: editData.role_id ?? undefined,
        school_id: editData.school_id ?? undefined,
        is_active: editData.is_active,
        is_superuser: editData.is_superuser,
        password: '',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true, is_superuser: false });
    }
  }, [open, editData, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    // Build payload; only include password when provided.
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      username: values.username?.trim() || null,
      role_id: values.role_id ?? null,
      is_active: values.is_active,
    };
    if (isSuperuser) {
      payload.school_id = values.school_id ?? null;
      payload.is_superuser = values.is_superuser ?? false;
    }
    if (values.password) {
      payload.password = values.password;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData.id, payload });
        notification.success({ message: 'User updated successfully.' });
      } else {
        await createMutation.mutateAsync(payload);
        notification.success({ message: 'User created successfully.' });
      }
      onClose();
    } catch (err) {
      notification.error({
        message: isEdit ? 'Failed to update user' : 'Failed to create user',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit User' : 'Add User'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="e.g. Jane Doe" maxLength={150} />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter an email' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input placeholder="jane@example.com" maxLength={150} />
        </Form.Item>

        <Form.Item name="username" label="Username" tooltip="Optional">
          <Input placeholder="optional" maxLength={150} allowClear />
        </Form.Item>

        <Form.Item
          name="password"
          label={isEdit ? 'New Password' : 'Password'}
          tooltip={
            isEdit ? 'Leave blank to keep the current password' : undefined
          }
          rules={
            isEdit
              ? [{ min: 8, message: 'At least 8 characters' }]
              : [
                  { required: true, message: 'Please set a password' },
                  { min: 8, message: 'At least 8 characters' },
                ]
          }
        >
          <Input.Password
            placeholder={
              isEdit ? 'Leave blank to keep current' : 'Min 8 characters'
            }
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item name="role_id" label="Role">
          <Select
            allowClear
            placeholder="Select a role"
            options={roles.map((r) => ({ value: r.id, label: r.role_name }))}
          />
        </Form.Item>

        {isSuperuser && (
          <Form.Item
            name="school_id"
            label="School"
            tooltip="Leave blank for a cross-tenant (superadmin) user"
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select a school"
              options={schools.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
        )}

        <div className="flex items-center gap-8">
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          {isSuperuser && (
            <Form.Item
              name="is_superuser"
              label="Superadmin"
              valuePropName="checked"
              tooltip="Grants cross-tenant access and bypasses permission checks"
            >
              <Switch />
            </Form.Item>
          )}
        </div>
      </Form>
    </Modal>
  );
}
