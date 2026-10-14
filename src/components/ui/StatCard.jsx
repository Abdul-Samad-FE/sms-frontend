import React from 'react';
import { Skeleton } from 'antd';

const TONES = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  accent: 'var(--chart-violet)',
  neutral: 'var(--muted-foreground)',
};

/**
 * KPI tile: label, large value, optional hint and a tinted icon badge.
 *
 * @param {{
 *   label: React.ReactNode,
 *   value: React.ReactNode,
 *   hint?: React.ReactNode,
 *   icon?: React.ReactNode,
 *   tone?: keyof typeof TONES,
 *   loading?: boolean,
 * }} props
 */
export default function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'primary',
  loading = false,
}) {
  return (
    <div className="ds-card flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="ds-label m-0">{label}</p>
        {loading ? (
          <Skeleton.Input active size="small" className="!mt-2" />
        ) : (
          <p className="m-0 mt-1.5 text-[26px] font-semibold leading-tight text-[var(--foreground)] tabular-nums">
            {value}
          </p>
        )}
        {hint && <p className="ds-caption m-0 mt-1">{hint}</p>}
      </div>
      {icon && (
        <span
          className="ds-stat-icon text-lg"
          style={{ '--ds-tone': TONES[tone] || TONES.primary }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </div>
  );
}

/** Responsive grid for a row of StatCards. */
export function StatGrid({ children, columns = 4 }) {
  const cols =
    {
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-2 lg:grid-cols-3',
      4: 'sm:grid-cols-2 xl:grid-cols-4',
      5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    }[columns] || 'sm:grid-cols-2 xl:grid-cols-4';
  return <div className={`grid grid-cols-1 gap-4 ${cols}`}>{children}</div>;
}
