import React from 'react';
import { Checkbox, Empty } from 'antd';

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
    return <Empty description="No modules available." />;
  }

  return (
    <Checkbox.Group value={value} onChange={onChange} className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {modules.map((m) => (
          <Checkbox key={m.id} value={m.id}>
            {m.display_name}
          </Checkbox>
        ))}
      </div>
    </Checkbox.Group>
  );
}
