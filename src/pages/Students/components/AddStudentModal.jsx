import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  notification,
} from 'antd';
import dayjs from 'dayjs';
import { useCreateStudent, useUpdateStudent } from '../../../hooks/useStudents';
import { listAllClasses } from '../../../api/classes';
import { useActiveSchool } from '../../../context/ActiveSchoolContext';

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}) {
  const [form] = Form.useForm();
  const { activeSchoolId } = useActiveSchool();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  // Reset or fill form when modal opens or editData changes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Pre-fill form for Edit mode
        form.setFieldsValue({
          student_name: editData.name,
          father_name: editData.father_name,
          father_contact: editData.father_contact,
          address: editData.address,
          admission_number: editData.admission_number,
          class_id: editData.class_id,
          section: editData.section,
          gender: editData.gender,
          dob: editData.dob ? dayjs(editData.dob) : null,
          admission_date: editData.admission_date
            ? dayjs(editData.admission_date)
            : null,
          status: editData.status || 'Active',
        });
      } else {
        // Clear form for Add mode
        form.resetFields();
      }
    }
  }, [isOpen, editData, form]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await listAllClasses();
        setClasses(data);
      } catch (err) {
        console.error('Failed to load classes:', err);
      }
    };
    if (isOpen) fetchClasses();
  }, [isOpen]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // New students join the active school (top-bar switcher); the server
      // re-validates that the user may write to it.
      const schoolId = activeSchoolId;

      if (!schoolId) {
        notification.error({
          message: 'No school selected',
          description:
            'This account is not tied to a school. Create a school/class first, or pick a class that belongs to one.',
        });
        setLoading(false);
        return;
      }

      // Convert standard form inputs to backend spec
      const payload = {
        name: values.student_name,
        father_name: values.father_name,
        father_contact: values.father_contact || 'N/A',
        address: values.address || 'N/A',
        admission_number: values.admission_number,
        section: values.section,
        gender: values.gender,
        dob: values.dob ? values.dob.toISOString() : null,
        admission_date: values.admission_date
          ? values.admission_date.toISOString()
          : null,
        status: values.status || 'Active',
        school_id: schoolId,
        class_id: values.class_id, // Use selected class ID!
      };

      let result;
      if (editData?.id) {
        result = await updateMutation.mutateAsync({
          id: editData.id,
          payload,
        });
        notification.success({ message: 'Student updated successfully!' });
      } else {
        result = await createMutation.mutateAsync(payload);
        notification.success({ message: 'Student added successfully!' });
      }

      form.resetFields();
      onClose(); // Explicitly close modal
      onSuccess(result);
    } catch (err) {
      notification.error({
        message: editData?.id
          ? 'Failed to update student'
          : 'Failed to create student',
        description:
          err.response?.data?.detail || 'Check your network or constraints.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editData ? 'Edit Student Details' : 'Create New Student'}
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      width={720}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ status: 'Active' }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Full Name"
              name="student_name"
              rules={[
                { required: true, message: 'Please input student name!' },
              ]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Father's Name"
              name="father_name"
              rules={[
                { required: true, message: "Please input father's name!" },
              ]}
            >
              <Input placeholder="Enter father's name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Contact Number" name="father_contact">
              <Input placeholder="+1234567890" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Home Address" name="address">
              <Input placeholder="123 Main St" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Admission Number"
              name="admission_number"
              rules={[{ required: true, message: 'Required for uniqueness!' }]}
            >
              <Input placeholder="e.g. STU-2023-014" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Class"
              name="class_id"
              rules={[{ required: true, message: 'Class is required!' }]}
            >
              <Select placeholder="Select Class">
                {classes.map((cls) => (
                  <Select.Option key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Section" name="section">
              <Input placeholder="A, B, C..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Gender" name="gender">
              <Select placeholder="Select gender">
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Date of Birth" name="dob">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Admission Date" name="admission_date">
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Status" name="status">
              <Select>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Struck-off">Struck-off</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div className="ds-modal-footer">
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editData ? 'Update Student' : 'Submit'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
