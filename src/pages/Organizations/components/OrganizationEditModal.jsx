import React, { useEffect } from 'react';
import { Form, Input, Modal, notification } from 'antd';
import { useUpdateOrganization } from '../../../hooks/useOrganizations';
import { apiError, nameRules } from './formRules';

/**
 * Rename an organization (Global Admin, organization:update).
 *
 * @param {{ open: boolean, onClose: () => void,
 *   organization?: import('../../../api/organizations').OrganizationRecord|null }} props
 */
export default function OrganizationEditModal({ open, onClose, organization }) {
  const [form] = Form.useForm();
  const mutation = useUpdateOrganization();

  useEffect(() => {
    if (open) form.setFieldsValue({ name: organization?.name ?? '' });
  }, [open, organization, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      await mutation.mutateAsync({
        id: organization.id,
        payload: { name: values.name.trim() },
      });
      notification.success({ message: 'Organization updated.' });
      onClose();
    } catch (err) {
      notification.error({
        message: 'Failed to update organization',
        description: apiError(err),
      });
    }
  };

  return (
    <Modal
      title="Edit Organization"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={mutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Organization name"
          rules={nameRules('the organization name')}
          className="!mb-0"
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
