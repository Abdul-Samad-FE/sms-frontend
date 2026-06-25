import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { signIn as apiSignIn, signOut as apiSignOut } from '../api/auth';
import { TOKEN_KEY, USER_KEY } from '../api/client';

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

  const login = useCallback(async (credentials) => {
    const data = await apiSignIn(credentials);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user_info));
    setToken(data.access_token);
    setUser(data.user_info);
    return data.user_info;
  }, []);

  const logout = useCallback(async () => {
    await apiSignOut();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => {
    const permissions = user?.permissions ?? [];
    const modules = user?.accessible_modules ?? [];
    const isSuperuser = user?.is_superuser === true;

    // Superusers implicitly hold every permission and see every module —
    // their permission list may be fully populated, but we don't rely on it.
    const hasPermission = (key) => isSuperuser || permissions.includes(key);
    const hasAnyPermission = (keys = []) =>
      isSuperuser || keys.some((k) => permissions.includes(k));
    const hasAllPermissions = (keys = []) =>
      isSuperuser || keys.every((k) => permissions.includes(k));
    const hasModule = (name) => isSuperuser || modules.includes(name);

    return {
      user,
      token,
      isAuthenticated: !!token,
      isSuperuser,
      permissions,
      modules,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasModule,
      login,
      logout,
    };
  }, [user, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
