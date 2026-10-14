import React, { useMemo } from 'react';
import { Checkbox } from 'antd';
import { TableEmpty } from '../../../components/ui';

/**
 * @typedef {import('../../../api/admin').PermissionRecord} PermissionRecord
 */

/**
 * Controlled permission picker, grouped by module with per-group "select all".
 *
 * @param {{
 *   permissions?: PermissionRecord[],
 *   value?: number[],
 *   onChange?: (ids: number[]) => void,
 * }} props
 */
export default function PermissionAssignment({
  permissions = [],
  value = [],
  onChange,
}) {
  const selected = useMemo(() => new Set(value), [value]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const p of permissions) {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module).push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const emit = (next) => onChange?.(Array.from(next));

  const togglePermission = (id, checked) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    emit(next);
  };

  const toggleGroup = (groupPerms, checked) => {
    const next = new Set(selected);
    for (const p of groupPerms) {
      if (checked) next.add(p.id);
      else next.delete(p.id);
    }
    emit(next);
  };

  if (!permissions.length) {
    return <TableEmpty text="No permissions available." />;
  }

  return (
    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
      {groups.map(([moduleName, groupPerms]) => {
        const selectedCount = groupPerms.filter((p) =>
          selected.has(p.id)
        ).length;
        const allChecked = selectedCount === groupPerms.length;
        const indeterminate = selectedCount > 0 && !allChecked;
        return (
          <fieldset
            key={moduleName}
            className="m-0 rounded-[var(--radius)] border border-[var(--border)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--header-bg)] px-4 py-2.5">
              <Checkbox
                checked={allChecked}
                indeterminate={indeterminate}
                onChange={(e) => toggleGroup(groupPerms, e.target.checked)}
              >
                <span className="ds-section-title text-[14px] capitalize">
                  {moduleName}
                </span>
              </Checkbox>
              <span className="ds-caption">
                {selectedCount}/{groupPerms.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-2">
              {groupPerms.map((p) => (
                <Checkbox
                  key={p.id}
                  checked={selected.has(p.id)}
                  onChange={(e) => togglePermission(p.id, e.target.checked)}
                >
                  <span title={p.permission_key}>{p.display_name}</span>
                </Checkbox>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
