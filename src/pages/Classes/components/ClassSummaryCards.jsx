import React, { useMemo } from 'react';
import { LayersIcon, UsersIcon, ActivityIcon } from '../../../components/Icons';

/**
 * Summary cards for the classes overview.
 *
 * @param {{ classCount?: number, studentTotal?: number }} props
 */
export default function ClassSummaryCards({
  classCount = 0,
  studentTotal = 0,
}) {
  const avg = useMemo(
    () => (classCount ? Math.round((studentTotal / classCount) * 10) / 10 : 0),
    [classCount, studentTotal]
  );

  const cards = [
    {
      title: 'Total Classes',
      value: classCount,
      icon: <LayersIcon className="w-5 h-5" />,
      color: 'var(--primary)',
    },
    {
      title: 'Total Students',
      value: studentTotal,
      icon: <UsersIcon className="w-5 h-5" />,
      color: 'var(--success)',
    },
    {
      title: 'Avg Students / Class',
      value: avg,
      icon: <ActivityIcon className="w-5 h-5" />,
      color: 'var(--info)',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="card-glass flex items-center justify-between"
        >
          <div>
            <p className="text-[var(--muted-foreground)] text-sm font-medium">
              {card.title}
            </p>
            <h3 className="text-2xl font-bold mt-1 text-[var(--foreground)]">
              {card.value}
            </h3>
          </div>
          <div
            className="p-3 rounded-full bg-[var(--muted)]"
            style={{ color: card.color }}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
