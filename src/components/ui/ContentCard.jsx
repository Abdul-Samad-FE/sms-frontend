import React from 'react';

/**
 * Bordered content surface with an optional header row.
 *
 * Use `flush` when the body is a DataTable so the table runs edge to edge
 * and the card supplies the frame and rounded corners.
 *
 * @param {{
 *   title?: React.ReactNode,
 *   subtitle?: React.ReactNode,
 *   extra?: React.ReactNode,
 *   flush?: boolean,
 *   className?: string,
 *   bodyClassName?: string,
 *   children: React.ReactNode,
 * }} props
 */
export default function ContentCard({
  title,
  subtitle,
  extra,
  flush = false,
  className = '',
  bodyClassName = '',
  children,
}) {
  const hasHeader = title || subtitle || extra;
  return (
    <section className={`ds-card ${className}`}>
      {hasHeader && (
        <div className="ds-card-header">
          <div className="min-w-0">
            {title && <h2 className="ds-section-title">{title}</h2>}
            {subtitle && <p className="ds-section-subtitle">{subtitle}</p>}
          </div>
          {extra && (
            <div className="flex flex-wrap items-center gap-2">{extra}</div>
          )}
        </div>
      )}
      <div
        className={`${flush ? 'ds-card-body--flush' : 'ds-card-body'} ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
