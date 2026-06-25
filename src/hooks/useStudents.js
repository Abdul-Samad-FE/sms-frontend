import { useQuery } from '@tanstack/react-query';
import { listStudents } from '../api/students';

export const studentKeys = {
  all: ['students'],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['students', 'list', params],
};

/**
 * React Query hook for the (tenant-scoped) student list.
 *
 * @param {{ school_id?: number, class_id?: number, skip?: number, limit?: number }} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useStudents(params = {}, options = {}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => listStudents(params),
    staleTime: 60_000,
    ...options,
  });
}

export default useStudents;
