import { useQuery } from '@tanstack/react-query';
import { listModules, listPermissions } from '../api/admin';

export const catalogKeys = {
  permissions: ['admin', 'permissions'],
  modules: ['admin', 'modules'],
};

/**
 * The full permission catalogue (rarely changes).
 *
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function usePermissionsCatalog(options = {}) {
  return useQuery({
    queryKey: catalogKeys.permissions,
    queryFn: listPermissions,
    staleTime: 30 * 60_000,
    ...options,
  });
}

/**
 * The full dashboard-module catalogue (rarely changes).
 *
 * @param {import('@tanstack/react-query').UseQueryOptions} [options]
 */
export function useModulesCatalog(options = {}) {
  return useQuery({
    queryKey: catalogKeys.modules,
    queryFn: listModules,
    staleTime: 30 * 60_000,
    ...options,
  });
}
