import React from 'react';
import { Button, notification } from 'antd';
import { DownloadIcon } from './Icons';
import { exportToCsv } from '../utils/exportCsv';

/**
 * Reusable "Export CSV" button. Serialises `rows` using `columns` and triggers
 * a download. Disabled automatically when there is nothing to export.
 *
 * @param {{
 *   filename: string,
 *   columns: import('../utils/exportCsv').CsvColumn[],
 *   rows: any[],
 *   disabled?: boolean,
 *   children?: React.ReactNode,
 * }} props
 */
export default function ExportCsvButton({
  filename,
  columns,
  rows = [],
  disabled = false,
  children,
}) {
  const handleExport = () => {
    if (!rows.length) {
      notification.info({ message: 'Nothing to export.' });
      return;
    }
    exportToCsv(filename, columns, rows);
    notification.success({ message: `Exported ${rows.length} row(s) to CSV.` });
  };

  return (
    <Button
      icon={<DownloadIcon className="w-4 h-4" />}
      onClick={handleExport}
      disabled={disabled || rows.length === 0}
    >
      {children || 'Export CSV'}
    </Button>
  );
}
