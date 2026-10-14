import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bulkMarks, listMarks, updateMark } from '../api/marks';

export const markKeys = {
  all: ['marks'],
  list: (params = {}) => ['marks', 'list', params],
};

export function useMarks(params = {}, options = {}) {
  return useQuery({
    queryKey: markKeys.list(params),
    queryFn: () => listMarks(params),
    enabled: !!params.exam_id && !!params.class_id,
    staleTime: 30_000,
    ...options,
  });
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: markKeys.all });
  // Marks feed results — refresh those too.
  qc.invalidateQueries({ queryKey: ['results'] });
}

export function useBulkMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkMarks,
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateMark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateMark(id, payload),
    onSuccess: () => invalidate(qc),
  });
}
