import React, { useMemo } from 'react';
import { LayersIcon, UsersIcon, ActivityIcon } from '../../../components/Icons';
import { StatCard, StatGrid } from '../../../components/ui';

/**
 * Summary cards for the classes overview. Totals come from the API (the
 * class list's `meta.total` and a student count query).
 *
 * @param {{ classCount?: number, studentTotal?: number, loading?: boolean }} props
 */
export default function ClassSummaryCards({
  classCount = 0,
  studentTotal = 0,
  loading = false,
}) {
  const total = classCount;
  const avg = useMemo(
    () => (total ? Math.round((studentTotal / total) * 10) / 10 : 0),
    [total, studentTotal]
  );

  return (
    <StatGrid columns={3}>
      <StatCard
        label="Total Classes"
        value={total}
        icon={<LayersIcon />}
        tone="primary"
        loading={loading}
      />
      <StatCard
        label="Total Students"
        value={studentTotal}
        icon={<UsersIcon />}
        tone="success"
      />
      <StatCard
        label="Avg Students / Class"
        value={avg}
        icon={<ActivityIcon />}
        tone="info"
        loading={loading}
      />
    </StatGrid>
  );
}
