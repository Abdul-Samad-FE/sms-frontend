import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveSchool,
  createSchool,
  listSchoolOptions,
  listSchools,
  purgeSchool,
  restoreSchool,
  setSchoolStatus,
  updateSchool,
} from '../api/schools';

export const schoolKeys = {
  all: ['schools'],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['schools', 'list', params],
};

/**
 * Paginated school list — used by the tenant management screen, which needs
 * the filters and the `meta` envelope.
 *
 * @param {{
 *   page?: number,
 *   page_size?: number,
 *   search?: string,
 *   status?: 'active'|'inactive'|'all',
 *   include_archived?: boolean,
 * }} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useSchoolsPage(params = {}, options = {}) {
  return useQuery({
    queryKey: schoolKeys.list(params),
    queryFn: () => listSchools(params),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    ...options,
  });
}

/**
 * Flat list of *selectable* (active, non-archived) schools — the shape the
 * user/class pickers and name lookups expect.
 *
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useSchools(options = {}) {
  const params = { page_size: 500, status: 'active' };
  return useQuery({
    queryKey: schoolKeys.list(params),
    queryFn: () => listSchools(params),
    select: (data) => data?.items ?? [],
    staleTime: 5 * 60_000,
    ...options,
  });
}

function invalidateSchools(queryClient) {
  queryClient.invalidateQueries({ queryKey: schoolKeys.all });
}

/**
 * All accessible schools for pickers (not narrowed by the active school).
 *
 * @param {{ organization_id?: number, status?: string }} [params]
 */
export function useSchoolOptions(params = {}, options = {}) {
  return useQuery({
    queryKey: [...schoolKeys.all, 'options', params],
    queryFn: () => listSchoolOptions(params),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchool,
    onSuccess: () => invalidateSchools(queryClient),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateSchool(id, payload),
    onSuccess: () => invalidateSchools(queryClient),
  });
}

export function useSetSchoolStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive, reason }) =>
      setSchoolStatus(id, isActive, reason),
    onSuccess: () => invalidateSchools(queryClient),
  });
}

export function useArchiveSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => archiveSchool(id),
    onSuccess: () => invalidateSchools(queryClient),
  });
}

export function useRestoreSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreSchool(id),
    onSuccess: () => invalidateSchools(queryClient),
  });
}

export function usePurgeSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirm }) => purgeSchool(id, confirm),
    onSuccess: () => invalidateSchools(queryClient),
  });
}

export default useSchools;
