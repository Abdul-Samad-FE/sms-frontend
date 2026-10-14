import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * The attendance day lives in the URL (`?date=YYYY-MM-DD`) so list, view and
 * mark pages share it, links are bookmarkable, and Back keeps the same day.
 * Missing, invalid or future dates fall back to today.
 *
 * @returns {{ date: import('dayjs').Dayjs, dateStr: string,
 *   setDate: (d: import('dayjs').Dayjs|null) => void }}
 */
export default function useAttendanceDate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('date');

  const date = useMemo(() => {
    // ISO YYYY-MM-DD parses natively (no customParseFormat plugin needed).
    const parsed = raw ? dayjs(raw) : null;
    if (!parsed || !parsed.isValid() || parsed.isAfter(dayjs(), 'day')) {
      return dayjs().startOf('day');
    }
    return parsed.startOf('day');
  }, [raw]);

  const setDate = useCallback(
    (next) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next) params.set('date', next.format(DATE_FORMAT));
          else params.delete('date');
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return { date, dateStr: date.format(DATE_FORMAT), setDate };
}

/** antd DatePicker `disabledDate`: no attendance in the future. */
export const disableFutureDates = (current) =>
  current && current.isAfter(dayjs(), 'day');
