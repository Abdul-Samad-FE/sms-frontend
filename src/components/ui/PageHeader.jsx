import React from 'react';

/**
 * Page title bar — title + optional subtitle on the left, actions on the
 * right. Wraps under the title on narrow screens.
 *
 * @param {{
 *   title: React.ReactNode,
 *   subtitle?: React.ReactNode,
 *   icon?: React.ReactNode,
 *   actions?: React.ReactNode,
 * }} props
 */
export default function PageHeader({ title, subtitle, icon, actions }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--muted)] text-[var(--primary)] text-xl">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="ds-page-title">{title}</h1>
          {subtitle && <p className="ds-page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
