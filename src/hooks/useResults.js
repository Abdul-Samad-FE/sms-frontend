import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getClassPerformance,
  getFailedStudents,
  getSubjectPerformance,
  getTopPerformers,
  listResults,
  processResults,
  publishResults,
  unpublishResults,
} from '../api/results';

export const resultKeys = {
  all: ['results'],
  list: (params = {}) => ['results', 'list', params],
  report: (kind, examId, classId) => [
    'results',
    'report',
    kind,
    examId,
    classId,
  ],
};

/** One server page of results (exam + class required). */
export function useResults(params, options = {}) {
  return useQuery({
    queryKey: resultKeys.list(params),
    queryFn: () => listResults(params),
    enabled: !!params?.exam_id && !!params?.class_id,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: resultKeys.all });
}

export function useProcessResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, classId }) => processResults(examId, classId),
    onSuccess: () => invalidate(qc),
  });
}

export function usePublishResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, classId }) => publishResults(examId, classId),
    onSuccess: () => {
      invalidate(qc);
      qc.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

export function useUnpublishResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, classId }) => unpublishResults(examId, classId),
    onSuccess: () => {
      invalidate(qc);
      qc.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

// ---------- Report hooks ----------
const reportHook =
  (kind, fetcher) =>
  (examId, classId, options = {}) =>
    useQuery({
      queryKey: resultKeys.report(kind, examId, classId),
      queryFn: () => fetcher(examId, classId),
      enabled: !!examId && !!classId,
      ...options,
    });

export const useClassPerformance = reportHook('class', getClassPerformance);
export const useSubjectPerformance = reportHook(
  'subject',
  getSubjectPerformance
);
export const useTopPerformers = reportHook('top', (e, c) =>
  getTopPerformers(e, c, 10)
);
/** One server page of the failed-students report. */
export function useFailedStudents(examId, classId, params = {}, options = {}) {
  return useQuery({
    queryKey: [...resultKeys.report('failed', examId, classId), params],
    queryFn: () => getFailedStudents(examId, classId, params),
    enabled: !!examId && !!classId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
