import React from 'react';
import { DatePicker } from 'antd';
import { disableFutureDates } from '../useAttendanceDate';

/**
 * Labelled day picker used across the attendance pages. Future days are
 * disabled and the value can't be cleared.
 *
 * @param {{ value: import('dayjs').Dayjs,
 *   onChange: (d: import('dayjs').Dayjs) => void }} props
 */
export default function AttendanceDatePicker({ value, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <span className="ds-label">Date</span>
      <DatePicker
        value={value}
        onChange={(d) => d && onChange(d)}
        allowClear={false}
        disabledDate={disableFutureDates}
        format="DD MMM YYYY"
        aria-label="Attendance date"
      />
    </label>
  );
}
