import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudent,
} from '../api/students';
import { MAX_PAGE_SIZE } from '../api/pagination';

export const studentKeys = {
  all: ['students'],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['students', 'list', params],
};

/**
 * One server-side page of students (`{ items, meta }`). Keeps the previous
 * page on screen while the next one loads, so paging/searching doesn't flash.
 *
 * @param {import('../api/students').StudentListParams} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useStudents(params = {}, options = {}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => listStudents(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    ...options,
  });
}

/**
 * Full roster as a plain array (up to the API maximum of 1000 rows) for
 * screens that need every student at once: attendance marking, marks entry,
 * class rosters and pickers.
 *
 * @param {Omit<import('../api/students').StudentListParams, 'page'|'page_size'>} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useAllStudents(params = {}, options = {}) {
  const full = { ...params, page: 1, page_size: MAX_PAGE_SIZE };
  return useQuery({
    queryKey: studentKeys.list(full),
    queryFn: () => listStudents(full),
    select: (page) => page.items,
    staleTime: 60_000,
    ...options,
  });
}

/**
 * Total number of students matching `params` — a one-row request that only
 * reads `meta.total`, for KPI cards.
 *
 * @param {import('../api/students').StudentListParams} [params]
 */
export function useStudentCount(params = {}) {
  const countParams = { ...params, page: 1, page_size: 1 };
  return useQuery({
    queryKey: studentKeys.list(countParams),
    queryFn: () => listStudents(countParams),
    select: (page) => page.meta.total,
    staleTime: 60_000,
  });
}

/**
 * Writes to students change student lists, class student counts and the
 * dashboard totals.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
function invalidateStudentCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: studentKeys.all });
  queryClient.invalidateQueries({ queryKey: ['classes'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createStudent(payload),
    onSuccess: () => invalidateStudentCaches(queryClient),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: () => invalidateStudentCaches(queryClient),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: () => invalidateStudentCaches(queryClient),
  });
}

export default useStudents;
