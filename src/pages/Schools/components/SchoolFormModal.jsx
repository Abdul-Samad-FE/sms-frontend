import React, { useEffect } from 'react';
import { Col, Form, Input, Modal, Row, Select, notification } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { useCreateSchool, useUpdateSchool } from '../../../hooks/useSchools';
import { useOrganizationOptions } from '../../../hooks/useOrganizations';

/**
 * Create / edit a tenant. Status is deliberately absent — activating and
 * suspending is a separate, audited action on the table row, so it can never
 * be changed by accident while editing an address.
 *
 * Global Admins pick the owning organization; a Super Admin's new schools
 * always join their own organization.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   editData?: import('../../../api/schools').SchoolRecord | null,
 *   onSuccess?: () => void,
 * }} props
 */
export default function SchoolFormModal({
  open,
  onClose,
  editData,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const isEdit = !!editData;
  const { isGlobal, organization } = useAuth();
  const { data: organizations = [] } = useOrganizationOptions({
    enabled: open && isGlobal && !isEdit,
  });

  const createMutation = useCreateSchool();
  const updateMutation = useUpdateSchool();

  useEffect(() => {
    if (!open) return;
    if (editData) {
      form.setFieldsValue({
        emis_code: editData.emis_code,
        name: editData.name,
        uc_name: editData.uc_name,
        address: editData.address ?? '',
      });
    } else {
      form.resetFields();
    }
  }, [open, editData, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // validation errors are shown inline
    }

    const payload = {
      emis_code: values.emis_code.trim(),
      name: values.name.trim(),
      uc_name: values.uc_name.trim(),
      address: values.address?.trim() || null,
    };
    if (!isEdit) {
      payload.organization_id = isGlobal
        ? values.organization_id
        : (organization?.id ?? null);
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData.id, payload });
        notification.success({ message: 'School updated successfully.' });
      } else {
        await createMutation.mutateAsync(payload);
        notification.success({ message: 'School created successfully.' });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      notification.error({
        message: isEdit ? 'Failed to update school' : 'Failed to create school',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit School' : 'Add School'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        {isGlobal && !isEdit && (
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
              placeholder="Select the owning organization"
              options={organizations.map((o) => ({
                value: o.id,
                label: o.name,
              }))}
            />
          </Form.Item>
        )}
        <Form.Item
          name="name"
          label="School Name"
          rules={[{ required: true, message: 'Please enter the school name' }]}
        >
          <Input placeholder="e.g. Green Valley High School" maxLength={150} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="emis_code"
              label="EMIS Code"
              tooltip="Unique tenant identifier — must not clash with another school"
              rules={[
                { required: true, message: 'Please enter the EMIS code' },
              ]}
            >
              <Input placeholder="e.g. DEMO-A" maxLength={50} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="uc_name"
              label="Union Council"
              rules={[
                { required: true, message: 'Please enter the union council' },
              ]}
            >
              <Input placeholder="e.g. UC-12 Model Town" maxLength={150} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input.TextArea
            placeholder="Street, city"
            maxLength={255}
            rows={2}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
