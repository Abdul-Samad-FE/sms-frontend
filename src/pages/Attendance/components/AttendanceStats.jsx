import React from 'react';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  LayersIcon,
  UsersIcon,
} from '../../../components/Icons';
import { StatCard, StatGrid } from '../../../components/ui';

const pct = (value) => (value == null ? '—' : `${value}%`);

/**
 * KPI row for the class-wise list (whole school, one day).
 *
 * @param {{ overview?: import('../../../api/attendance').ClassAttendanceOverview,
 *   loading?: boolean }} props
 */
export function OverviewStats({ overview, loading = false }) {
  const o = overview ?? {};
  return (
    <StatGrid columns={4}>
      <StatCard
        label="Classes marked"
        value={`${o.marked_classes ?? 0} / ${o.total_classes ?? 0}`}
        hint={
          o.partial_classes
            ? `${o.partial_classes} partially marked`
            : 'Fully marked classes'
        }
        icon={<LayersIcon />}
        tone="primary"
        loading={loading}
      />
      <StatCard
        label="Not marked yet"
        value={o.not_marked_classes ?? 0}
        hint={`${o.not_marked ?? 0} student(s) without a record`}
        icon={<ClockIcon />}
        tone="warning"
        loading={loading}
      />
      <StatCard
        label="Present"
        value={pct(o.attendance_percentage)}
        hint={`${o.present ?? 0} of ${(o.present ?? 0) + (o.absent ?? 0) + (o.leave ?? 0)} marked`}
        icon={<CheckCircleIcon />}
        tone="success"
        loading={loading}
      />
      <StatCard
        label="Absent / Leave"
        value={`${o.absent ?? 0} / ${o.leave ?? 0}`}
        hint="Across all classes"
        icon={<AlertCircleIcon />}
        tone="danger"
        loading={loading}
      />
    </StatGrid>
  );
}

/**
 * KPI row for one class on one day.
 *
 * @param {{ summary?: import('../../../api/attendance').ClassAttendanceSummary,
 *   loading?: boolean }} props
 */
export function ClassStats({ summary, loading = false }) {
  const s = summary ?? {};
  return (
    <StatGrid columns={4}>
      <StatCard
        label="Students"
        value={s.total_students ?? 0}
        hint={`${s.marked_count ?? 0} marked · ${s.not_marked ?? 0} not marked`}
        icon={<UsersIcon />}
        tone="primary"
        loading={loading}
      />
      <StatCard
        label="Present"
        value={s.present ?? 0}
        hint={`Attendance ${pct(s.attendance_percentage)}`}
        icon={<CheckCircleIcon />}
        tone="success"
        loading={loading}
      />
      <StatCard
        label="Absent"
        value={s.absent ?? 0}
        icon={<AlertCircleIcon />}
        tone="danger"
        loading={loading}
      />
      <StatCard
        label="Leave"
        value={s.leave ?? 0}
        icon={<ClockIcon />}
        tone="warning"
        loading={loading}
      />
    </StatGrid>
  );
}
