import React from 'react';
import { Tabs } from 'antd';
import MarkAttendance from './components/MarkAttendance';
import AttendanceHistory from './components/AttendanceHistory';
import { useTheme } from '../../theme';

/**
 * Attendance module — two workflows under one page:
 *   • Mark    — daily, class-wide bulk marking
 *   • History — browse / filter / edit / delete past records
 */
export default function Attendance() {
  const { toggleTheme } = useTheme();

  const tabs = [
    { key: 'mark', label: 'Mark Attendance', children: <MarkAttendance /> },
    { key: 'history', label: 'History', children: <AttendanceHistory /> },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Attendance Management
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Mark daily attendance and review historical records.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="hidden sm:block border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-4 py-2 flex-shrink-0 rounded-md text-sm font-medium cursor-pointer hover:bg-[var(--muted)] transition-colors shadow-sm"
        >
          Switch Theme
        </button>
      </div>

      <div className="px-2">
        <Tabs defaultActiveKey="mark" items={tabs} />
      </div>
    </div>
  );
}
