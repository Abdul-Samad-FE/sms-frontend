import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboard';

/**
 * Query key factory for dashboard queries — keeps cache keys consistent and
 * lets callers invalidate the whole namespace with `['dashboard']`.
 */
export const dashboardKeys = {
  all: ['dashboard'],
  /** @param {{ school_id?: number }} [params] */
  stats: (params = {}) => ['dashboard', 'stats', params],
};

/**
 * React Query hook for the overview dashboard statistics.
 *
 * @param {{ school_id?: number }} [params] Optional superadmin scope override.
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../api/dashboard').DashboardStats>}
 */
export function useDashboardStats(params = {}, options = {}) {
  return useQuery({
    queryKey: dashboardKeys.stats(params),
    queryFn: () => getDashboardStats(params),
    staleTime: 60_000, // stats tolerate a minute of staleness
    ...options,
  });
}

export default useDashboardStats;
