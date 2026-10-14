/**
 * Shared pagination contract for list endpoints that return the backend's
 * `Page[T]` envelope (every list endpoint) — tables drive it through
 * the global `usePagination` hook (src/hooks/usePagination.js).
 */

/** Largest `page_size` the API accepts (backend `MAX_PAGE_SIZE`). */
export const MAX_PAGE_SIZE = 1000;

/** Default rows per page for server-paginated tables. */
export const DEFAULT_PAGE_SIZE = 20;

/** Page-size choices offered by paginated tables. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * @typedef {Object} PageMeta
 * @property {number} total      Total matching rows across all pages
 * @property {number} page       1-based page number
 * @property {number} page_size
 * @property {number} pages      Total number of pages (>= 1)
 */

/**
 * @template T
 * @typedef {Object} Page
 * @property {T[]} items
 * @property {PageMeta} meta
 */
