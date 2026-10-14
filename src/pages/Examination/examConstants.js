/** Shared display constants for the Examination module. */

export const EXAM_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final_term', label: 'Final Term' },
  { value: 'annual', label: 'Annual' },
];

export const EXAM_TYPE_LABELS = EXAM_TYPE_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

/** StatusTag tone per grade (A+/A success, B/C info, D warning, F danger). */
export const GRADE_TONES = {
  'A+': 'success',
  A: 'success',
  B: 'info',
  C: 'info',
  D: 'warning',
  F: 'danger',
};

export const gradeTone = (grade) => GRADE_TONES[grade] || 'neutral';

/** Format a class option label consistently across the module. */
export const classLabel = (c) =>
  c?.section ? `${c.class_name} - ${c.section}` : c?.class_name;
