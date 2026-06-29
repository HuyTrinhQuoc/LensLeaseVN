import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LensRentalSchedulePanel from "../../components/scheduling/LensRentalSchedulePanel";
import HandoverForm from "../../components/layout/HandoverForm";
import { bookingService } from "../../services/booking.service";
import { getAuthToken, getUserIdFromToken } from "../../utils/auth";
import ProductReviewForm from "../../components/layout/ProductReviewForm"; // Component đánh giá số sao
import {
  addDaysUtcYmd,
  ymdFromApiDateField,
  VIETNAM_TIME_ZONE,
} from "../../utils/date-only";
import { Toaster, toast } from "react-hot-toast";

function formatMoney(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function formatDate(d: string | Date) {
  const ymd =
    typeof d === "string" ? /^(\d{4})-(\d{2})-(\d{2})/.exec(d.trim()) : null;
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "";
  return x.toLocaleDateString("vi-VN", { timeZone: VIETNAM_TIME_ZONE });
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ chủ máy duyệt",
  CONFIRMED: "Đã duyệt — chờ giao máy",
  ACTIVE: "Đang thuê",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
};

function lensThumb(lens: any): string {
  if (!lens) return "https://placehold.co/400x300/e2e8f0/64748b?text=Lens";
  if (lens.thumbnail) return lens.thumbnail;
  const img = lens.images?.[0];
  if (img?.image_url) return img.image_url;
  if (img?.url) return img.url;
  return "https://placehold.co/400x300/e2e8f0/64748b?text=Lens";
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [extendDate, setExtendDate] = useState("");
  const [showHandover, setShowHandover] = useState(false);

  const selfId = getUserIdFromToken();

  const load = useCallback(async () => {
    if (!id) return;
    if (!getAuthToken()) {
      setErr("Vui lòng đăng nhập.");
      loading && setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await bookingService.getById(id);
      const b = res.data?.data ?? res.data;
      setBooking(b);
      if (b?.end_date) {
        const endYmd = ymdFromApiDateField(b.end_date);
        setExtendDate(addDaysUtcYmd(endYmd, 1));
      }
    } catch (e: any) {
      setErr(e.response?.data?.message || e.message || "Không tải được đơn");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const isRenter = booking && selfId && booking.user_id === selfId;
  const isOwner = booking && selfId && booking.owner_id === selfId;

  const run = async (fn: () => Promise<unknown>, msg?: string) => {
    const loadingId = toast.loading("Đang xử lý yêu cầu...");
    setBusy(true);
    try {
      await fn();
      toast.dismiss(loadingId);
      if (msg) {
        let prodMsg = msg;
        if (msg.includes("Đã duyệt đơn")) {
          prodMsg = "Phê duyệt đơn đặt thuê thành công! Hệ thống đã khấu trừ số dư tài khoản người thuê.";
        } else if (msg.includes("Đã gửi xác nhận trả máy")) {
          prodMsg = "Đã gửi xác nhận hoàn trả thiết bị thành công.";
        } else if (msg.includes("Đã hủy đơn")) {
          prodMsg = "Đơn đặt thuê đã được hủy bỏ.";
        } else if (msg.includes("Đã từ chối đơn")) {
          prodMsg = "Đã từ chối đơn đặt thuê thiết bị.";
        } else if (msg.includes("Đã chấp nhận gia hạn")) {
          prodMsg = "Đã phê duyệt yêu cầu gia hạn thời gian thuê.";
        } else if (msg.includes("Đã từ chối gia hạn")) {
          prodMsg = "Đã từ chối yêu cầu gia hạn thời gian thuê.";
        } else if (msg.includes("Đã gửi yêu cầu gia hạn")) {
          prodMsg = "Yêu cầu gia hạn của bạn đã được gửi tới chủ thiết bị.";
        }
        toast.success(prodMsg);
      }
      await load();
    } catch (e: any) {
      toast.dismiss(loadingId);
      toast.error(e.response?.data?.message || e.message || "Thao tác thất bại");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Đang tải đơn…
      </div>
    );
  }

  if (err || !booking) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 text-center">{err || "Không có dữ liệu"}</p>
        <Link to="/history" className="text-[#0b45b3] font-semibold underline">
          Về lịch sử thuê
        </Link>
      </div>
    );
  }

  if (showHandover) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] py-8 px-4">
        <HandoverForm
          bookingData={booking}
          onCancel={() => setShowHandover(false)}
          onSuccess={() => {
            setShowHandover(false);
            void load();
          }}
        />
      </div>
    );
  }

  const lens = booking.items?.[0]?.lens;
  const lensId = lens?.id ?? booking.items?.[0]?.lens_id;
  const st = booking.status as string;
  const startYmd = String(booking.start_date || "").split("T")[0];
  const endYmd = String(booking.end_date || "").split("T")[0];

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-[#f4f7fa] pb-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Quay lại
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Thông tin thiết bị */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
              <img
                src={lensThumb(lens)}
                alt=""
                className="w-full sm:w-40 h-40 object-cover rounded-xl bg-gray-100"
              />
              <div className="flex-1">
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0b45b3] mb-2">
                  {STATUS_LABEL[st] || st}
                </span>
                <h1 className="text-xl font-extrabold text-gray-900">
                  {lens?.title || "Thiết bị"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Mã đơn:{" "}
                  <span className="font-mono font-semibold text-gray-800">
                    {booking.id.slice(0, 8)}…
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {formatDate(booking.start_date)} →{" "}
                  {formatDate(booking.end_date)}
                </p>
              </div>
            </div>

            {lensId && startYmd && endYmd && (
              <div className="px-6 pb-6 mt-4">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Lịch trống &amp; đặt lại
                </h3>
                <LensRentalSchedulePanel
                  lensId={lensId}
                  startDate={startYmd}
                  endDate={endYmd}
                  quantity={Number(booking.items?.[0]?.quantity) || 1}
                  productDetailHref={lensId ? `/products/${lensId}` : undefined}
                  variant="compact"
                  collapsible
                  defaultOpen={false}
                />
              </div>
            )}

            {/* Chi tiết thông tin hóa đơn */}
            <div className="p-6 space-y-3 text-sm border-b border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Người thuê</span>
                <span className="font-medium">
                  {booking.user?.full_name || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chủ máy</span>
                <span className="font-medium">
                  {booking.owner?.full_name || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng thanh toán</span>
                <span className="font-extrabold text-[#0b45b3]">
                  {formatMoney(Number(booking.total_price))}
                </span>
              </div>
              {booking.deposit_amount != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ký quỹ</span>
                  <span className="font-medium">
                    {formatMoney(Number(booking.deposit_amount))}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Loại cọc</span>
                <span className="font-medium">
                  {booking.selected_deposit_type}
                </span>
              </div>
            </div>

            {/* KHU VỰC ĐÁNH GIÁ SẢN PHẨM (Chỉ hiện khi Đơn hoàn thành COMPLETED và người xem là Người thuê Renter) */}
            {st === "COMPLETED" && isRenter && lensId && (
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <ProductReviewForm bookingId={booking.id} lensId={lensId} />
              </div>
            )}

            {/* Các Action Button điều hướng cho Chủ máy */}
            {isOwner && (
              <div className="p-6 space-y-4 bg-gray-50/80 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Chủ máy
                </h3>
                <div className="flex flex-wrap gap-2">
                  {st === "PENDING" && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () => bookingService.confirm(booking.id),
                            "Đã duyệt đơn (đã trừ ví người thuê nếu đủ số dư).",
                          )
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-50 hover:bg-emerald-700 transition"
                      >
                        Duyệt đơn
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          toast((t) => (
                            <div className="flex flex-col gap-3 p-1">
                              <p className="text-sm font-semibold text-gray-800 text-center">
                                Bạn chắc chắn muốn từ chối đơn đặt thuê này?
                              </p>
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => {
                                    toast.dismiss(t.id);
                                    void run(
                                      () => bookingService.reject(booking.id),
                                      "Đã từ chối đơn.",
                                    );
                                  }}
                                  className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 transition"
                                >
                                  Từ chối đơn
                                </button>
                                <button
                                  onClick={() => toast.dismiss(t.id)}
                                  className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition"
                                >
                                  Quay lại
                                </button>
                              </div>
                            </div>
                          ), { duration: 30000, id: "confirm-reject" });
                        }}
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-50 hover:bg-red-700 transition"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  {st === "CONFIRMED" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setShowHandover(true)}
                      className="rounded-xl bg-[#0b45b3] px-5 py-2.5 text-white text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                      Tiến hành bàn giao máy (Check-in)
                    </button>
                  )}

                  {st === "ACTIVE" && !booking.renter_returned && (
                    <div className="w-full space-y-2">
                      <span className="text-sm text-gray-500 italic block py-2.5 bg-white px-3 border border-gray-200 rounded-xl">
                        Hệ thống đang đợi người thuê bấm nút xác nhận "Tôi đã hoàn trả thiết bị" trên ứng dụng...
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowHandover(true)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition"
                      >
                        Xem hoặc cập nhật biên bản bàn giao
                      </button>
                    </div>
                  )}

                  {st === "ACTIVE" && booking.renter_returned && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setShowHandover(true)}
                      className="w-full sm:w-auto rounded-xl bg-emerald-700 px-5 py-2.5 text-white text-sm font-semibold disabled:opacity-50 hover:bg-emerald-800 transition"
                    >
                      Kiểm tra máy &amp; Đóng đơn (Check-out)
                    </button>
                  )}

                  {booking.is_extension_requested &&
                    booking.extension_status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => bookingService.approveExtend(booking.id),
                              "Đã chấp nhận gia hạn.",
                            )
                          }
                          className="rounded-xl bg-[#0b45b3] px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
                        >
                          Chấp nhận gia hạn
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => bookingService.rejectExtend(booking.id),
                              "Đã từ chối gia hạn.",
                            )
                          }
                          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-gray-100 transition"
                        >
                          Từ chối gia hạn
                        </button>
                      </>
                    )}
                </div>
              </div>
            )}

            {/* Các Action Button điều hướng cho Người thuê */}
            {isRenter && (
              <div className="p-6 space-y-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Người thuê
                </h3>

                {st === "PENDING" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      toast((t) => (
                        <div className="flex flex-col gap-3 p-1">
                          <p className="text-sm font-semibold text-gray-800 text-center">
                            Bạn chắc chắn muốn hủy đơn đặt thuê này?
                          </p>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                toast.dismiss(t.id);
                                void run(
                                  () => bookingService.cancel(booking.id),
                                  "Đã hủy đơn.",
                                );
                              }}
                              className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 transition"
                            >
                              Hủy đơn
                            </button>
                            <button
                              onClick={() => toast.dismiss(t.id)}
                              className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition"
                            >
                              Quay lại
                            </button>
                          </div>
                        </div>
                      ), { duration: 30000, id: "confirm-cancel" });
                    }}
                    className="rounded-xl border border-red-200 text-red-700 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-red-50 transition"
                  >
                    Hủy đơn
                  </button>
                )}

                {st === "ACTIVE" && (
                  <div className="space-y-4">
                    {!booking.renter_returned ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          toast((t) => (
                            <div className="flex flex-col gap-3 p-1">
                              <p className="text-sm font-semibold text-gray-800 text-center">
                                Bạn xác nhận đã đem thiết bị đi trả cho chủ máy?
                              </p>
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => {
                                    toast.dismiss(t.id);
                                    void run(
                                      () => bookingService.renterReturn(booking.id),
                                      "Đã gửi xác nhận trả máy.",
                                    );
                                  }}
                                  className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition"
                                >
                                  Xác nhận trả
                                </button>
                                <button
                                  onClick={() => toast.dismiss(t.id)}
                                  className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition"
                                >
                                  Hủy bỏ
                                </button>
                              </div>
                            </div>
                          ), { duration: 60000, id: "confirm-return" });
                        }}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Tôi đã hoàn trả thiết bị
                      </button>
                    ) : (
                      <div className="text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">
                        Bạn đã bấm xác nhận hoàn trả thiết bị. Vui lòng chờ chủ máy nhận máy và đóng đơn.
                      </div>
                    )}

                    {booking.extension_status !== "PENDING" &&
                      booking.extension_status !== "APPROVED" && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-end border-t border-gray-100 pt-3">
                          <label className="flex flex-col text-xs text-gray-600 flex-1">
                            Hoặc ngày trả mới muốn xin gia hạn:
                            <input
                              type="date"
                              value={extendDate}
                              onChange={(e) => setExtendDate(e.target.value)}
                              className="mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                          </label>
                          <button
                            type="button"
                            disabled={busy || !extendDate}
                            onClick={() =>
                              run(
                                () =>
                                  bookingService.requestExtend(booking.id, {
                                    requested_end_date: extendDate,
                                  }),
                                "Đã gửi yêu cầu gia hạn.",
                              )
                            }
                            className="rounded-xl bg-gray-800 px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-50 h-fit hover:bg-gray-900 transition"
                          >
                            Xin gia hạn
                          </button>
                        </div>
                      )}
                  </div>
                )}

                {booking.extension_status === "PENDING" && (
                  <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    Yêu cầu xin gia hạn của bạn đang chờ chủ thiết bị duyệt.
                  </div>
                )}
              </div>
            )}

            {!isRenter && !isOwner && (
              <div className="p-6 text-sm text-amber-800 bg-amber-50">
                Bạn không phải người thuê hay chủ máy của đơn này (hoặc token không khớp).
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}