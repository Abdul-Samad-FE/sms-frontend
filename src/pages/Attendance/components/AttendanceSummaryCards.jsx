import React, { useMemo } from 'react';
import {
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
} from '../../../components/Icons';

/**
 * @typedef {import('../../../api/attendance').AttendanceRecord} AttendanceRecord
 */

/**
 * Present/absent/leave/total summary cards for a set of attendance records.
 *
 * @param {{ records?: Array<{ status?: string }>, total?: number }} props
 *   `total` optionally overrides the denominator (e.g. total students in a
 *   class) so the rate reflects coverage, not just marked rows.
 */
export default function AttendanceSummaryCards({ records = [], total }) {
  const { present, absent, leave, rate } = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0 };
    for (const r of records) {
      if (counts[r.status] != null) counts[r.status] += 1;
    }
    const denominator = total ?? records.length;
    const pct = denominator
      ? Math.round((counts.present / denominator) * 1000) / 10
      : 0;
    return { ...counts, rate: pct };
  }, [records, total]);

  const cards = [
    {
      title: 'Present',
      value: present,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: 'var(--success)',
    },
    {
      title: 'Absent',
      value: absent,
      icon: <AlertCircleIcon className="w-5 h-5" />,
      color: 'var(--danger)',
    },
    {
      title: 'On Leave',
      value: leave,
      icon: <ClockIcon className="w-5 h-5" />,
      color: 'var(--warning)',
    },
    {
      title: 'Attendance Rate',
      value: `${rate}%`,
      icon: <UsersIcon className="w-5 h-5" />,
      color: 'var(--primary)',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="card-glass flex items-center justify-between"
        >
          <div>
            <p className="text-[var(--muted-foreground)] text-sm font-medium">
              {card.title}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-[var(--foreground)]">
              {card.value}
            </h3>
          </div>
          <div
            className="p-3 rounded-full bg-[var(--muted)]"
            style={{ color: card.color }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
