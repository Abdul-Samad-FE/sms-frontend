import React from 'react';
import { ContentCard, MonoCell, StatusTag } from '../../../components/ui';

/**
 * @typedef {import('../../../api/dashboard').DashboardSchoolInfo} DashboardSchoolInfo
 */

/** One label/value row of the info list. */
function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 border-b border-[var(--border-subtle)] last:border-b-0">
      <dt className="ds-label">{label}</dt>
      <dd className="m-0 text-sm text-[var(--foreground)] break-words">
        {children || <span className="ds-cell-empty">—</span>}
      </dd>
    </div>
  );
}

/**
 * School identity panel. Renders the tenant's details, or a "global view"
 * notice when `school` is null (superadmin spanning every school).
 *
 * @param {{ school?: DashboardSchoolInfo|null }} props
 */
export default function SchoolInfoCard({ school }) {
  return (
    <ContentCard
      title="School Information"
      extra={!school && <StatusTag tone="accent">Global view</StatusTag>}
      className="h-full"
    >
      {school ? (
        <dl className="m-0">
          <InfoRow label="Name">{school.name}</InfoRow>
          <InfoRow label="EMIS Code">
            <MonoCell>{school.emis_code}</MonoCell>
          </InfoRow>
          <InfoRow label="Union Council">{school.uc_name}</InfoRow>
          <InfoRow label="Address">{school.address}</InfoRow>
        </dl>
      ) : (
        <p className="ds-caption m-0 text-sm">
          You are viewing aggregated statistics across all schools.
        </p>
      )}
    </ContentCard>
  );
}
