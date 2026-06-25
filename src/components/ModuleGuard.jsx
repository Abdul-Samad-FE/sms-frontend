import { useAuth } from '../context/AuthContext';

/**
 * Conditionally render children based on RBAC module access (drives sidebar
 * visibility and module-level page access). Superusers always pass.
 *
 * @param {{
 *   module: string,
 *   fallback?: React.ReactNode,
 *   children: React.ReactNode,
 * }} props
 */
export default function ModuleGuard({ module, fallback = null, children }) {
  const { hasModule } = useAuth();
  return hasModule(module) ? children : fallback;
}
