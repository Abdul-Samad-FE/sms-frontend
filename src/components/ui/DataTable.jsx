import React from 'react';
import { Table } from 'antd';
import { FileTextIcon } from '../Icons';

const DEFAULT_PAGINATION = {
  pageSize: 10,
  hideOnSinglePage: true,
  showSizeChanger: false,
  showTotal: (total, [from, to]) => `${from}–${to} of ${total}`,
};

/**
 * Themed empty state — antd's default Empty illustration disappears on the
 * dark theme, so we render a token-coloured icon + caption instead.
 */
export function TableEmpty({ text = 'No data' }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-[var(--muted-foreground)]">
      <FileTextIcon className="h-7 w-7 opacity-60" />
      <span className="ds-caption">{text}</span>
    </div>
  );
}

/**
 * antd Table with the project's shared defaults: one typography + padding
 * rhythm, horizontal scroll, 10-row pagination with a total, and a themed
 * empty state. Any antd Table prop can still be passed through.
 *
 * Place it inside a `ContentCard flush`, or pass `framed` to give a table
 * that sits directly on the page its own border + rounded corners.
 *
 * @param {import('antd').TableProps & {
 *   emptyText?: React.ReactNode,
 *   framed?: boolean,
 * }} props
 */
export default function DataTable({
  emptyText = 'No data',
  framed = false,
  pagination,
  scroll,
  locale,
  className = '',
  rowKey = 'id',
  ...rest
}) {
  const paginationProp =
    pagination === false
      ? false
      : { ...DEFAULT_PAGINATION, ...(pagination || {}) };

  return (
    <div
      className={`data-table ${framed ? 'data-table--framed' : ''} ${className}`}
    >
      <Table
        rowKey={rowKey}
        tableLayout="auto"
        pagination={paginationProp}
        scroll={{ x: 'max-content', ...(scroll || {}) }}
        locale={{
          emptyText:
            typeof emptyText === 'string' ? (
              <TableEmpty text={emptyText} />
            ) : (
              emptyText
            ),
          ...(locale || {}),
        }}
        {...rest}
      />
    </div>
  );
}
