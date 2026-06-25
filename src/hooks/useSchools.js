import { useQuery } from '@tanstack/react-query';
import { listSchools } from '../api/schools';

export const schoolKeys = {
  all: ['schools'],
  list: () => ['schools', 'list'],
};

/**
 * React Query hook for the school list.
 *
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useSchools(options = {}) {
  return useQuery({
    queryKey: schoolKeys.list(),
    queryFn: listSchools,
    staleTime: 5 * 60_000,
    ...options,
  });
}

export default useSchools;
