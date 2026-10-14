import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getMe, signIn as apiSignIn, signOut as apiSignOut } from '../api/auth';
import {
  SESSION_EVENT,
  TOKEN_KEY,
  USER_KEY,
  clearSession,
  storeSession,
} from '../api/client';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  // Keep React state in sync with the API client, which rotates tokens on
  // refresh and clears them when the session ends.
  useEffect(() => {
    const onSession = (event) => {
      setToken(localStorage.getItem(TOKEN_KEY));
      setUser(event.detail ?? null);
    };
    window.addEventListener(SESSION_EVENT, onSession);
    return () => window.removeEventListener(SESSION_EVENT, onSession);
  }, []);

  /** Re-read the identity (roles, permissions, flags) from the server. */
  const refreshUser = useCallback(async () => {
    const fresh = await getMe();
    localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    setUser(fresh);
    return fresh;
  }, []);

  // On app load, replace the cached identity with the server's current view
  // so permission / role changes made since the last sign-in take effect.
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      refreshUser().catch(() => {
        // The API client already ended the session if the token is dead.
      });
    }
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const data = await apiSignIn(credentials);
    storeSession(data);
    setToken(data.access_token);
    setUser(data.user_info);
    return data.user_info;
  }, []);

  const logout = useCallback(async () => {
    await apiSignOut();
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => {
    const permissions = user?.permissions ?? [];
    const modules = user?.accessible_modules ?? [];
    // Tenancy level decides WHICH data the user reaches; permissions decide
    // WHAT they may do. Nobody bypasses permissions — the Global Admin is
    // read-only because its role only holds read (+ platform) keys.
    const level = user?.level ?? (user?.is_superuser ? 'global' : 'school');
    const isGlobal = level === 'global';
    const isSuperAdmin = level === 'super_admin';
    const isSchoolUser = level === 'school';

    const hasPermission = (key) => permissions.includes(key);
    const hasAnyPermission = (keys = []) =>
      keys.some((k) => permissions.includes(k));
    const hasAllPermissions = (keys = []) =>
      keys.every((k) => permissions.includes(k));
    const hasModule = (name) => modules.includes(name);

    return {
      user,
      token,
      isAuthenticated: !!token,
      level,
      isGlobal,
      isSuperAdmin,
      isSchoolUser,
      organization: user?.organization_id
        ? { id: user.organization_id, name: user.organization_name }
        : null,
      schools: user?.schools ?? [],
      // Admin-created accounts must set their own password before anything else.
      mustChangePassword: user?.is_first_login === true,
      permissions,
      modules,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasModule,
      login,
      logout,
      refreshUser,
    };
  }, [user, token, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
