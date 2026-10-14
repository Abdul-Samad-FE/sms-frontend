import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addOrganizationOwner,
  getOrganization,
  listOrganizations,
  onboardOrganization,
  setOrganizationStatus,
  updateOrganization,
} from '../api/organizations';
import { MAX_PAGE_SIZE } from '../api/pagination';

export const organizationKeys = {
  all: ['organizations'],
  list: (params) => ['organizations', 'list', params],
  options: () => ['organizations', 'options'],
  detail: (id) => ['organizations', 'detail', id],
};

/** One server page of organizations for the Organizations table. */
export function useOrganizations(params = {}, options = {}) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => listOrganizations(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** Every organization (array) for pickers. */
export function useOrganizationOptions(options = {}) {
  return useQuery({
    queryKey: organizationKeys.options(),
    queryFn: async () =>
      (await listOrganizations({ page: 1, page_size: MAX_PAGE_SIZE })).items,
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useOrganization(id, options = {}) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => getOrganization(id),
    enabled: id != null,
    ...options,
  });
}

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: organizationKeys.all });
  // Onboarding / status changes also affect schools and users lists.
  queryClient.invalidateQueries({ queryKey: ['schools'] });
  queryClient.invalidateQueries({ queryKey: ['users'] });
}

export function useOnboardOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: onboardOrganization,
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateOrganization(id, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSetOrganizationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => setOrganizationStatus(id, isActive),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useAddOrganizationOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => addOrganizationOwner(id, payload),
    onSuccess: () => invalidate(queryClient),
  });
}
