/** Chuỗi giao diện dùng chung: sidebar sản phẩm + panel đặt lịch các trang khác. */

export const STALE_CALENDAR_PHRASE = 'Lịch vừa được cập nhật';

export const BOOKING_SCHEDULE_UI = {
  sectionTitle: 'Đặt lịch & kiểm tra lịch trống',
  sectionSubtitle:
    'Chọn ngày nhận và ngày trả, đối chiếu ô màu theo lịch thật, rồi bấm kiểm tra trước khi thêm giỏ.',

  monthLabel: 'Tháng xem lịch',
  refresh: 'Làm mới lịch',
  refreshing: '…',

  pollHint: (seconds: number) =>
    `Lịch tự cập nhật khoảng ${seconds}s khi tab đang mở; quay lại tab hoặc focus cửa sổ cũng tải lại để thấy chỗ vừa bị đặt.`,
  updatedAt: (time: string) => `Cập nhật: ${time}`,

  calendarStripTitle: 'Lịch theo từng ngày (trống / đã đặt)',
  calendarStripLegend:
    'Đỏ = hết chỗ (0). Vàng = còn một phần. Xanh = đủ máy. Viền xanh = ngày nằm trong khoảng bạn chọn.',

  conflictNoSlot: (days: string) =>
    `Trong khoảng đã chọn có ngày hết chỗ: ${days}. Vui lòng đổi ngày hoặc bấm Làm mới lịch.`,
  conflictOutOfView: (preview: string) =>
    `Một số ngày nằm ngoài tháng đang xem (${preview}…). Chọn đúng tháng ở ô phía trên hoặc bấm «Kiểm tra lịch còn trống».`,

  dateReceive: 'Ngày nhận máy',
  dateReturn: 'Ngày trả máy',

  checkButton: 'Kiểm tra lịch còn trống',
  checkingButton: 'Đang kiểm tra lịch…',

  availOk: 'Khoảng ngày này còn trống — có thể thêm vào giỏ hàng.',
  availMismatch:
    'API báo còn chỗ nhưng ô lịch tháng không khớp khoảng ngày — bấm Làm mới lịch hoặc đổi tháng xem.',

  rentalLine: (days: number) => `Tiền thuê (${days} ngày)`,
  depositLine: 'Tiền cọc giữ chỗ (ký quỹ)',
  insuranceLine: 'Phí bảo hiểm ước tính (giao diện)',
  subtotal: 'Tạm tính',

  addToCart: 'Thêm vào giỏ hàng',
  bookNow: 'Đặt ngay',
  processing: 'Đang xử lý…',
  viewCart: 'Xem giỏ hàng',

  errPickDates: 'Vui lòng chọn ngày nhận và ngày trả.',
  errEndBeforeStart: 'Ngày trả không được trước ngày nhận.',
  /** Khớp backend cart: end_date phải > start_date (không cho trùng một ngày). */
  errEndMustBeAfterStart: 'Ngày trả phải sau ngày nhận ít nhất một ngày (cùng một ngày không được chấp nhận khi thêm giỏ).',
  errStartPast: 'Ngày nhận không được trong quá khứ.',
  errLogin: 'Vui lòng đăng nhập để thêm giỏ hàng.',
  errCheckFailed: 'Không kiểm tra được lịch. Thử lại sau.',
  errAddCart: 'Không thêm được vào giỏ. Thử lại hoặc kiểm tra đăng nhập.',

  notEnoughSlots: (left: number) =>
    `Không đủ máy trong khoảng ngày đã chọn (còn ${left}).`,
  notEnoughSlotsStale: (left: number) =>
    `Không đủ máy trong khoảng ngày đã chọn (còn ${left}). ${STALE_CALENDAR_PHRASE} — đổi ngày hoặc bấm Làm mới lịch.`,
  noSlotFromCalendar: (days: string) =>
    `Các ngày ${days} đã hết chỗ theo lịch — đổi ngày hoặc bấm Làm mới lịch.`,

  collapsibleSummary: 'Kiểm tra lịch trống & đặt lịch',
  collapsibleHint: '(mở rộng)',

  panelCalendarHint: 'Ô theo ngày (đỏ = không đủ số lượng cần thuê)',
  panelRangeReadonly: 'Khoảng thuê',
  linkChangeOnProduct: 'Đổi ngày trên trang sản phẩm',
  linkOpenProduct: 'Mở trang sản phẩm',
  noLensId: 'Chưa có mã thiết bị để tải lịch.',
  browseProducts: 'Chọn thiết bị',

  /** UX nâng cao (sidebar / panel) */
  uxFlowSteps: '1) Chọn tháng xem ô màu  →  2) Chọn ngày nhận / trả  →  3) Kiểm tra lịch  →  4) Đặt ngay hoặc thêm giỏ.',
  uxAdvancedToggle: 'Chi tiết: tự làm mới lịch',
  uxQuickRentLabel: 'Gợi ý thời gian thuê (từ ngày nhận):',
  uxQuickRentDays: (n: number) => `${n} ngày`,
  uxCalendarLoading: 'Đang tải lịch tháng…',
  uxLiveRegionLabel: 'Kết quả kiểm tra lịch',

  uxAddDisabledProduct: 'Thiết bị đang tạm không cho thuê.',
  uxAddDisabledDates: 'Ngày nhận / trả chưa hợp lệ.',
  uxAddDisabledCalendar: 'Có ngày đã hết chỗ trong khoảng bạn chọn — đổi ngày hoặc làm mới lịch.',
  uxAddDisabledApi: 'Khoảng ngày không còn đủ máy — chọn ngày khác hoặc kiểm tra lại.',
} as const;
