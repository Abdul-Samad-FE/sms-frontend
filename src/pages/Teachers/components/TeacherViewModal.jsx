import React from 'react';
import dayjs from 'dayjs';
import { Button, Descriptions, Modal } from 'antd';
import { StatusTag } from '../../../components/ui';

const STATUS_TONES = {
  Active: 'success',
  Inactive: 'danger',
  'On Leave': 'warning',
};

/**
 * Read-only teacher profile.
 *
 * @param {{
 *   teacher?: import('../../../api/teachers').TeacherRecord | null,
 *   onClose: () => void,
 * }} props
 */
export default function TeacherViewModal({ teacher, onClose }) {
  const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v);
  return (
    <Modal
      title="Teacher Profile"
      open={!!teacher}
      onCancel={onClose}
      width={720}
      footer={<Button onClick={onClose}>Close</Button>}
      destroyOnHidden
    >
      {teacher && (
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          size="small"
          bordered
          styles={{ label: { width: 160 } }}
        >
          <Descriptions.Item label="Name">{teacher.name}</Descriptions.Item>
          <Descriptions.Item label="Employee Code">
            {dash(teacher.employee_code)}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {dash(teacher.gender)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusTag tone={STATUS_TONES[teacher.status]}>
              {teacher.status}
            </StatusTag>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {dash(teacher.email)}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {dash(teacher.phone)}
          </Descriptions.Item>
          <Descriptions.Item label="CNIC">
            {dash(teacher.cnic)}
          </Descriptions.Item>
          <Descriptions.Item label="Joining Date">
            {teacher.joining_date
              ? dayjs(teacher.joining_date).format('MMM D, YYYY')
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Qualification">
            {dash(teacher.qualification)}
          </Descriptions.Item>
          <Descriptions.Item label="Specialization">
            {dash(teacher.specialization)}
          </Descriptions.Item>
          <Descriptions.Item label="Class Teacher Of" span={2}>
            {teacher.class_names?.length ? teacher.class_names.join(', ') : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Login Account">
            <StatusTag tone={teacher.has_login ? 'primary' : 'neutral'}>
              {teacher.has_login ? 'Yes' : 'No'}
            </StatusTag>
          </Descriptions.Item>
          <Descriptions.Item label="Added">
            {dayjs(teacher.created_at).format('MMM D, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            {dash(teacher.address)}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
