import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Switch,
  notification,
} from 'antd';
import { useActiveSchool } from '../../../context/ActiveSchoolContext';
import {
  useCreateTeacher,
  useCreateTeacherLogin,
  useUpdateTeacher,
} from '../../../hooks/useTeachers';

const GENDER_OPTIONS = ['Male', 'Female'].map((v) => ({ value: v, label: v }));
const STATUS_OPTIONS = ['Active', 'Inactive', 'On Leave'].map((v) => ({
  value: v,
  label: v,
}));

/** Normalise FastAPI error payloads (string or 422 detail array) to text. */
const errorText = (err) => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join('; ');
  return detail || err?.message;
};

/**
 * Create / edit a teacher. On create (or for a teacher without a login) the
 * "Create login account" switch also provisions their sign-in account —
 * they must change the password on first sign-in.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   editData?: import('../../../api/teachers').TeacherRecord | null,
 * }} props
 */
export default function TeacherFormModal({ open, onClose, editData }) {
  const [form] = Form.useForm();
  // New teachers join the active school (top-bar switcher).
  const { activeSchoolId } = useActiveSchool();
  const isEdit = !!editData;
  const canAddLogin = !isEdit || !editData?.has_login;

  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const loginMutation = useCreateTeacherLogin();

  const createLogin = Form.useWatch('create_login', form);

  useEffect(() => {
    if (!open) return;
    if (editData) {
      form.setFieldsValue({
        ...editData,
        joining_date: editData.joining_date
          ? dayjs(editData.joining_date)
          : null,
        create_login: false,
        password: '',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'Active', create_login: false });
    }
  }, [open, editData, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const clean = (v) =>
      typeof v === 'string' ? v.trim() || null : (v ?? null);
    const profile = {
      employee_code: clean(values.employee_code),
      name: values.name.trim(),
      gender: values.gender ?? null,
      email: clean(values.email),
      phone: clean(values.phone),
      cnic: clean(values.cnic),
      qualification: clean(values.qualification),
      specialization: clean(values.specialization),
      joining_date: values.joining_date
        ? values.joining_date.format('YYYY-MM-DD')
        : null,
      status: values.status,
      address: clean(values.address),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData.id, payload: profile });
        if (values.create_login && canAddLogin) {
          await loginMutation.mutateAsync({
            id: editData.id,
            password: values.password,
          });
        }
        notification.success({ message: 'Teacher updated successfully.' });
      } else {
        await createMutation.mutateAsync({
          ...profile,
          ...(activeSchoolId != null ? { school_id: activeSchoolId } : {}),
          create_login: !!values.create_login,
          ...(values.create_login ? { password: values.password } : {}),
        });
        notification.success({ message: 'Teacher added successfully.' });
      }
      onClose();
    } catch (err) {
      notification.error({
        message: isEdit ? 'Failed to update teacher' : 'Failed to add teacher',
        description: errorText(err),
      });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Teacher' : 'Add Teacher'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Add Teacher'}
      confirmLoading={
        createMutation.isPending ||
        updateMutation.isPending ||
        loginMutation.isPending
      }
      width={720}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please enter a name',
                },
              ]}
            >
              <Input placeholder="e.g. Ayesha Khan" maxLength={150} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="employee_code" label="Employee Code">
              <Input placeholder="e.g. EMP-014" maxLength={50} allowClear />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="gender" label="Gender">
              <Select
                allowClear
                placeholder="Select"
                options={GENDER_OPTIONS}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="joining_date" label="Joining Date">
              <DatePicker className="w-full" format="DD MMM YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Enter a valid email' },
                {
                  required: !!createLogin,
                  message: 'Email is required for a login account',
                },
              ]}
            >
              <Input
                placeholder="teacher@school.edu"
                maxLength={150}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="03xx-xxxxxxx" maxLength={30} allowClear />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="qualification" label="Qualification">
              <Input
                placeholder="e.g. M.Sc Mathematics"
                maxLength={150}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="specialization" label="Specialization">
              <Input
                placeholder="e.g. Mathematics, Physics"
                maxLength={150}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="cnic" label="CNIC">
              <Input placeholder="xxxxx-xxxxxxx-x" maxLength={20} allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={16}>
            <Form.Item name="address" label="Address">
              <Input maxLength={255} allowClear />
            </Form.Item>
          </Col>
        </Row>

        {canAddLogin ? (
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={10}>
              <Form.Item
                name="create_login"
                label="Create login account"
                valuePropName="checked"
                tooltip="Lets the teacher sign in. They must change this password on first login."
              >
                <Switch aria-label="Create login account" />
              </Form.Item>
            </Col>
            {createLogin && (
              <Col xs={24} sm={14}>
                <Form.Item
                  name="password"
                  label="Temporary Password"
                  rules={[
                    { required: true, message: 'Please set a password' },
                    { min: 8, message: 'At least 8 characters' },
                  ]}
                >
                  <Input.Password
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        ) : (
          <p className="ds-caption m-0">
            This teacher already has a login account; name, email and status
            changes are applied to it automatically.
          </p>
        )}
      </Form>
    </Modal>
  );
}
