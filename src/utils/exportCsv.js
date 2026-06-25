/**
 * CSV export helpers — no external dependency, RFC-4180 quoting, Excel-friendly
 * (UTF-8 BOM so accented characters render correctly).
 */

/**
 * @typedef {Object} CsvColumn
 * @property {string} header  Column heading in the output file.
 * @property {string} [key]   Property name to read from each row.
 * @property {(row: any) => unknown} [accessor]  Derives the cell value (takes
 *   precedence over `key` — use for computed/looked-up values).
 */

/** Quote a single cell per RFC 4180 when it contains a comma, quote or newline. */
function escapeCell(value) {
  if (value == null) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serialise rows to a CSV string.
 *
 * @param {CsvColumn[]} columns
 * @param {any[]} rows
 * @returns {string}
 */
export function toCsv(columns, rows) {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(',');
  const dataLines = rows.map((row) =>
    columns
      .map((c) =>
        escapeCell(
          typeof c.accessor === 'function' ? c.accessor(row) : row[c.key]
        )
      )
      .join(',')
  );
  return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Build a CSV from rows and trigger a browser download.
 *
 * @param {string} filename  With or without a `.csv` extension.
 * @param {CsvColumn[]} columns
 * @param {any[]} rows
 */
export function exportToCsv(filename, columns, rows) {
  const csv = toCsv(columns, rows ?? []);
  const blob = new Blob([`﻿${csv}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
