import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createClass,
  deleteClass,
  getClass,
  listAllClasses,
  listClassesPage,
  updateClass,
} from '../api/classes';

export const classKeys = {
  all: ['classes'],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['classes', 'list', params],
  /** @param {Record<string, unknown>} [params] */
  page: (params = {}) => ['classes', 'page', params],
  /** @param {number} id */
  detail: (id) => ['classes', 'detail', id],
};

/**
 * Every class in scope as an array — for pickers and filters.
 *
 * @param {Record<string, unknown>} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useAllClasses(params = {}, options = {}) {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => listAllClasses(params),
    staleTime: 5 * 60_000, // class lists change rarely
    ...options,
  });
}

/** @deprecated Alias of `useAllClasses`; tables should use `useClassesPage`. */
export const useClasses = useAllClasses;

/**
 * One server page of classes (`{ items, meta }`) for paginated tables.
 *
 * @param {{ page?: number, page_size?: number, search?: string }} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useClassesPage(params = {}, options = {}) {
  return useQuery({
    queryKey: classKeys.page(params),
    queryFn: () => listClassesPage(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/**
 * React Query hook for a single class.
 *
 * @param {number} id
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useClass(id, options = {}) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => getClass(id),
    enabled: id != null,
    ...options,
  });
}

/** Invalidate every class query after a write. */
function invalidateClasses(queryClient) {
  queryClient.invalidateQueries({ queryKey: classKeys.all });
}

/** Create a class. */
export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClass,
    onSuccess: () => invalidateClasses(queryClient),
  });
}

/** Update a class. */
export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateClass(id, payload),
    onSuccess: () => invalidateClasses(queryClient),
  });
}

/** Delete a class. */
export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteClass(id),
    onSuccess: () => invalidateClasses(queryClient),
  });
}

export default useAllClasses;
