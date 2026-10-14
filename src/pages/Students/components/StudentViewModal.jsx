import React from 'react';
import { Modal, Descriptions, Divider } from 'antd';
import dayjs from 'dayjs';
import { StatusTag } from '../../../components/ui';

export default function StudentViewModal({ isOpen, onClose, student }) {
  if (!student) return null;

  const formatDate = (date) =>
    date ? dayjs(date).format('MMMM DD, YYYY') : 'N/A';

  return (
    <Modal
      title="Student Profile"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--status-on-solid)] text-xl font-semibold"
          aria-hidden="true"
        >
          {student.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h2 className="ds-section-title">{student.name}</h2>
          <p className="ds-section-subtitle">
            {student.admission_number} · {student.class_name || 'No Class'}
          </p>
        </div>
        <div className="ml-auto">
          <StatusTag>{student.status}</StatusTag>
        </div>
      </div>

      <Divider titlePlacement="start" className="!mt-6 !mb-4">
        <span className="ds-label">Academic Information</span>
      </Divider>
      <Descriptions column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Admission No">
          {student.admission_number}
        </Descriptions.Item>
        <Descriptions.Item label="Enroll No">
          {student.enroll_no || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Class">
          {student.class_name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Section">
          {student.section || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Admission Date">
          {formatDate(student.admission_date)}
        </Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="start" className="!mt-6 !mb-4">
        <span className="ds-label">Personal Information</span>
      </Divider>
      <Descriptions column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Father's Name">
          {student.father_name}
        </Descriptions.Item>
        <Descriptions.Item label="Father's Contact">
          {student.father_contact}
        </Descriptions.Item>
        <Descriptions.Item label="Gender">
          {student.gender || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Date of Birth">
          {formatDate(student.dob)}
        </Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>
          {student.address}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
