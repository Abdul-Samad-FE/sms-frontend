import React, { useEffect } from 'react';
import { Col, Form, Input, Modal, Row, notification } from 'antd';
import { useAddOrganizationOwner } from '../../../hooks/useOrganizations';
import {
  apiError,
  confirmRules,
  emailRules,
  nameRules,
  passwordRules,
} from './formRules';

/**
 * Add a co-owner (Super Admin) to an organization. Only the Global Admin can
 * do this — Super Admins never create other Super Admins.
 *
 * @param {{ open: boolean, onClose: () => void, organizationId: number,
 *   organizationName?: string }} props
 */
export default function AddOwnerModal({
  open,
  onClose,
  organizationId,
  organizationName,
}) {
  const [form] = Form.useForm();
  const mutation = useAddOrganizationOwner();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      await mutation.mutateAsync({
        id: organizationId,
        payload: {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        },
      });
      notification.success({
        message: 'Owner added',
        description: 'They must change their password on first sign-in.',
      });
      onClose();
    } catch (err) {
      notification.error({
        message: 'Failed to add owner',
        description: apiError(err),
      });
    }
  };

  return (
    <Modal
      title={organizationName ? `Add Owner · ${organizationName}` : 'Add Owner'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Add Owner"
      confirmLoading={mutation.isPending}
      width={640}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="name" label="Full name" rules={nameRules()}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label="Email" rules={emailRules}>
              <Input placeholder="owner@example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="password"
              label="Temporary password"
              rules={passwordRules}
              className="sm:!mb-0"
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="confirm"
              label="Confirm password"
              dependencies={['password']}
              rules={confirmRules('password')}
              className="!mb-0"
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
