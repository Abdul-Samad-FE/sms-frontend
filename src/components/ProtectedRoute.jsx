import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from './Forbidden';

/**
 * Route guard. First enforces authentication (redirect to /login, preserving
 * the target). Then, if an authorization constraint is supplied, enforces it
 * and shows a 403 page when the user is signed in but lacks access.
 *
 * Pass at most one authorization constraint:
 *   - permission: a single UBAC key (e.g. "student:read")
 *   - anyOf:      passes if the user holds ANY of these keys
 *   - module:     RBAC module name (e.g. "admin")
 *   - requireSuperuser: superadmin only
 *
 * @param {{
 *   children: React.ReactNode,
 *   permission?: string,
 *   anyOf?: string[],
 *   module?: string,
 *   requireSuperuser?: boolean,
 * }} props
 */
export default function ProtectedRoute({
  children,
  permission,
  anyOf,
  module,
  requireSuperuser,
}) {
  const {
    isAuthenticated,
    isSuperuser,
    hasPermission,
    hasAnyPermission,
    hasModule,
  } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  let allowed = true;
  if (requireSuperuser) allowed = isSuperuser;
  else if (permission) allowed = hasPermission(permission);
  else if (anyOf) allowed = hasAnyPermission(anyOf);
  else if (module) allowed = hasModule(module);

  if (!allowed) {
    return <Forbidden />;
  }

  return children;
}
