import React from 'react';
import { Alert, Button, Skeleton } from 'antd';
import SummaryCards from './components/SummaryCards';
import RecentActivity from './components/RecentActivity';
import SchoolInfoCard from './components/SchoolInfoCard';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useTheme } from '../../theme';

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
  const { toggleTheme } = useTheme();
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardStats();

  const lastUpdated = stats?.generated_at ? new Date(stats.generated_at) : null;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--foreground)]">
            SMS Overview Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-[10px] text-[var(--muted-foreground)] font-mono mt-1 hidden sm:block">
            SYSTEM STATUS:{' '}
            <span className="text-[var(--success)] font-bold">OPERATIONAL</span>
            {lastUpdated && (
              <> · LAST UPDATED: {lastUpdated.toLocaleTimeString()}</>
            )}
          </p>
          <button
            onClick={toggleTheme}
            className="border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-4 py-1.5 rounded-md text-sm font-medium cursor-pointer hover:bg-[var(--muted)] transition-colors shadow-sm"
          >
            Toggle Theme
          </button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="px-2">
          <Alert
            type="error"
            showIcon
            message="Failed to load dashboard"
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
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-glass">
                <Skeleton
                  active
                  paragraph={{ rows: 1 }}
                  title={{ width: '60%' }}
                />
              </div>
            ))}
          </div>
          <div className="px-2">
            <div className="card-glass">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          </div>
        </div>
      ) : (
        !isError && (
          <>
            {/* Row 1: Summary Cards */}
            <SummaryCards summary={toSummary(stats)} />

            {/* Row 2: School info + Recent activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 px-2">
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
    </div>
  );
}
