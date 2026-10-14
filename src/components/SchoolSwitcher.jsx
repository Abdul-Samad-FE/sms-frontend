import React from 'react';
import { Select } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useActiveSchool } from '../context/ActiveSchoolContext';
import { useSchoolOptions } from '../hooks/useSchools';

const ALL_SCHOOLS = '__all__';

/**
 * Active-school picker shown in the top bar.
 *
 * - School users: their school's name (static).
 * - Super Admins: their organization's schools.
 * - Global Admins: every school (searchable) plus "All schools".
 */
export default function SchoolSwitcher() {
  const { user, isGlobal, isSuperAdmin, schools } = useAuth();
  const { activeSchoolId, setActiveSchool } = useActiveSchool();
  const globalOptions = useSchoolOptions({}, { enabled: isGlobal });

  if (!isGlobal && !isSuperAdmin) {
    return (
      <span className="truncate text-sm font-medium text-[var(--foreground)]">
        {user?.school_name ?? '—'}
      </span>
    );
  }

  const options = isGlobal
    ? [
        { value: ALL_SCHOOLS, label: 'All schools' },
        ...(globalOptions.data ?? []).map((s) => ({
          value: s.id,
          label: s.organization_name
            ? `${s.name} · ${s.organization_name}`
            : s.name,
        })),
      ]
    : schools.map((s) => ({
        value: s.id,
        label: s.is_active ? s.name : `${s.name} (suspended)`,
      }));

  return (
    <Select
      aria-label="Active school"
      size="middle"
      className="w-full min-w-0 sm:w-72"
      showSearch
      optionFilterProp="label"
      loading={isGlobal && globalOptions.isLoading}
      value={activeSchoolId ?? (isGlobal ? ALL_SCHOOLS : undefined)}
      options={options}
      onChange={(value) =>
        setActiveSchool(value === ALL_SCHOOLS ? null : value)
      }
      placeholder="Select a school"
    />
  );
}
