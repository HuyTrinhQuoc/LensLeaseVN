import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingService } from "../../services/booking.service";
import { useCart } from "../../context/CartContext";
import {
  calculateRentalDaysLocal,
  todayVietnamYmd,
  addDaysUtcYmd,
  enumerateInclusiveUtcYmds,
  calendarMonthFromYmd,
} from "../../utils/date-only";
import { BOOKING_SCHEDULE_UI, STALE_CALENDAR_PHRASE } from "../scheduling/booking-schedule-labels";

/** Snapshot hiển thị giỏ khách / merge sau đăng nhập (không bắt buộc khi đã login + chỉ gọi API). */
export type BookingLensCartMeta = {
  title: string;
  image_url?: string;
  brand?: string;
  category_name?: string;
  owner_name?: string;
  owner_rating?: number;
  allowed_deposit_types?: string[];
  required_deposit_amount?: number;
};

interface BookingSidebarProps {
  lensId: string;
  pricePerDay: number;
  available: boolean;
  depositAmount: number;
  marketValue?: number;
  lensMeta?: BookingLensCartMeta;
}

/** Axios: request bị `abort()` — không nên hiển thị chữ "canceled" cho người dùng. */
function isRequestAbortError(e: unknown): boolean {
  const x = e as { name?: string; code?: string; message?: string };
  return (
    x?.name === "CanceledError" ||
    x?.code === "ERR_CANCELED" ||
    (typeof x?.message === "string" && x.message.toLowerCase() === "canceled")
  );
}

/** Làm mới lịch khi có người khác đặt — không cần WebSocket. */
const CALENDAR_POLL_MS = 45_000;

export default function BookingSidebar({
  lensId,
  pricePerDay,
  available,
  depositAmount,
  marketValue,
  lensMeta,
}: BookingSidebarProps) {
  const navigate = useNavigate();
  const { addItem: addToCartContext } = useCart();
  const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

  const [startDate, setStartDate] = useState<string>(todayVietnamYmd());
  const [endDate, setEndDate] = useState<string>(() => addDaysUtcYmd(todayVietnamYmd(), 3));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => calendarMonthFromYmd(todayVietnamYmd()));
  const [calendar, setCalendar] = useState<any | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarUpdatedAt, setCalendarUpdatedAt] = useState<number | null>(null);
  const [availability, setAvailability] = useState<{
    is_available?: boolean;
    available_quantity?: number;
  } | null>(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  const calendarAbortRef = useRef<AbortController | null>(null);
  const availabilityAbortRef = useRef<AbortController | null>(null);

  const rentalDays = calculateRentalDaysLocal(startDate, endDate);
  const totalRental = pricePerDay * rentalDays;
  
  // Logic: Ưu tiên tính 50% giá trị máy nếu có marketValue, nếu không dùng depositAmount mặc định
  const deposit = marketValue ? (marketValue * 0.5) : (Number(depositAmount) || 0);
  const insuranceFee = marketValue ? (marketValue * 0.01) : 120000; // Bảo hiểm 1% giá trị máy hoặc 120k
  const grandTotal = totalRental + deposit + insuranceFee;

  const loadCalendar = useCallback(async () => {
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
      if (isRequestAbortError(e)) {
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
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      void loadCalendar();
    };
    const id = window.setInterval(tick, CALENDAR_POLL_MS);
    return () => window.clearInterval(id);
  }, [loadCalendar]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadCalendar();
    };
    const onFocus = () => void loadCalendar();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadCalendar]);

  const fetchAvailability = useCallback(async () => {
    availabilityAbortRef.current?.abort();
    const ac = new AbortController();
    availabilityAbortRef.current = ac;
    const res = await bookingService.checkAvailability(
      lensId,
      {
        start_date: startDate,
        end_date: endDate,
        quantity: 1,
      },
      { signal: ac.signal },
    );
    return (res.data?.data ?? res.data) as {
      is_available?: boolean;
      available_quantity?: number;
    };
  }, [lensId, startDate, endDate]);

  /** Sau mỗi lần lịch cập nhật — kiểm tra lại khoảng ngày đang chọn (không spinner). */
  const silentRecheckAvailability = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      const data = await fetchAvailability();
      setAvailability(data);
      if (data && data.is_available === false) {
        setError(BOOKING_SCHEDULE_UI.notEnoughSlotsStale(data.available_quantity ?? 0));
      } else {
        setError((prev) => (prev.includes(STALE_CALENDAR_PHRASE) ? "" : prev));
      }
    } catch (e: unknown) {
      if (isRequestAbortError(e)) {
        return;
      }
    }
  }, [fetchAvailability, startDate, endDate]);

  useEffect(() => {
    if (!calendar) return;
    const t = window.setTimeout(() => {
      void silentRecheckAvailability();
    }, 300);
    return () => window.clearTimeout(t);
  }, [calendar, silentRecheckAvailability]);

  useEffect(() => {
    setAvailability(null);
  }, [startDate, endDate]);

  useEffect(() => {
    const sy = startDate.split("T")[0];
    const ey = endDate.split("T")[0];
    if (!sy || !ey) return;
    if (ey < sy) {
      setEndDate(addDaysUtcYmd(sy, 1));
    }
  }, [startDate]);

  /** Đối chiếu khoảng ngày chọn với từng ô lịch API (cùng nguồn dữ liệu với màu ô). */
  const calendarRangeConflict = useMemo(() => {
    if (!calendar?.days?.length || !startDate || !endDate) return null;
    const sy = startDate.split("T")[0];
    const ey = endDate.split("T")[0];
    if (sy > ey) return null;
    type CalDay = { date: string; status?: string; available_qty?: number };
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
      if (Number(row.available_qty ?? 0) < 1) {
        noSlot.push(ymd);
      }
    }
    if (noSlot.length) return { kind: "no_slot" as const, days: noSlot };
    if (outOfView.length) return { kind: "out_of_view" as const, days: outOfView };
    return null;
  }, [calendar, startDate, endDate, calendarMonth]);

  const checkAvailability = async () => {
    setCheckingAvail(true);
    setAvailability(null);
    setError("");
    try {
      const data = await fetchAvailability();
      setAvailability(data);
      if (data && data.is_available === false) {
        setError(BOOKING_SCHEDULE_UI.notEnoughSlots(data.available_quantity ?? 0));
      }
      return data;
    } catch (e: any) {
      if (isRequestAbortError(e)) {
        return null;
      }
      setError(e.response?.data?.message || e.message || BOOKING_SCHEDULE_UI.errCheckFailed);
      return null;
    } finally {
      setCheckingAvail(false);
    }
  };

  const handleAddToCart = async () => {
    const sy = startDate.split("T")[0];
    const ey = endDate.split("T")[0];
    const todayStrCheck = todayVietnamYmd();

    if (!sy || !ey) {
      setError(BOOKING_SCHEDULE_UI.errPickDates);
      return;
    }
    if (sy > ey) {
      setError(BOOKING_SCHEDULE_UI.errEndBeforeStart);
      return;
    }
    if (ey <= sy) {
      setError(BOOKING_SCHEDULE_UI.errEndMustBeAfterStart);
      return;
    }
    if (sy < todayStrCheck) {
      setError(BOOKING_SCHEDULE_UI.errStartPast);
      return;
    }
    if (calendarRangeConflict?.kind === "no_slot") {
      setError(BOOKING_SCHEDULE_UI.noSlotFromCalendar(calendarRangeConflict.days.join(", ")));
      return;
    }
    try {
      setLoading(true);
      setError("");
      await loadCalendar();
      /**
       * Không dùng `fetchAvailability()` ở đây: nó gắn AbortController chung với
       * `silentRecheckAvailability` (sau khi `calendar` cập nhật). Hai luồng abort lẫn nhau
       * → Axios "canceled" hiện lên UI. Gọi API trực tiếp, không signal.
       */
      const availRes = await bookingService.checkAvailability(lensId, {
        start_date: sy,
        end_date: ey,
        quantity: 1,
      });
      const avail = (availRes.data?.data ?? availRes.data) as {
        is_available?: boolean;
        available_quantity?: number;
      };
      setAvailability(avail);
      if (avail && avail.is_available === false) {
        setLoading(false);
        setError(BOOKING_SCHEDULE_UI.notEnoughSlots(avail.available_quantity ?? 0));
        return;
      }

      const depAmt =
        marketValue != null && Number.isFinite(marketValue)
          ? Math.round(marketValue * 0.5)
          : Number(depositAmount) || 0;

      await addToCartContext({
        lens_id: lensId,
        quantity: 1,
        start_date: sy,
        end_date: ey,
        title: lensMeta?.title,
        image_url: lensMeta?.image_url,
        brand: lensMeta?.brand,
        category_name: lensMeta?.category_name,
        owner_name: lensMeta?.owner_name,
        owner_rating: lensMeta?.owner_rating,
        allowed_deposit_types: lensMeta?.allowed_deposit_types,
        required_deposit_amount: lensMeta?.required_deposit_amount ?? depAmt,
        price_per_day: pricePerDay,
      });

      void loadCalendar();
      navigate("/cart");
    } catch (err: unknown) {
      if (isRequestAbortError(err)) {
        setError("");
        return;
      }
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || (err instanceof Error ? err.message : BOOKING_SCHEDULE_UI.errAddCart));
    } finally {
      setLoading(false);
    }
  };

  const legend = (s: string) => {
    const map: Record<string, string> = {
      AVAILABLE: "bg-emerald-100 text-emerald-800",
      PARTIAL: "bg-amber-100 text-amber-900",
      FULLY_BOOKED: "bg-red-100 text-red-800",
      BLOCKED: "bg-gray-200 text-gray-700",
    };
    return map[s] || "bg-slate-100 text-slate-700";
  };

  /** Ô đỏ khi `available_qty === 0` — khóa đúng thực tế dù status từ API khác tên. */
  const dayCellClass = (d: { status: string; available_qty?: number }) => {
    const q = Number(d.available_qty ?? 0);
    if (q <= 0) {
      return "bg-red-100 text-red-900 ring-1 ring-red-300 font-semibold";
    }
    return legend(d.status || "AVAILABLE");
  };

  const rangeOkOnCalendar = calendarRangeConflict?.kind !== "no_slot";

  const updatedLabel =
    calendarUpdatedAt != null
      ? new Date(calendarUpdatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "—";

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-start justify-between border-b border-gray-100 pb-6 mb-6">
        <div>
          <span className="text-3xl font-extrabold text-gray-900">{formatPrice(pricePerDay)}đ</span>
          <span className="text-gray-500 text-sm font-medium"> / ngày</span>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            available !== false ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${available !== false ? "bg-emerald-500" : "bg-amber-500"}`} />
          {available !== false ? "Có sẵn" : "Tạm khoá"}
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-sm font-extrabold tracking-tight text-gray-900">{BOOKING_SCHEDULE_UI.sectionTitle}</h2>
        <p className="mt-1 text-[11px] leading-snug text-gray-500">{BOOKING_SCHEDULE_UI.sectionSubtitle}</p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">{BOOKING_SCHEDULE_UI.monthLabel}</label>
          <input
            type="month"
            value={calendarMonth}
            onChange={(e) => setCalendarMonth(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void loadCalendar()}
          disabled={calendarLoading}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {calendarLoading ? BOOKING_SCHEDULE_UI.refreshing : BOOKING_SCHEDULE_UI.refresh}
        </button>
      </div>
      <p className="mb-2 text-[11px] leading-snug text-gray-500">
        {BOOKING_SCHEDULE_UI.pollHint(CALENDAR_POLL_MS / 1000)}
        {calendarUpdatedAt != null && (
          <span className="ml-1 font-medium text-gray-600">{BOOKING_SCHEDULE_UI.updatedAt(updatedLabel)}</span>
        )}
      </p>

      {calendar?.days && (
        <div className="mb-4 rounded-lg border border-gray-100 p-2 text-[10px]">
          <p className="mb-1 font-medium text-gray-500">{BOOKING_SCHEDULE_UI.calendarStripTitle}</p>
          <p className="mb-1 text-[10px] text-gray-500">{BOOKING_SCHEDULE_UI.calendarStripLegend}</p>
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
                const sy = startDate.split("T")[0];
                const ey = endDate.split("T")[0];
                const inRange = sy <= ey && d.date >= sy && d.date <= ey;
                return (
                  <span
                    key={d.date}
                    title={`${d.date}: ${d.status} — còn ${d.available_qty ?? 0}/${d.total_quantity ?? "?"} (đã đặt ${d.booked_qty ?? 0})`}
                    className={`rounded px-1 py-0.5 ${dayCellClass(d)} ${inRange ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                  >
                    {d.date.slice(8)}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {calendarRangeConflict?.kind === "no_slot" && (
        <p className="mb-2 rounded-lg bg-red-50 px-2 py-2 text-xs text-red-800">
          {BOOKING_SCHEDULE_UI.conflictNoSlot(calendarRangeConflict.days.join(", "))}
        </p>
      )}
      {calendarRangeConflict?.kind === "out_of_view" && (
        <p className="mb-2 rounded-lg bg-amber-50 px-2 py-2 text-xs text-amber-900">
          {BOOKING_SCHEDULE_UI.conflictOutOfView(calendarRangeConflict.days.slice(0, 3).join(", "))}
        </p>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{BOOKING_SCHEDULE_UI.dateReceive}</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            const v = e.target.value;
            setStartDate(v);
            setCalendarMonth(calendarMonthFromYmd(v));
          }}
          className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{BOOKING_SCHEDULE_UI.dateReturn}</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={() => void checkAvailability()}
        disabled={checkingAvail}
        className="mb-3 w-full rounded-xl border border-[#0b45b3] py-2.5 text-sm font-semibold text-[#0b45b3] hover:bg-blue-50 disabled:opacity-50"
      >
        {checkingAvail ? BOOKING_SCHEDULE_UI.checkingButton : BOOKING_SCHEDULE_UI.checkButton}
      </button>
      {availability && availability.is_available === true && rangeOkOnCalendar && (
        <p className="mb-3 text-xs text-emerald-700">{BOOKING_SCHEDULE_UI.availOk}</p>
      )}
      {availability && availability.is_available === true && !rangeOkOnCalendar && (
        <p className="mb-3 text-xs text-amber-800">{BOOKING_SCHEDULE_UI.availMismatch}</p>
      )}

      <div className="mb-6 space-y-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{BOOKING_SCHEDULE_UI.rentalLine(rentalDays)}</span>
          <span className="font-medium text-gray-900">{formatPrice(totalRental)}đ</span>
        </div>
        {marketValue && (
          <div className="flex justify-between text-[11px] text-gray-500 italic mb-[-8px]">
            <span>Giá trị thiết bị (ước tính)</span>
            <span>{formatPrice(marketValue)}đ</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1">
            {marketValue ? "Ký quỹ bảo đảm (50%)" : BOOKING_SCHEDULE_UI.depositLine}
            <span className="material-symbols-outlined text-[16px] text-emerald-500" title="Được bảo hiểm & Sàn LensLease bảo vệ 100%">verified_user</span>
          </span>
          <span className="font-medium text-gray-900">{formatPrice(deposit)}đ</span>
        </div>
        <p className="mt-[-12px] text-[10px] font-medium text-emerald-600">
          * Ký quỹ an toàn 100% qua sàn, hoàn trả ngay khi kết thúc đơn.
        </p>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{BOOKING_SCHEDULE_UI.insuranceLine}</span>
          <span>{formatPrice(insuranceFee)}đ</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
          <span>{BOOKING_SCHEDULE_UI.subtotal}</span>
          <span>{formatPrice(grandTotal)}đ</span>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => void handleAddToCart()}
        disabled={loading || available === false}
        className="w-full rounded-xl bg-[#0b45b3] py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
      >
        {loading ? BOOKING_SCHEDULE_UI.processing : BOOKING_SCHEDULE_UI.addToCart}
      </button>

      <p className="mt-4 text-center text-xs text-gray-400">
        <Link to="/cart" className="font-semibold text-[#0b45b3]">
          {BOOKING_SCHEDULE_UI.viewCart}
        </Link>
      </p>
    </div>
  );
}
