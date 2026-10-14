import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createTeacher,
  createTeacherLogin,
  deleteTeacher,
  getTeacherSummary,
  listAllTeachers,
  listTeachers,
  updateTeacher,
} from '../api/teachers';
import { classKeys } from './useClasses';

export const teacherKeys = {
  all: ['teachers'],
  /** @param {Record<string, unknown>} [params] */
  page: (params = {}) => ['teachers', 'page', params],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['teachers', 'all', params],
  summary: (params = {}) => ['teachers', 'summary', params],
};

/**
 * One server page of teachers (`{ items, meta }`) for the Teachers table.
 *
 * @param {Record<string, unknown>} [params]
 */
export function useTeachers(params = {}) {
  return useQuery({
    queryKey: teacherKeys.page(params),
    queryFn: () => listTeachers(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Every teacher in scope as an array — for pickers (e.g. class teacher).
 *
 * @param {Record<string, unknown>} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useAllTeachers(params = {}, options = {}) {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => listAllTeachers(params),
    staleTime: 5 * 60_000,
    ...options,
  });
}

/** KPI totals (total / active / male / female / with_login). */
export function useTeacherSummary(params = {}) {
  return useQuery({
    queryKey: teacherKeys.summary(params),
    queryFn: () => getTeacherSummary(params),
    staleTime: 60_000,
  });
}

/**
 * Teacher writes also change class rows (class teacher name) and the
 * dashboard's teacher count.
 */
function invalidateTeachers(queryClient) {
  queryClient.invalidateQueries({ queryKey: teacherKeys.all });
  queryClient.invalidateQueries({ queryKey: classKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => invalidateTeachers(queryClient),
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateTeacher(id, payload),
    onSuccess: () => invalidateTeachers(queryClient),
  });
}

export function useCreateTeacherLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }) => createTeacherLogin(id, password),
    onSuccess: () => invalidateTeachers(queryClient),
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteTeacher(id),
    onSuccess: () => invalidateTeachers(queryClient),
  });
}

export default useTeachers;
