import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from './Forbidden';

/**
 * Route guard. First enforces authentication (redirect to /login, preserving
 * the target). Then, if an authorization constraint is supplied, enforces it
 * and shows a 403 page when the user is signed in but lacks access.
 *
 * Authorization constraints (all supplied ones must pass):
 *   - permission: a single UBAC key (e.g. "student:read")
 *   - anyOf:      passes if the user holds ANY of these keys
 *   - module:     RBAC module name (e.g. "admin")
 *   - levels:     tenancy levels allowed (e.g. ['global'])
 *
 * @param {{
 *   children: React.ReactNode,
 *   permission?: string,
 *   anyOf?: string[],
 *   module?: string,
 *   levels?: Array<'global'|'super_admin'|'school'>,
 * }} props
 */
export default function ProtectedRoute({
  children,
  permission,
  anyOf,
  module,
  levels,
}) {
  const {
    isAuthenticated,
    level,
    mustChangePassword,
    hasPermission,
    hasAnyPermission,
    hasModule,
  } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Admin-created accounts must set their own password first; the API
  // rejects everything else until then.
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // `levels` combines with the other constraints (all must pass).
  let allowed = !levels || levels.includes(level);
  if (allowed && permission) allowed = hasPermission(permission);
  if (allowed && anyOf) allowed = hasAnyPermission(anyOf);
  if (allowed && module) allowed = hasModule(module);

  if (!allowed) {
    return <Forbidden />;
  }

  return children;
}
