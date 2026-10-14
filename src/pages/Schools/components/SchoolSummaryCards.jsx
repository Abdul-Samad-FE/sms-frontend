import React from 'react';
import {
  LayersIcon,
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../../../components/Icons';
import { StatCard, StatGrid } from '../../../components/ui';

/**
 * Tenant fleet overview. Counts reflect the rows currently loaded, so they
 * follow whatever filter the operator has applied.
 *
 * @param {{
 *   total?: number,
 *   activeCount?: number,
 *   inactiveCount?: number,
 *   studentTotal?: number,
 * }} props
 */
export default function SchoolSummaryCards({
  total = 0,
  activeCount = 0,
  inactiveCount = 0,
  studentTotal = 0,
}) {
  return (
    <StatGrid columns={4}>
      <StatCard
        label="Total Schools"
        value={total}
        icon={<LayersIcon />}
        tone="primary"
      />
      <StatCard
        label="Active"
        value={activeCount}
        icon={<CheckCircleIcon />}
        tone="success"
      />
      <StatCard
        label="Suspended / Archived"
        value={inactiveCount}
        icon={<AlertCircleIcon />}
        tone="warning"
      />
      <StatCard
        label="Students Enrolled"
        value={studentTotal}
        icon={<UsersIcon />}
        tone="info"
      />
    </StatGrid>
  );
}
