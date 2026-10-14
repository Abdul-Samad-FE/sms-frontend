import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { ACTIVE_SCHOOL_KEY, setActiveSchoolId } from '../api/client';

const ActiveSchoolContext = createContext(undefined);

export const useActiveSchool = () => {
  const ctx = useContext(ActiveSchoolContext);
  if (!ctx) {
    throw new Error('useActiveSchool must be used within ActiveSchoolProvider');
  }
  return ctx;
};

const readStored = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_SCHOOL_KEY);
    return raw ? Number(raw) || null : null;
  } catch {
    return null;
  }
};

/**
 * The school a Super / Global Admin is currently working in.
 *
 * - School users: fixed to their own school.
 * - Super Admins: one of their organization's schools (defaults to the first).
 * - Global Admins: any school, or `null` = "All schools" (platform-wide reads).
 *
 * The id is sent on every API call as the `X-School-Id` header (see
 * api/client.js); changing it clears all cached queries so every screen
 * re-fetches for the new school.
 */
export function ActiveSchoolProvider({ children }) {
  const { user, level, schools } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(readStored);

  // A different account signed in (no reload): drop the previous choice —
  // sign-out already cleared it from storage.
  const userId = user?.id ?? null;
  useEffect(() => {
    setSelected(readStored());
  }, [userId]);

  // Resolve the effective school for the current user.
  const activeSchoolId = useMemo(() => {
    if (!user) return null;
    if (level === 'school') return user.school_id ?? null;
    if (level === 'super_admin') {
      const ids = schools.map((s) => s.id);
      if (selected != null && ids.includes(selected)) return selected;
      return ids[0] ?? null;
    }
    return selected; // global: any school or null (all)
  }, [user, level, schools, selected]);

  // Keep the API client header (and storage) in sync.
  useEffect(() => {
    setActiveSchoolId(level === 'school' ? null : activeSchoolId);
  }, [activeSchoolId, level]);

  const setActiveSchool = useCallback(
    (id) => {
      const next = id ?? null;
      setSelected(next);
      setActiveSchoolId(next);
      // Every cached list belongs to the previous school.
      queryClient.removeQueries();
    },
    [queryClient]
  );

  const activeSchool = useMemo(
    () => schools.find((s) => s.id === activeSchoolId) ?? null,
    [schools, activeSchoolId]
  );

  const value = useMemo(
    () => ({
      activeSchoolId,
      activeSchool,
      setActiveSchool,
      canSwitch:
        level === 'global' || (level === 'super_admin' && schools.length > 1),
    }),
    [activeSchoolId, activeSchool, setActiveSchool, level, schools.length]
  );

  return (
    <ActiveSchoolContext.Provider value={value}>
      {children}
    </ActiveSchoolContext.Provider>
  );
}

export default ActiveSchoolProvider;
