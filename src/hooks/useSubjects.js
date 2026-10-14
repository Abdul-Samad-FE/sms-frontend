import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  assignSubject,
  createSubject,
  deleteSubject,
  listAllAssignments,
  listAllSubjects,
  listAssignments,
  listSubjects,
  unassignSubject,
  updateSubject,
} from '../api/subjects';

export const subjectKeys = {
  all: ['subjects'],
  list: () => ['subjects', 'list'],
  page: (params) => ['subjects', 'page', params],
  assignments: (classId) => ['subjects', 'assignments', classId ?? 'all'],
  assignmentsPage: (params) => ['subjects', 'assignments-page', params],
};

/** Every subject as an array — for pickers (not tables). */
export function useAllSubjects(options = {}) {
  return useQuery({
    queryKey: subjectKeys.list(),
    queryFn: () => listAllSubjects(),
    staleTime: 5 * 60_000,
    ...options,
  });
}

/** One server page of subjects for the subjects table. */
export function useSubjectsPage(params, options = {}) {
  return useQuery({
    queryKey: subjectKeys.page(params),
    queryFn: () => listSubjects(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** Every assignment of a class as an array — for data-entry forms. */
export function useAssignments(classId, options = {}) {
  return useQuery({
    queryKey: subjectKeys.assignments(classId),
    queryFn: () => listAllAssignments(classId ? { class_id: classId } : {}),
    enabled: classId != null,
    ...options,
  });
}

/** One server page of a class's assignments for the assignments table. */
export function useAssignmentsPage(params, options = {}) {
  return useQuery({
    queryKey: subjectKeys.assignmentsPage(params),
    queryFn: () => listAssignments(params),
    enabled: params?.class_id != null,
    placeholderData: keepPreviousData,
    ...options,
  });
}

const invalidate = (qc) => qc.invalidateQueries({ queryKey: subjectKeys.all });

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateSubject(id, payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => invalidate(qc),
  });
}

export function useAssignSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignSubject,
    onSuccess: () => invalidate(qc),
  });
}

export function useUnassignSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unassignSubject,
    onSuccess: () => invalidate(qc),
  });
}
