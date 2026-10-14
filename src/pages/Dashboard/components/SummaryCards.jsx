import React from 'react';
import {
  ActivityIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
} from '../../../components/Icons';
import { StatCard, StatGrid } from '../../../components/ui';

export default function SummaryCards({ summary }) {
  return (
    <StatGrid columns={4}>
      <StatCard
        label="Total Students"
        value={summary?.totalStudents || 0}
        icon={<UsersIcon />}
        tone="primary"
      />
      <StatCard
        label="Total Teachers"
        value={summary?.totalTeachers || 0}
        icon={<CheckCircleIcon />}
        tone="success"
      />
      <StatCard
        label="Total Classes"
        value={summary?.totalClasses || 0}
        icon={<ActivityIcon />}
        tone="info"
      />
      <StatCard
        label="Today's Attendance"
        value={summary?.avgAttendance || '0%'}
        icon={<ClockIcon />}
        tone="warning"
      />
    </StatGrid>
  );
}
