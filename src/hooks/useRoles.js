import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  listAllRoles,
  listRoles,
  updateRole,
} from '../api/admin';

export const roleKeys = {
  all: ['roles'],
  list: () => ['roles', 'list'],
  page: (params) => ['roles', 'page', params],
};

/**
 * Every role as an array (each with its permissions + modules) — for role
 * pickers such as the user form.
 *
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useRoles(options = {}) {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: listAllRoles,
    staleTime: 5 * 60_000,
    ...options,
  });
}

/** One server page of roles for the roles table. */
export function useRolesPage(params, options = {}) {
  return useQuery({
    queryKey: roleKeys.page(params),
    queryFn: () => listRoles(params),
    placeholderData: keepPreviousData,
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
