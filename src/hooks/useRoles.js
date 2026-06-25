import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRole, deleteRole, listRoles, updateRole } from '../api/admin';

export const roleKeys = {
  all: ['roles'],
  list: () => ['roles', 'list'],
};

/**
 * React Query hook for roles (each includes its permissions + modules).
 *
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useRoles(options = {}) {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: listRoles,
    staleTime: 5 * 60_000,
    ...options,
  });
}

function invalidateRoles(queryClient) {
  queryClient.invalidateQueries({ queryKey: roleKeys.all });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => invalidateRoles(queryClient),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: () => invalidateRoles(queryClient),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRole(id),
    onSuccess: () => invalidateRoles(queryClient),
  });
}
