import React from 'react';
import { ActivityIcon, UsersIcon, CheckCircleIcon, ClockIcon } from '../../../components/Icons';

export default function SummaryCards({ summary }) {
  const cards = [
    { title: 'Total Students', value: summary?.totalStudents || 0, icon: <UsersIcon className="w-5 h-5" />, color: 'var(--primary)' },
    { title: 'Total Teachers', value: summary?.totalTeachers || 0, icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, color: 'var(--success)' },
    { title: 'Total Classes', value: summary?.totalClasses || 0, icon: <ActivityIcon className="w-5 h-5 text-blue-500" />, color: 'var(--info)' },
    { title: 'Avg Attendance', value: summary?.avgAttendance || '0%', icon: <ClockIcon className="w-5 h-5 text-orange-500" />, color: 'var(--warning)' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-2">
      {cards.map((card, idx) => (
        <div key={idx} className="card-glass flex items-center justify-between">
          <div>
            <p className="text-[var(--muted-foreground)] text-sm font-medium">{card.title}</p>
            <h3 className="text-2xl font-bold mt-1 text-[var(--foreground)]">{card.value}</h3>
          </div>
          <div className="p-3 rounded-full bg-[var(--muted)]" style={{ color: card.color }}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
