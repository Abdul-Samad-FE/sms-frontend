import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StatusTag } from './ui';
import SchoolSwitcher from './SchoolSwitcher';

/** "admin" -> "Admin", "school_admin" -> "School Admin". */
const titleCase = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Level / role badge shown next to the signed-in user. */
export function levelBadge(user) {
  if (user?.level === 'global')
    return { label: 'Global Admin', tone: 'accent' };
  if (user?.level === 'super_admin') {
    return { label: 'Super Admin', tone: 'primary' };
  }
  return { label: titleCase(user?.user_role) || 'User', tone: 'info' };
}

/**
 * Sticky app header: tenant context (organization + active school switcher)
 * on the left, signed-in user and their access level on the right.
 */
export default function TopBar() {
  const { user, isGlobal, organization } = useAuth();
  const badge = levelBadge(user);
  const context = isGlobal ? 'Platform' : (organization?.name ?? 'School');

  return (
    <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--border)] bg-[var(--card)] px-4 py-2 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="hidden max-w-[220px] truncate text-sm font-semibold text-[var(--foreground)] sm:inline"
          title={context}
        >
          {context}
        </span>
        <span className="hidden text-[var(--border)] sm:inline" aria-hidden>
          /
        </span>
        <div className="min-w-0 flex-1 sm:flex-none">
          <SchoolSwitcher />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden max-w-[200px] truncate text-sm text-[var(--foreground)] md:inline">
          {user?.name}
        </span>
        <StatusTag tone={badge.tone}>{badge.label}</StatusTag>
      </div>
    </header>
  );
}
