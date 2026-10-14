import React from 'react';
import { Tag } from 'antd';

/** Tone → theme colour variable. */
const TONES = {
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  primary: 'var(--primary)',
  accent: 'var(--chart-violet)',
  neutral: 'var(--muted-foreground)',
};

const SUCCESS = new Set([
  'active',
  'present',
  'pass',
  'passed',
  'published',
  'enabled',
  'yes',
]);
const DANGER = new Set([
  'inactive',
  'absent',
  'fail',
  'failed',
  'struck-off',
  'archived',
  'disabled',
  'no',
]);
const WARNING = new Set(['leave', 'pending', 'draft', 'suspended']);

/** Map a status label to a tone ("Active" → success, "Absent" → danger…). */
export function getStatusTone(label) {
  const key = String(label ?? '')
    .trim()
    .toLowerCase();
  if (SUCCESS.has(key)) return 'success';
  if (DANGER.has(key)) return 'danger';
  if (WARNING.has(key)) return 'warning';
  return 'neutral';
}

/**
 * Soft, pill-shaped status badge tinted from the theme palette, so it reads
 * in both light and dark themes. `tone` defaults to a guess from the label.
 *
 * @param {{
 *   children: React.ReactNode,
 *   tone?: keyof typeof TONES,
 * }} props
 */
export default function StatusTag({ children, tone }) {
  const resolved = tone || getStatusTone(children);
  return (
    <Tag
      className="ds-status-tag"
      style={{ '--ds-tone': TONES[resolved] || TONES.neutral }}
    >
      {children}
    </Tag>
  );
}
