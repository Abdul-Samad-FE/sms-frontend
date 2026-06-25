import React, { useMemo } from 'react';
import { Checkbox, Empty } from 'antd';

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
    return <Empty description="No permissions available." />;
  }

  return (
    <div className="flex flex-col gap-4 max-h-[45vh] overflow-y-auto pr-1">
      {groups.map(([moduleName, groupPerms]) => {
        const selectedCount = groupPerms.filter((p) =>
          selected.has(p.id)
        ).length;
        const allChecked = selectedCount === groupPerms.length;
        const indeterminate = selectedCount > 0 && !allChecked;
        return (
          <div
            key={moduleName}
            className="border border-[var(--border)] rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Checkbox
                checked={allChecked}
                indeterminate={indeterminate}
                onChange={(e) => toggleGroup(groupPerms, e.target.checked)}
              >
                <span className="font-semibold capitalize text-[var(--foreground)]">
                  {moduleName}
                </span>
              </Checkbox>
              <span className="text-[11px] text-[var(--muted-foreground)]">
                {selectedCount}/{groupPerms.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-6">
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
          </div>
        );
      })}
    </div>
  );
}
