import React, { useState } from 'react';
import { Button, notification } from 'antd';
import { DownloadIcon } from './Icons';
import { exportToCsv } from '../utils/exportCsv';

/**
 * Reusable "Export CSV" button. Serialises rows using `columns` and triggers
 * a download.
 *
 * Pass `rows` for data already in memory (disabled when empty), or
 * `fetchRows` for server-paginated lists: it is called at click time so the
 * export contains every matching row, not just the page on screen.
 *
 * @param {{
 *   filename: string,
 *   columns: import('../utils/exportCsv').CsvColumn[],
 *   rows?: any[],
 *   fetchRows?: () => Promise<any[]>,
 *   disabled?: boolean,
 *   children?: React.ReactNode,
 * }} props
 */
export default function ExportCsvButton({
  filename,
  columns,
  rows = [],
  fetchRows,
  disabled = false,
  children,
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    let data = rows;
    if (fetchRows) {
      setExporting(true);
      try {
        data = await fetchRows();
      } catch (err) {
        notification.error({
          message: 'Export failed',
          description: err?.response?.data?.detail || err?.message,
        });
        return;
      } finally {
        setExporting(false);
      }
    }
    if (!data.length) {
      notification.info({ message: 'Nothing to export.' });
      return;
    }
    exportToCsv(filename, columns, data);
    notification.success({ message: `Exported ${data.length} row(s) to CSV.` });
  };

  return (
    <Button
      icon={<DownloadIcon className="w-4 h-4" />}
      onClick={handleExport}
      loading={exporting}
      disabled={disabled || (!fetchRows && rows.length === 0)}
    >
      {children || 'Export CSV'}
    </Button>
  );
}
