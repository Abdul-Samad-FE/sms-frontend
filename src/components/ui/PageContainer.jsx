import React from 'react';

/**
 * Standard page frame: consistent gutters and vertical rhythm between the
 * page header, summary cards and content sections.
 *
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export default function PageContainer({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-6 px-4 py-5 md:px-8 md:py-7 min-h-screen max-w-[1600px] ${className}`}
    >
      {children}
    </div>
  );
}
