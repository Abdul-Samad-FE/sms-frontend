import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../api/pagination';

/**
 * Global pagination state for every server-paginated table.
 *
 * Owns `page` / `pageSize`, produces the `{ page, page_size }` query params
 * for the API, and builds the antd Table `pagination` prop from the
 * response's `meta`. Changing any value in `resetKeys` (search text,
 * filters…) jumps back to page 1, and if the current page falls past the
 * last page (e.g. after deleting the last row on it) it snaps back.
 *
 * @example
 *   const paging = usePagination({ resetKeys: [search, classId] });
 *   const query = useStudents({ ...paging.params, search, class_id: classId });
 *   <DataTable pagination={paging.tableProps(query.data?.meta)} ... />
 *
 * @param {{ initialPageSize?: number, resetKeys?: any[] }} [options]
 */
export function usePagination({
  initialPageSize = DEFAULT_PAGE_SIZE,
  resetKeys = [],
} = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to the first page whenever the filters behind the list change.
  const resetSignature = JSON.stringify(resetKeys);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPage(1);
  }, [resetSignature]);

  const reset = useCallback(() => setPage(1), []);

  const onChange = useCallback(
    (nextPage, nextSize) => {
      if (nextSize && nextSize !== pageSize) {
        setPageSize(nextSize);
        setPage(1);
      } else {
        setPage(nextPage);
      }
    },
    [pageSize]
  );

  const params = useMemo(
    () => ({ page, page_size: pageSize }),
    [page, pageSize]
  );

  /**
   * antd Table `pagination` prop for the given response meta.
   * @param {import('../api/pagination').PageMeta|undefined} meta
   */
  const tableProps = useCallback(
    (meta) => {
      // Snap back if the page no longer exists (rows deleted / filters).
      if (meta && meta.pages && page > meta.pages) {
        queueMicrotask(() => setPage(meta.pages));
      }
      return {
        current: page,
        pageSize,
        total: meta?.total ?? 0,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        hideOnSinglePage: false,
        onChange,
      };
    },
    [page, pageSize, onChange]
  );

  return { page, pageSize, params, setPage, reset, tableProps };
}

export default usePagination;
