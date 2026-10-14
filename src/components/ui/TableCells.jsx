import React from 'react';
import dayjs from 'dayjs';

/**
 * Semantic table cells. Every column renders through one of these so the
 * text size, weight and colour stay identical across all tables:
 *   PrimaryCell  — the row's identifying value (name, title), semibold
 *   MutedCell    — secondary info (contact, description)
 *   MonoCell     — codes / IDs / numbers (admission no, EMIS, marks)
 *   DateCell     — dates, formatted "MMM D, YYYY"
 * Empty values render as a muted em dash.
 */

const isEmpty = (v) => v === null || v === undefined || v === '';

export const EmptyCell = () => <span className="ds-cell-empty">—</span>;

export function PrimaryCell({ children, secondary }) {
  if (isEmpty(children)) return <EmptyCell />;
  return (
    <span className="ds-cell-primary">
      {children}
      {!isEmpty(secondary) && (
        <span className="ds-cell-secondary">{secondary}</span>
      )}
    </span>
  );
}

export function TextCell({ children }) {
  if (isEmpty(children)) return <EmptyCell />;
  return <span>{children}</span>;
}

export function MutedCell({ children }) {
  if (isEmpty(children)) return <EmptyCell />;
  return <span className="ds-cell-muted">{children}</span>;
}

export function MonoCell({ children }) {
  if (isEmpty(children)) return <EmptyCell />;
  return <span className="ds-cell-mono">{children}</span>;
}

export function DateCell({ value, format = 'MMM D, YYYY' }) {
  if (isEmpty(value)) return <EmptyCell />;
  const d = dayjs(value);
  return <span>{d.isValid() ? d.format(format) : String(value)}</span>;
}

/* Render shorthands for column definitions: `render: renderMuted`. */
export const renderText = (v) => <TextCell>{v}</TextCell>;
export const renderPrimary = (v) => <PrimaryCell>{v}</PrimaryCell>;
export const renderMuted = (v) => <MutedCell>{v}</MutedCell>;
export const renderMono = (v) => <MonoCell>{v}</MonoCell>;
export const renderDate = (v) => <DateCell value={v} />;
