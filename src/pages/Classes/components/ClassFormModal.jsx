import React, { useEffect } from 'react';
import { Form, Input, Modal, Select, notification } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { useSchools } from '../../../hooks/useSchools';
import { useCreateClass, useUpdateClass } from '../../../hooks/useClasses';

/**
 * Create / edit a class. School selection is shown only to superadmins on
 * create — school-bound users have their school enforced server-side.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   editData?: import('../../../api/classes').ClassRecord | null,
 *   onSuccess?: () => void,
 * }} props
 */
export default function ClassFormModal({ open, onClose, editData, onSuccess }) {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser === true;
  const isEdit = !!editData;

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();

  // Superadmins choose a school when creating (they aren't bound to one).
  const { data: schools = [] } = useSchools({
    enabled: isSuperuser && !isEdit,
  });

  useEffect(() => {
    if (!open) return;
    if (editData) {
      form.setFieldsValue({
        class_name: editData.class_name,
        section: editData.section ?? '',
        school_id: editData.school_id,
      });
    } else {
      form.resetFields();
    }
  }, [open, editData, form]);

  const resolveSchoolId = (values) => {
    if (!isSuperuser) return user?.school_id ?? null;
    return values.school_id ?? editData?.school_id ?? null;
  };

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // validation errors are shown inline
    }

    const section = values.section?.trim() || null;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: editData.id,
          payload: { class_name: values.class_name.trim(), section },
        });
        notification.success({ message: 'Class updated successfully.' });
      } else {
        const schoolId = resolveSchoolId(values);
        if (schoolId == null) {
          notification.error({
            message: 'A school is required to create a class.',
          });
          return;
        }
        await createMutation.mutateAsync({
          school_id: schoolId,
          class_name: values.class_name.trim(),
          section,
        });
        notification.success({ message: 'Class created successfully.' });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      notification.error({
        message: isEdit ? 'Failed to update class' : 'Failed to create class',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Class' : 'Add Class'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" className="pt-2">
        {isSuperuser && !isEdit && (
          <Form.Item
            name="school_id"
            label="School"
            rules={[{ required: true, message: 'Please select a school' }]}
          >
            <Select
              placeholder="Select a school"
              showSearch
              optionFilterProp="label"
              options={schools.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
        )}

        <Form.Item
          name="class_name"
          label="Class Name"
          rules={[{ required: true, message: 'Please enter a class name' }]}
        >
          <Input placeholder="e.g. Grade 10" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="section"
          label="Section"
          tooltip="Optional — e.g. A, B, Blue"
        >
          <Input placeholder="e.g. A" maxLength={50} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
}
