import React from 'react';
import { StatusTag } from '../../../components/ui';

/**
 * @typedef {import('../../../api/attendance').AttendanceStatus} AttendanceStatus
 */

/** Label + StatusTag tone per student attendance status. */
export const STATUS_META = {
  present: { tone: 'success', label: 'Present' },
  absent: { tone: 'danger', label: 'Absent' },
  leave: { tone: 'warning', label: 'Leave' },
};

/** Ordered options for selectors / segmented controls. */
export const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'leave', label: 'Leave' },
];

/** Tone per class marking status ("Marked" / "Partial" / "Not marked"). */
const MARKING_TONES = {
  Marked: 'success',
  Partial: 'warning',
  'Not marked': 'neutral',
};

/**
 * A student's attendance status; `null` renders "Not marked".
 *
 * @param {{ status?: AttendanceStatus|null }} props
 */
export default function AttendanceStatusTag({ status }) {
  const meta = STATUS_META[status];
  if (!meta) return <StatusTag tone="neutral">Not marked</StatusTag>;
  return <StatusTag tone={meta.tone}>{meta.label}</StatusTag>;
}

/**
 * A class's marking status for the day.
 *
 * @param {{ status: import('../../../api/attendance').MarkingStatus }} props
 */
export function MarkingStatusTag({ status }) {
  return (
    <StatusTag tone={MARKING_TONES[status] || 'neutral'}>{status}</StatusTag>
  );
}
