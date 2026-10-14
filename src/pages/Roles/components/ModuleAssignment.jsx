import React from 'react';
import { Checkbox } from 'antd';
import { TableEmpty } from '../../../components/ui';

/**
 * @typedef {import('../../../api/admin').ModuleRecord} ModuleRecord
 */

/**
 * Controlled module-access picker — which sidebar modules this role unlocks.
 *
 * @param {{
 *   modules?: ModuleRecord[],
 *   value?: number[],
 *   onChange?: (ids: number[]) => void,
 * }} props
 */
export default function ModuleAssignment({
  modules = [],
  value = [],
  onChange,
}) {
  if (!modules.length) {
    return <TableEmpty text="No modules available." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="ds-label">Sidebar modules</span>
        <span className="ds-caption">
          {value.length}/{modules.length} selected
        </span>
      </div>
      <Checkbox.Group value={value} onChange={onChange} className="w-full">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.id}
              className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-2"
            >
              <Checkbox value={m.id}>{m.display_name}</Checkbox>
            </div>
          ))}
        </div>
      </Checkbox.Group>
    </div>
  );
}
