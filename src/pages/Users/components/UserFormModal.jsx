import React, { useEffect, useMemo } from 'react';
import {
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Switch,
  notification,
} from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useActiveSchool } from '../../../context/ActiveSchoolContext';
import { useRoles } from '../../../hooks/useRoles';
import { useSchoolOptions } from '../../../hooks/useSchools';
import { useOrganizationOptions } from '../../../hooks/useOrganizations';
import { useCreateUser, useUpdateUser } from '../../../hooks/useUsers';

/** Roles decided by the account level — never offered as normal choices. */
const LEVEL_ROLES = ['global_admin', 'super_admin'];
/** Teacher logins are owned by the Teachers module. */
const TEACHER_ROLE = 'teacher';

const ACCOUNT_SUPER_ADMIN = 'super_admin';
const ACCOUNT_SCHOOL_ADMIN = 'school_admin';

const roleName = (r) => String(r?.role_name ?? '').toLowerCase();

/**
 * Create / edit a user, following the account-creation matrix:
 *
 * - Global Admin: creates Super Admins (school owners, per organization) and
 *   School Admins (role "admin", per school). Never another Global Admin.
 * - Super Admin: creates school-level accounts (incl. admins) for the
 *   schools of their organization.
 * - School Admin: creates school-level accounts in their own school, except
 *   other admins.
 *
 * The server enforces the same rules; this form only offers valid choices.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   editData?: import('../../../api/users').UserRecord | null,
 * }} props
 */
export default function UserFormModal({ open, onClose, editData }) {
  const [form] = Form.useForm();
  const { isGlobal, isSuperAdmin, schools: mySchools } = useAuth();
  const { activeSchoolId } = useActiveSchool();
  const isEdit = !!editData;

  const accountType = Form.useWatch('account_type', form);
  const organizationId = Form.useWatch('organization_id', form);

  const { data: roles = [] } = useRoles({ enabled: open });
  const { data: organizations = [] } = useOrganizationOptions({
    enabled: open && isGlobal && !isEdit,
  });
  const { data: orgSchools = [], isFetching: orgSchoolsLoading } =
    useSchoolOptions(
      { organization_id: organizationId },
      {
        enabled:
          open &&
          isGlobal &&
          !isEdit &&
          accountType === ACCOUNT_SCHOOL_ADMIN &&
          organizationId != null,
      }
    );
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const adminRole = useMemo(
    () => roles.find((r) => roleName(r) === 'admin'),
    [roles]
  );

  // Role choices for school-level accounts this actor may manage.
  const roleOptions = useMemo(
    () =>
      roles
        .filter((r) => !LEVEL_ROLES.includes(roleName(r)))
        .filter((r) => isEdit || roleName(r) !== TEACHER_ROLE)
        // School admins can't create / promote other admins.
        .filter((r) => isGlobal || isSuperAdmin || roleName(r) !== 'admin')
        .map((r) => ({ value: r.id, label: r.role_name })),
    [roles, isEdit, isGlobal, isSuperAdmin]
  );

  const editingLevel = editData?.level ?? 'school';
  // Global Admins manage owners/admins, whose role is fixed by their level.
  const showRoleSelect = isEdit
    ? editingLevel === 'school' && !isGlobal
    : !isGlobal;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        email: editData.email,
        username: editData.username ?? '',
        role_id: editData.role_id ?? undefined,
        is_active: editData.is_active,
        password: '',
      });
    } else {
      form.setFieldsValue({
        is_active: true,
        account_type: isGlobal ? ACCOUNT_SUPER_ADMIN : undefined,
        school_id: isSuperAdmin ? (activeSchoolId ?? undefined) : undefined,
      });
    }
  }, [open, editData, form, isGlobal, isSuperAdmin, activeSchoolId]);

  const buildCreatePayload = (values, base) => {
    if (isGlobal && values.account_type === ACCOUNT_SUPER_ADMIN) {
      return {
        ...base,
        level: 'super_admin',
        organization_id: values.organization_id,
      };
    }
    if (isGlobal) {
      return {
        ...base,
        level: 'school',
        organization_id: values.organization_id,
        school_id: values.school_id,
        role_id: adminRole?.id ?? null,
      };
    }
    return {
      ...base,
      level: 'school',
      role_id: values.role_id ?? null,
      // Super Admins pick one of their schools; school admins are pinned
      // to their own school server-side.
      ...(isSuperAdmin ? { school_id: values.school_id } : {}),
    };
  };

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const base = {
      name: values.name.trim(),
      email: values.email.trim(),
      username: values.username?.trim() || null,
      is_active: values.is_active,
      ...(values.password ? { password: values.password } : {}),
    };

    try {
      if (isEdit) {
        const payload = showRoleSelect
          ? { ...base, role_id: values.role_id ?? null }
          : base;
        await updateMutation.mutateAsync({ id: editData.id, payload });
        notification.success({ message: 'User updated successfully.' });
      } else {
        if (isGlobal && values.account_type === ACCOUNT_SCHOOL_ADMIN) {
          if (!adminRole) {
            notification.error({ message: 'The "admin" role is missing.' });
            return;
          }
        }
        await createMutation.mutateAsync(buildCreatePayload(values, base));
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

  const organizationOptions = organizations.map((o) => ({
    value: o.id,
    label: o.is_active ? o.name : `${o.name} (suspended)`,
  }));

  return (
    <Modal
      title={isEdit ? 'Edit User' : 'Add User'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width={640}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        {/* Global Admin: what kind of account (level) is being created. */}
        {isGlobal && !isEdit && (
          <Form.Item
            name="account_type"
            label="Account type"
            rules={[{ required: true }]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { value: ACCOUNT_SUPER_ADMIN, label: 'Super Admin (owner)' },
                { value: ACCOUNT_SCHOOL_ADMIN, label: 'School Admin' },
              ]}
              onChange={() =>
                form.setFieldsValue({
                  organization_id: undefined,
                  school_id: undefined,
                })
              }
            />
          </Form.Item>
        )}

        {isGlobal && !isEdit && (
          <Row gutter={16}>
            <Col xs={24} sm={accountType === ACCOUNT_SCHOOL_ADMIN ? 12 : 24}>
              <Form.Item
                name="organization_id"
                label="Organization"
                rules={[
                  { required: true, message: 'Please select an organization' },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select an organization"
                  options={organizationOptions}
                  onChange={() => form.setFieldsValue({ school_id: undefined })}
                />
              </Form.Item>
            </Col>
            {accountType === ACCOUNT_SCHOOL_ADMIN && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="school_id"
                  label="School"
                  rules={[
                    { required: true, message: 'Please select a school' },
                  ]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder={
                      organizationId == null
                        ? 'Select an organization first'
                        : 'Select a school'
                    }
                    disabled={organizationId == null}
                    loading={orgSchoolsLoading}
                    options={orgSchools
                      .filter(
                        (s) =>
                          !s.deleted_at &&
                          (s.organization_id == null ||
                            s.organization_id === organizationId)
                      )
                      .map((s) => ({ value: s.id, label: s.name }))}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        )}

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter a name' }]}
            >
              <Input placeholder="e.g. Jane Doe" maxLength={150} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="username" label="Username">
              <Input placeholder="Optional" maxLength={150} allowClear />
            </Form.Item>
          </Col>
        </Row>

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

        <Form.Item
          name="password"
          label={isEdit ? 'New Password' : 'Password'}
          tooltip={
            isEdit
              ? 'Leave blank to keep the current password'
              : 'The user must change it on first sign-in'
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

        <Row gutter={16}>
          {/* Super Admin: which of their schools the account belongs to. */}
          {isSuperAdmin && !isEdit && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="school_id"
                label="School"
                rules={[{ required: true, message: 'Please select a school' }]}
              >
                <Select
                  placeholder="Select a school"
                  options={mySchools.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </Form.Item>
            </Col>
          )}
          {showRoleSelect && (
            <Col xs={24} sm={isSuperAdmin && !isEdit ? 12 : 24}>
              <Form.Item
                name="role_id"
                label="Role"
                rules={[{ required: true, message: 'Please select a role' }]}
                extra={
                  isEdit ? undefined : (
                    <span>
                      Teacher accounts are created from the{' '}
                      <Link to="/teachers" onClick={onClose}>
                        Teachers module
                      </Link>
                      .
                    </span>
                  )
                }
              >
                <Select placeholder="Select a role" options={roleOptions} />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item
          name="is_active"
          label="Active"
          valuePropName="checked"
          className="!mb-0"
        >
          <Switch aria-label="Active" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
