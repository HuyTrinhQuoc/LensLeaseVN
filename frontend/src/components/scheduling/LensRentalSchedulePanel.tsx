import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { enumerateInclusiveUtcYmds, calendarMonthFromYmd } from '../../utils/date-only';
import { BOOKING_SCHEDULE_UI } from './booking-schedule-labels';
const POLL_MS = 45_000;

export type LensRentalSchedulePanelProps = {
  lensId?: string | null;
  startDate: string;
  endDate: string;
  quantity?: number;
  /** Khi có — hiển thị ô ngày và gọi khi đổi */
  onStartDateChange?: (v: string) => void;
  onEndDateChange?: (v: string) => void;
  productDetailHref?: string;
  variant?: 'default' | 'compact';
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
};

function normYmd(s: string) {
  return (s || '').split('T')[0];
}

export default function LensRentalSchedulePanel({
  lensId,
  startDate: startProp,
  endDate: endProp,
  quantity = 1,
  onStartDateChange,
  onEndDateChange,
  productDetailHref,
  variant = 'default',
  collapsible = false,
  defaultOpen = false,
  className = '',
}: LensRentalSchedulePanelProps) {
  const startDate = normYmd(startProp);
  const endDate = normYmd(endProp);
  const editable = Boolean(onStartDateChange && onEndDateChange);

  const [calendarMonth, setCalendarMonth] = useState(() => calendarMonthFromYmd(startDate || endDate));
  const [calendar, setCalendar] = useState<any | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarUpdatedAt, setCalendarUpdatedAt] = useState<number | null>(null);
  const [availability, setAvailability] = useState<{
    is_available?: boolean;
    available_quantity?: number;
  } | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [error, setError] = useState('');
  const calendarAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setCalendarMonth(calendarMonthFromYmd(startDate || endDate));
  }, [startDate, endDate]);

  const loadCalendar = useCallback(async () => {
    if (!lensId) return;
    calendarAbortRef.current?.abort();
    const ac = new AbortController();
    calendarAbortRef.current = ac;
    setCalendarLoading(true);
    try {
      const res = await bookingService.getCalendar(lensId, calendarMonth, { signal: ac.signal });
      const data = res.data?.data ?? res.data;
      setCalendar(data);
      setCalendarUpdatedAt(Date.now());
    } catch (e: unknown) {
      if ((e as { name?: string })?.name === 'CanceledError' || (e as { code?: string })?.code === 'ERR_CANCELED') {
        return;
      }
      setCalendar(null);
    } finally {
      setCalendarLoading(false);
    }
  }, [lensId, calendarMonth]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    if (variant === 'compact') return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      void loadCalendar();
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadCalendar, variant]);

  const fetchAvailability = useCallback(async () => {
    if (!lensId) return null;
    const res = await bookingService.checkAvailability(lensId, {
      start_date: startDate,
      end_date: endDate,
      quantity,
    });
    return (res.data?.data ?? res.data) as {
      is_available?: boolean;
      available_quantity?: number;
    };
  }, [lensId, startDate, endDate, quantity]);

  const calendarRangeConflict = useMemo(() => {
    if (!calendar?.days?.length || !startDate || !endDate) return null;
    const sy = startDate;
    const ey = endDate;
    if (sy > ey) return null;
    type CalDay = {
      date: string;
      status?: string;
      available_qty?: number;
    };
    const dayRows = calendar.days as CalDay[];
    const map = new Map<string, CalDay>(dayRows.map((x) => [x.date, x]));
    const noSlot: string[] = [];
    const outOfView: string[] = [];
    for (const ymd of enumerateInclusiveUtcYmds(sy, ey)) {
      const row = map.get(ymd);
      if (!row) {
        if (ymd.slice(0, 7) !== calendarMonth) outOfView.push(ymd);
        continue;
      }
      if (Number(row.available_qty ?? 0) < quantity) {
        noSlot.push(ymd);
      }
    }
    if (noSlot.length) return { kind: 'no_slot' as const, days: noSlot };
    if (outOfView.length) return { kind: 'out_of_view' as const, days: outOfView };
    return null;
  }, [calendar, startDate, endDate, calendarMonth, quantity]);

  const checkAvailability = async () => {
    if (!lensId) return;
    setCheckingAvail(true);
    setAvailability(null);
    setError('');
    try {
      const data = await fetchAvailability();
      setAvailability(data);
      if (data && data.is_available === false) {
        setError(BOOKING_SCHEDULE_UI.notEnoughSlots(data.available_quantity ?? 0));
      }
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || (e instanceof Error ? e.message : BOOKING_SCHEDULE_UI.errCheckFailed));
    } finally {
      setCheckingAvail(false);
    }
  };

  const legend = (s: string) => {
    const map: Record<string, string> = {
      AVAILABLE: 'bg-emerald-100 text-emerald-800',
      PARTIAL: 'bg-amber-100 text-amber-900',
      FULLY_BOOKED: 'bg-red-100 text-red-800',
      BLOCKED: 'bg-gray-200 text-gray-700',
    };
    return map[s] || 'bg-slate-100 text-slate-700';
  };

  const dayCellClass = (d: { status: string; available_qty?: number }) => {
    const q = Number(d.available_qty ?? 0);
    if (q < quantity) {
      return 'bg-red-100 text-red-900 ring-1 ring-red-300 font-semibold';
    }
    return legend(d.status || 'AVAILABLE');
  };

  const rangeOkOnCalendar = calendarRangeConflict?.kind !== 'no_slot';
  const href = productDetailHref || (lensId ? `/products/${lensId}` : '/products');

  const inner = (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm ${className}`}>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">{BOOKING_SCHEDULE_UI.monthLabel}</label>
          <input
            type="month"
            value={calendarMonth}
            onChange={(e) => setCalendarMonth(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void loadCalendar()}
          disabled={calendarLoading || !lensId}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {calendarLoading ? BOOKING_SCHEDULE_UI.refreshing : BOOKING_SCHEDULE_UI.refresh}
        </button>
      </div>

      {variant === 'default' && calendarUpdatedAt != null && (
        <p className="mb-2 text-[11px] text-gray-500">
          {BOOKING_SCHEDULE_UI.pollHint(POLL_MS / 1000)}{' '}
          {BOOKING_SCHEDULE_UI.updatedAt(
            new Date(calendarUpdatedAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          )}
        </p>
      )}

      {calendar?.days && (
        <div className="mb-3 max-h-36 overflow-y-auto rounded-lg border border-gray-100 p-2 text-[10px]">
          <p className="mb-1 font-medium text-gray-500">{BOOKING_SCHEDULE_UI.panelCalendarHint}</p>
          <div className="flex flex-wrap gap-1">
            {(calendar.days as {
              date: string;
              status: string;
              available_qty?: number;
              booked_qty?: number;
              total_quantity?: number;
            }[])
              .slice(0, 31)
              .map((d) => {
                const sy = startDate;
                const ey = endDate;
                const inRange = sy <= ey && d.date >= sy && d.date <= ey;
                return (
                  <span
                    key={d.date}
                    title={`${d.date}: còn ${d.available_qty ?? 0}`}
                    className={`rounded px-1 py-0.5 ${dayCellClass(d)} ${inRange ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                  >
                    {d.date.slice(8)}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {calendarRangeConflict?.kind === 'no_slot' && (
        <p className="mb-2 rounded-lg bg-red-50 px-2 py-2 text-xs text-red-800">
          {BOOKING_SCHEDULE_UI.conflictNoSlot(calendarRangeConflict.days.join(', '))}
        </p>
      )}
      {calendarRangeConflict?.kind === 'out_of_view' && (
        <p className="mb-2 rounded-lg bg-amber-50 px-2 py-2 text-xs text-amber-900">
          {BOOKING_SCHEDULE_UI.conflictOutOfView(calendarRangeConflict.days.slice(0, 3).join(', '))}
        </p>
      )}

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        {editable ? (
          <>
            <label className="text-xs text-gray-600">
              {BOOKING_SCHEDULE_UI.dateReceive}
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const v = e.target.value;
                  onStartDateChange!(v);
                  setCalendarMonth(calendarMonthFromYmd(v));
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
              />
            </label>
            <label className="text-xs text-gray-600">
              {BOOKING_SCHEDULE_UI.dateReturn}
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange!(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
              />
            </label>
          </>
        ) : (
          <div className="sm:col-span-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
            <span className="font-semibold text-gray-800">{BOOKING_SCHEDULE_UI.panelRangeReadonly}:</span>{' '}
            {startDate.split('-').reverse().join('/')} → {endDate.split('-').reverse().join('/')}
            {quantity > 1 && (
              <span className="ml-2 text-gray-500">
                (SL: {quantity})
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void checkAvailability()}
          disabled={checkingAvail || !lensId || !startDate || !endDate}
          className="rounded-lg border border-[#0b45b3] px-4 py-2 text-xs font-semibold text-[#0b45b3] hover:bg-blue-50 disabled:opacity-50"
        >
          {checkingAvail ? BOOKING_SCHEDULE_UI.checkingButton : BOOKING_SCHEDULE_UI.checkButton}
        </button>
        <Link to={href} className="text-xs font-semibold text-[#0b45b3] underline">
          {editable ? BOOKING_SCHEDULE_UI.linkOpenProduct : BOOKING_SCHEDULE_UI.linkChangeOnProduct}
        </Link>
      </div>

      {availability && availability.is_available === true && rangeOkOnCalendar && (
        <p className="mt-2 text-xs text-emerald-700">{BOOKING_SCHEDULE_UI.availOk}</p>
      )}
      {availability && availability.is_available === true && !rangeOkOnCalendar && (
        <p className="mt-2 text-xs text-amber-800">{BOOKING_SCHEDULE_UI.availMismatch}</p>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );

  if (!lensId) {
    return (
      <div className={`rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 ${className}`}>
        {BOOKING_SCHEDULE_UI.noLensId}{' '}
        <Link to="/products" className="font-semibold text-[#0b45b3] underline">
          {BOOKING_SCHEDULE_UI.browseProducts}
        </Link>
      </div>
    );
  }

  if (!collapsible) return inner;

  return (
    <details className="group" open={defaultOpen}>
      <summary className="cursor-pointer list-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#0b45b3]">calendar_month</span>
          {BOOKING_SCHEDULE_UI.collapsibleSummary}
          <span className="text-xs font-normal text-gray-500 group-open:hidden">{BOOKING_SCHEDULE_UI.collapsibleHint}</span>
        </span>
      </summary>
      <div className="mt-2">{inner}</div>
    </details>
  );
}
