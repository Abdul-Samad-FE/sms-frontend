import React from 'react';
import {
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../../../components/Icons';
import { StatCard, StatGrid } from '../../../components/ui';
import { useStudentCount } from '../../../hooks/useStudents';

/**
 * Student KPIs for the selected class (or the whole school). Each figure is
 * a server-side count, so it stays correct no matter which page of the table
 * is on screen.
 *
 * @param {{ classId?: number }} props
 */
export default function StudentCards({ classId }) {
  const total = useStudentCount({ class_id: classId });
  const active = useStudentCount({ class_id: classId, status: 'Active' });
  const struckOff = useStudentCount({
    class_id: classId,
    status: 'Struck-off',
  });

  return (
    <StatGrid columns={3}>
      <StatCard
        label="Total Admitted Students"
        value={total.data ?? 0}
        loading={total.isLoading}
        icon={<UsersIcon />}
        tone="primary"
      />
      <StatCard
        label="Active Students"
        value={active.data ?? 0}
        loading={active.isLoading}
        icon={<CheckCircleIcon />}
        tone="success"
      />
      <StatCard
        label="Struck-off Students"
        value={struckOff.data ?? 0}
        loading={struckOff.isLoading}
        icon={<AlertCircleIcon />}
        tone="danger"
      />
    </StatGrid>
  );
}
