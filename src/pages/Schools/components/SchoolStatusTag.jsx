import React from 'react';
import { StatusTag } from '../../../components/ui';

/**
 * Renders the tenant lifecycle state as a single tag.
 *
 * Archived wins over suspended: an archived school is always inactive, and
 * "Archived" is the more actionable label for an operator.
 *
 * @param {{ school: import('../../../api/schools').SchoolRecord }} props
 */
export default function SchoolStatusTag({ school }) {
  if (school?.deleted_at) {
    return <StatusTag tone="neutral">Archived</StatusTag>;
  }
  return school?.is_active ? (
    <StatusTag tone="success">Active</StatusTag>
  ) : (
    <StatusTag tone="warning">Suspended</StatusTag>
  );
}
