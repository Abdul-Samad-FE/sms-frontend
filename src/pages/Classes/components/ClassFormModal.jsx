import React, { useEffect } from 'react';
import { Col, Form, Input, Modal, Row, Select, notification } from 'antd';
import { useActiveSchool } from '../../../context/ActiveSchoolContext';
import { useCreateClass, useUpdateClass } from '../../../hooks/useClasses';
import { useAllTeachers } from '../../../hooks/useTeachers';

/**
 * Create / edit a class in the active school (top-bar switcher); the server
 * re-validates that the user may write to that school.
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
  const { activeSchoolId } = useActiveSchool();
  const isEdit = !!editData;

  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();

  // Class teacher options: active teachers of the active school.
  const { data: teachers = [], isLoading: teachersLoading } = useAllTeachers(
    { status: 'Active' },
    { enabled: open }
  );
  const teacherOptions = teachers.map((t) => ({
    value: t.id,
    label: t.employee_code ? `${t.name} (${t.employee_code})` : t.name,
  }));
  // Keep the current class teacher selectable even if no longer Active.
  if (
    editData?.class_teacher_id &&
    !teacherOptions.some((o) => o.value === editData.class_teacher_id)
  ) {
    teacherOptions.unshift({
      value: editData.class_teacher_id,
      label: editData.class_teacher_name ?? `#${editData.class_teacher_id}`,
    });
  }

  useEffect(() => {
    if (!open) return;
    if (editData) {
      form.setFieldsValue({
        class_name: editData.class_name,
        section: editData.section ?? '',
        class_teacher_id: editData.class_teacher_id ?? undefined,
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

    const section = values.section?.trim() || null;
    const classTeacherId = values.class_teacher_id ?? null;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: editData.id,
          payload: {
            class_name: values.class_name.trim(),
            section,
            class_teacher_id: classTeacherId,
          },
        });
        notification.success({ message: 'Class updated successfully.' });
      } else {
        await createMutation.mutateAsync({
          school_id: activeSchoolId,
          class_name: values.class_name.trim(),
          section,
          class_teacher_id: classTeacherId,
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
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={14}>
            <Form.Item
              name="class_name"
              label="Class Name"
              rules={[{ required: true, message: 'Please enter a class name' }]}
            >
              <Input placeholder="e.g. Grade 10" maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item
              name="section"
              label="Section"
              tooltip="Optional — e.g. A, B, Blue"
            >
              <Input placeholder="e.g. A" maxLength={50} allowClear />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="class_teacher_id"
          label="Class Teacher"
          tooltip="The teacher responsible for this class. Manage teachers in the Teachers module."
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select a teacher"
            loading={teachersLoading}
            options={teacherOptions}
            notFoundContent="No active teachers in this school"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
