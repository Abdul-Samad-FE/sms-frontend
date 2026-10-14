import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createUser, deleteUser, listUsers, updateUser } from '../api/users';

export const userKeys = {
  all: ['users'],
  /** @param {Record<string, unknown>} [params] */
  list: (params = {}) => ['users', 'list', params],
};

/**
 * One server-side page of the (tenant-scoped) user list — `{ items, meta }`.
 * Keeps the previous page on screen while the next one loads.
 *
 * @param {Parameters<typeof listUsers>[0]} [params]
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useUsers(params = {}, options = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    ...options,
  });
}

function invalidateUsers(queryClient) {
  queryClient.invalidateQueries({ queryKey: userKeys.all });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => invalidateUsers(queryClient),
  });
}
