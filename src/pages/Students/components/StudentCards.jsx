import React from 'react';
import {
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../../../components/Icons';

export default function StudentCards({ students }) {
  const total = students.length;
  const activeCount = students.filter((s) => s.status === 'Active').length;
  const struckOffCount = students.filter(
    (s) => s.status === 'Struck-off'
  ).length;

  const cards = [
    {
      title: 'Total Admitted Students',
      value: total,
      icon: <UsersIcon className="w-5 h-5" />,
      color: 'var(--primary)',
    },
    {
      title: 'Active Students',
      value: activeCount,
      icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      color: 'var(--success)',
    },
    {
      title: 'Struck-off Students',
      value: struckOffCount,
      icon: <AlertCircleIcon className="w-5 h-5 text-red-500" />,
      color: 'var(--danger)',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
      {cards.map((card, idx) => (
        <div key={idx} className="card-glass flex items-center justify-between">
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
