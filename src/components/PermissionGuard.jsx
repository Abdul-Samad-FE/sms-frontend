import { useAuth } from '../context/AuthContext';

/**
 * Conditionally render children based on UBAC permissions. Superusers always
 * pass. Use exactly one of `permission` / `anyOf` / `allOf`.
 *
 * @param {{
 *   permission?: string,
 *   anyOf?: string[],
 *   allOf?: string[],
 *   fallback?: React.ReactNode,
 *   children: React.ReactNode,
 * }} props
 *
 * @example
 * <PermissionGuard permission="student:create">
 *   <Button>Add Student</Button>
 * </PermissionGuard>
 */
export default function PermissionGuard({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let allowed = true;
  if (permission) allowed = hasPermission(permission);
  else if (anyOf) allowed = hasAnyPermission(anyOf);
  else if (allOf) allowed = hasAllPermissions(allOf);

  return allowed ? children : fallback;
}
