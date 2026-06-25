import React from 'react';
import { Descriptions, Tag } from 'antd';

/**
 * @typedef {import('../../../api/dashboard').DashboardSchoolInfo} DashboardSchoolInfo
 */

/**
 * School identity panel. Renders the tenant's details, or a "global view"
 * notice when `school` is null (superadmin spanning every school).
 *
 * @param {{ school?: DashboardSchoolInfo|null }} props
 */
export default function SchoolInfoCard({ school }) {
  return (
    <div className="card-glass p-0 overflow-hidden outline-none border-[var(--card-border)] shadow-sm h-full">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center header-glass">
        <h3 className="text-lg font-semibold m-0 text-[var(--foreground)]">
          School Information
        </h3>
        {!school && <Tag color="purple">Global view</Tag>}
      </div>

      <div className="p-4">
        {school ? (
          <Descriptions column={1} size="small" colon>
            <Descriptions.Item label="Name">{school.name}</Descriptions.Item>
            <Descriptions.Item label="EMIS Code">
              <span className="font-mono">{school.emis_code}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Union Council">
              {school.uc_name}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {school.address || '—'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-[var(--muted-foreground)] text-sm m-0">
            You are viewing aggregated statistics across all schools.
          </p>
        )}
      </div>
    </div>
  );
}
