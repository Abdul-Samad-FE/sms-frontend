import React from 'react';
import { Tag } from 'antd';

/**
 * @typedef {import('../../../api/attendance').AttendanceStatus} AttendanceStatus
 */

/** AntD tag colour + label per attendance status. */
export const STATUS_META = {
  present: { color: 'green', label: 'Present' },
  absent: { color: 'red', label: 'Absent' },
  leave: { color: 'gold', label: 'Leave' },
};

/** Ordered options for selectors / segmented controls. */
export const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'leave', label: 'Leave' },
];

/**
 * Reusable coloured tag for an attendance status.
 *
 * @param {{ status?: AttendanceStatus }} props
 */
export default function AttendanceStatusTag({ status }) {
  const meta = STATUS_META[status];
  if (!meta) {
    return <Tag className="border-0">Not marked</Tag>;
  }
  return (
    <Tag color={meta.color} className="border-0 font-medium">
      {meta.label}
    </Tag>
  );
}
