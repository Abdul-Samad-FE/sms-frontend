import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkUpsertAttendance,
  deleteAttendance,
  listAttendance,
  updateAttendance,
} from '../api/attendance';

export const attendanceKeys = {
  all: ['attendance'],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['attendance', 'list', params],
};

/**
 * React Query hook for attendance records.
 *
 * @param {{ school_id?: number, student_id?: number, attendance_date?: string,
 *   limit?: number }} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useAttendanceList(params = {}, options = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => listAttendance(params),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Invalidate every cache that a write to attendance can affect:
 * the attendance lists themselves and the dashboard aggregates.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
function invalidateAttendanceCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

/** Bulk mark/replace a day's attendance. */
export function useBulkUpsertAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUpsertAttendance,
    onSuccess: () => invalidateAttendanceCaches(queryClient),
  });
}

/** Update a single attendance record. */
export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateAttendance(id, payload),
    onSuccess: () => invalidateAttendanceCaches(queryClient),
  });
}

/** Delete a single attendance record. */
export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteAttendance(id),
    onSuccess: () => invalidateAttendanceCaches(queryClient),
  });
}
