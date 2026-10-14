import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listAuditLogs } from '../api/admin';

export const auditKeys = {
  all: ['audit-logs'],
  page: (params) => ['audit-logs', 'page', params],
};

/**
 * One server page of audit-log entries (newest first).
 *
 * @param {{ page?: number, page_size?: number, user_id?: number, action?: string, entity?: string }} params
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useAuditLogs(params, options = {}) {
  return useQuery({
    queryKey: auditKeys.page(params),
    queryFn: () => listAuditLogs(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}
