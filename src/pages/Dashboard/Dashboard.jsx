import React from 'react';
import { Alert, Button, Skeleton } from 'antd';
import SummaryCards from './components/SummaryCards';
import RecentActivity from './components/RecentActivity';
import SchoolInfoCard from './components/SchoolInfoCard';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuth } from '../../context/AuthContext';
import { useActiveSchool } from '../../context/ActiveSchoolContext';
import {
  PageContainer,
  PageHeader,
  StatGrid,
  StatusTag,
} from '../../components/ui';

/**
 * Map the API stats payload to the shape `SummaryCards` already expects,
 * keeping that component reusable and untouched.
 *
 * @param {import('../../api/dashboard').DashboardStats} [stats]
 */
const toSummary = (stats) => ({
  totalStudents: stats?.total_students ?? 0,
  totalTeachers: stats?.total_teachers ?? 0,
  totalClasses: stats?.total_classes ?? 0,
  avgAttendance: `${stats?.today_attendance_percentage ?? 0}%`,
});

export default function Dashboard() {
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardStats();
  const { isGlobal, organization, user } = useAuth();
  const { activeSchoolId, activeSchool } = useActiveSchool();

  // Which tenant slice the numbers below describe.
  const scopeLabel =
    activeSchoolId == null
      ? isGlobal
        ? 'All schools on the platform'
        : `All schools in ${organization?.name ?? 'your organization'}`
      : (activeSchool?.name ??
        stats?.school?.name ??
        user?.school_name ??
        'Your school');

  const lastUpdated = stats?.generated_at ? new Date(stats.generated_at) : null;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle={`${scopeLabel} · students, classes and today's attendance.`}
        actions={
          <div className="flex items-center gap-3">
            <StatusTag tone="success">Operational</StatusTag>
            {lastUpdated && (
              <span className="ds-caption">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        }
      />

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Failed to load dashboard"
          description={
            error?.response?.data?.detail ||
            error?.message ||
            'An unexpected error occurred while loading dashboard data.'
          }
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {isLoading ? (
        <>
          <StatGrid columns={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ds-card p-5">
                <Skeleton
                  active
                  paragraph={{ rows: 1 }}
                  title={{ width: '60%' }}
                />
              </div>
            ))}
          </StatGrid>
          <div className="ds-card p-5">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </>
      ) : (
        !isError && (
          <>
            <SummaryCards summary={toSummary(stats)} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="min-w-0 xl:col-span-1">
                <SchoolInfoCard school={stats?.school} />
              </div>
              <div className="min-w-0 xl:col-span-2">
                <RecentActivity
                  items={stats?.recent_activity ?? []}
                  loading={isFetching}
                />
              </div>
            </div>
          </>
        )
      )}
    </PageContainer>
  );
}
