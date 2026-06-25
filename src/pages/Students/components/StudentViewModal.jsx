import React from 'react';
import { Modal, Descriptions, Tag, Divider } from 'antd';
import dayjs from 'dayjs';

export default function StudentViewModal({ isOpen, onClose, student }) {
  if (!student) return null;

  const formatDate = (date) => date ? dayjs(date).format('MMMM DD, YYYY') : 'N/A';

  return (
    <Modal
      title="Student Detailed Profile"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={700}
      className="list-details-modal"
    >
      <div className="py-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] m-0">{student.name}</h2>
            <p className="text-[var(--muted-foreground)] m-0">{student.admission_number} | {student.class_name || 'No Class'}</p>
          </div>
          <div className="ml-auto">
            <Tag color={student.status === 'Active' ? 'success' : 'error'} className="px-3 py-1 text-sm font-medium border-0">
              {student.status}
            </Tag>
          </div>
        </div>

        <Divider orientation="left" className="border-[var(--border)]"><span className="text-[var(--muted-foreground)]">Academic Information</span></Divider>
        <Descriptions column={2} bordered={false} className="student-descriptions">
          <Descriptions.Item label="Admission No">{student.admission_number}</Descriptions.Item>
          <Descriptions.Item label="Enroll No">{student.enroll_no || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Class">{student.class_name || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Section">{student.section || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Admission Date">{formatDate(student.admission_date)}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" className="border-[var(--border)] mt-6"><span className="text-[var(--muted-foreground)]">Personal Information</span></Divider>
        <Descriptions column={2} bordered={false} className="student-descriptions">
          <Descriptions.Item label="Father's Name">{student.father_name}</Descriptions.Item>
          <Descriptions.Item label="Father's Contact">{student.father_contact}</Descriptions.Item>
          <Descriptions.Item label="Gender">{student.gender || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{formatDate(student.dob)}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{student.address}</Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
}
