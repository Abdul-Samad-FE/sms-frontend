import React, { useState } from 'react';
import SummaryCards from './components/SummaryCards';
import AlertTable from './components/AlertTable';
import { MOCK_ALERTS, MOCK_SUMMARY } from './utils/constants';
import { useTheme } from '../../theme';

export default function Dashboard() {
  const { toggleTheme } = useTheme();
  const [lastUpdated] = useState(new Date());

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
            SYSTEM STATUS: <span className="text-[var(--success)] font-bold">OPERATIONAL</span> · 
            LAST UPDATED: {lastUpdated.toLocaleTimeString()}
          </p>
          <button 
            onClick={toggleTheme}
            className="border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-4 py-1.5 rounded-md text-sm font-medium cursor-pointer hover:bg-[var(--muted)] transition-colors shadow-sm"
          >
            Toggle Theme
          </button>
        </div>
      </div>

      {/* Row 1: Summary Cards */}
      <SummaryCards summary={MOCK_SUMMARY} />

      {/* Row 2: Table Section */}
      <div className="grid grid-cols-1 gap-4 px-2">
        <div className="min-w-0">
          <AlertTable alerts={MOCK_ALERTS} />
        </div>
      </div>
    </div>
  );
}
