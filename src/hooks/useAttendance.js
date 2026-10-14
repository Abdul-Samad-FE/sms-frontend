import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getAttendanceOverview,
  getClassAttendance,
  listAttendance,
  listClassAttendance,
  markClassAttendance,
} from '../api/attendance';
import { MAX_PAGE_SIZE } from '../api/pagination';

export const attendanceKeys = {
  all: ['attendance'],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['attendance', 'list', params],
  /** @param {Record<string, unknown>} [params] */
  classes: (params = {}) => ['attendance', 'classes', params],
  /** @param {Record<string, unknown>} [params] */
  overview: (params = {}) => ['attendance', 'overview', params],
  /**
   * @param {number|string} classId
   * @param {Record<string, unknown>} [params]
   */
  classDetail: (classId, params = {}) => [
    'attendance',
    'class',
    String(classId),
    params,
  ],
};

/**
 * One server-side page of raw attendance records — `{ items, meta }`.
 *
 * @param {import('../api/attendance').AttendanceListParams} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useAttendanceList(params = {}, options = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => listAttendance(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    ...options,
  });
}

/**
 * One page of classes with their attendance position for a day.
 *
 * @param {Parameters<typeof listClassAttendance>[0]} [params]
 */
export function useClassAttendanceList(params = {}) {
  return useQuery({
    queryKey: attendanceKeys.classes(params),
    queryFn: () => listClassAttendance(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Totals across every class for a day (KPI cards).
 *
 * @param {Parameters<typeof getAttendanceOverview>[0]} [params]
 */
export function useAttendanceOverview(params = {}) {
  return useQuery({
    queryKey: attendanceKeys.overview(params),
    queryFn: () => getAttendanceOverview(params),
    staleTime: 30_000,
  });
}

/**
 * One class's summary + one page of its students' statuses for a day.
 *
 * @param {number|string} classId
 * @param {Parameters<typeof getClassAttendance>[1]} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useClassAttendance(classId, params = {}, options = {}) {
  return useQuery({
    queryKey: attendanceKeys.classDetail(classId, params),
    queryFn: () => getClassAttendance(classId, params),
    placeholderData: keepPreviousData,
    enabled: classId != null,
    staleTime: 30_000,
    ...options,
  });
}

/**
 * The class's FULL roster with statuses for a day — for the marking form,
 * which is a single data-entry grid (one class) and therefore not paged.
 *
 * @param {number|string} classId
 * @param {string} date  YYYY-MM-DD
 */
export function useClassRoster(classId, date) {
  const params = { date, page: 1, page_size: MAX_PAGE_SIZE };
  return useQuery({
    queryKey: attendanceKeys.classDetail(classId, params),
    queryFn: () => getClassAttendance(classId, params),
    enabled: classId != null && !!date,
    // Always start the form from what the server holds right now, but never
    // refetch in the background — that would wipe the user's unsaved edits.
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/** Mark (or re-mark) a whole class for one day. */
export function useMarkClassAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, date, records }) =>
      markClassAttendance(classId, date, records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
