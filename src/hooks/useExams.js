import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createExam,
  deleteExam,
  getExamSchedule,
  listAllExams,
  listExams,
  setExamSchedule,
  updateExam,
} from '../api/exams';

export const examKeys = {
  all: ['exams'],
  list: () => ['exams', 'list'],
  page: (params) => ['exams', 'page', params],
  schedule: (examId, classId) => [
    'exams',
    'schedule',
    examId,
    classId ?? 'all',
  ],
};

/** Every exam as an array — for exam pickers (Marks / Results / Reports). */
export function useAllExams(options = {}) {
  return useQuery({
    queryKey: examKeys.list(),
    queryFn: () => listAllExams(),
    staleTime: 60_000,
    ...options,
  });
}

/** One server page of exams for the exams table. */
export function useExamsPage(params, options = {}) {
  return useQuery({
    queryKey: examKeys.page(params),
    queryFn: () => listExams(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useExamSchedule(examId, classId, options = {}) {
  return useQuery({
    queryKey: examKeys.schedule(examId, classId),
    queryFn: () =>
      getExamSchedule(examId, classId ? { class_id: classId } : {}),
    enabled: examId != null,
    ...options,
  });
}

const invalidate = (qc) => qc.invalidateQueries({ queryKey: examKeys.all });

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExam,
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateExam(id, payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExam,
    onSuccess: () => invalidate(qc),
  });
}

export function useSetExamSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, payload }) => setExamSchedule(examId, payload),
    onSuccess: () => invalidate(qc),
  });
}
