import { useState, useEffect } from "react";
import { handoverService } from "../../services/handover.service";
import toast, { Toaster } from "react-hot-toast";
import SignatureCanvas from "./SignatureCanvas";

interface HandoverFormProps {
  bookingData: any;
  currentUserId: string | number;
  mode?: "checkin" | "checkout";
  viewOnly?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function HandoverForm({
  bookingData,
  currentUserId,
  mode,
  viewOnly = false,
  onSuccess,
  onCancel,
}: HandoverFormProps) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [noteCheckin, setNoteCheckin] = useState("");
  const [imagesCheckin, setImagesCheckin] = useState<string[]>([]);

  const [noteCheckout, setNoteCheckout] = useState("");
  const [imagesCheckout, setImagesCheckout] = useState<string[]>([]);
  const [isDamaged, setIsDamaged] = useState(false);

  const [signatureA, setSignatureA] = useState<string | null>(null);
  const [signatureB, setSignatureB] = useState<string | null>(null);
  const [signatureCheckout, setSignatureCheckout] = useState<string | null>(
    null,
  );

  const bookingId = bookingData?.id;
  const status = bookingData?.status;
  const renter = bookingData?.user;
  const owner = bookingData?.owner;
  const bookingItems = bookingData?.items || [];
  const handoverReport =
    bookingData?.handoverReport ||
    bookingData?.handover_report ||
    bookingData?.handover;

  // Xác định chế độ dựa trên prop mode truyền từ trang cha hoặc trạng thái ACTIVE của đơn hàng
  const isCheckOutMode = mode ? mode === "checkout" : status === "ACTIVE";

  // Chuẩn hóa chuỗi so sánh ID tài khoản tránh lỗi lệch kiểu dữ liệu UUID/String
  const cleanUserId = String(currentUserId || "")
    .trim()
    .toLowerCase();
  const cleanOwnerId = String(owner?.id || bookingData?.owner_id || "")
    .trim()
    .toLowerCase();
  const cleanRenterId = String(renter?.id || bookingData?.user_id || "")
    .trim()
    .toLowerCase();

  const isOwner = cleanOwnerId ? cleanUserId === cleanOwnerId : false;
  const isRenter = cleanRenterId ? cleanUserId === cleanRenterId : false;

  // Đồng bộ dữ liệu cũ từ Database đổ vào state cục bộ để hiển thị
  useEffect(() => {
    if (handoverReport) {
      if (handoverReport.note_checkin)
        setNoteCheckin(handoverReport.note_checkin);
      if (handoverReport.images_checkin)
        setImagesCheckin(handoverReport.images_checkin);
      if (handoverReport.note_checkout)
        setNoteCheckout(handoverReport.note_checkout);
      if (handoverReport.images_checkout)
        setImagesCheckout(handoverReport.images_checkout);
      if (typeof handoverReport.is_damaged === "boolean")
        setIsDamaged(handoverReport.is_damaged);
    }
  }, [handoverReport]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    try {
      setUploading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData },
        );

        const data = await res.json();
        if (data.secure_url) {
          newUrls.push(data.secure_url);
        }
      }

      if (isCheckOutMode) {
        setImagesCheckout((prev) => [...prev, ...newUrls]);
      } else {
        setImagesCheckin((prev) => [...prev, ...newUrls]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải tệp ảnh minh chứng lên hệ thống Cloudinary!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (isCheckOutMode) {
      setImagesCheckout((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImagesCheckin((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!agreed) return;

    // RÀNG BUỘC PHÁP LÝ CHỮ KÝ CHẶT CHẼ THEO ĐÚNG 3 BƯỚC TUẦN TỰ
    if (!isCheckOutMode) {
      // Giai đoạn giao máy Check-in
      if (isOwner && !handoverReport?.signature_a && !signatureA) {
        toast.error("Vui lòng vẽ ký xác nhận ở mục Bên A trước khi bàn giao!");
        return;
      }
      if (
        isRenter &&
        handoverReport?.signature_a &&
        !handoverReport?.signature_b &&
        !signatureB
      ) {
        toast.error(
          "Vui lòng vẽ ký nhận máy ở mục Bên B để kích hoạt đơn hàng!",
        );
        return;
      }
    } else {
      // Giai đoạn thu hồi máy Check-out (Chỉ cần duy nhất Owner ký nghiệm thu tài sản)
      if (
        isOwner &&
        !handoverReport?.signature_checkout &&
        !signatureCheckout
      ) {
        toast.error(
          "Vui lòng vẽ ký xác nhận thu hồi thiết bị ở ô Chữ ký Check-out!",
        );
        return;
      }
    }

    const loadingToast = toast.loading(
      "Hệ thống đang lưu trữ dữ liệu và trạng thái biên bản...",
    );
    try {
      setIsSubmitting(true);

      if (isCheckOutMode) {
        // Gửi dữ liệu đóng đơn mốc Check-out
        await handoverService.processCheckOut(bookingId, {
          note_checkout: noteCheckout,
          images_checkout: imagesCheckout,
          is_damaged: isDamaged,
          signature_checkout:
            signatureCheckout || handoverReport?.signature_checkout || null,
        });
        toast.dismiss(loadingToast);
        toast.success(
          "Nghiệm thu đóng đơn thành công! Trạng thái đơn đổi sang COMPLETED.",
        );
      } else {
        // Gửi dữ liệu ký mốc Check-in
        await handoverService.processCheckIn(bookingId, {
          note_checkin: noteCheckin || "",
          images_checkin: imagesCheckin,
          signature_a: signatureA || handoverReport?.signature_a || null,
          signature_b: signatureB || handoverReport?.signature_b || null,
        });
        toast.dismiss(loadingToast);

        if (isOwner && !handoverReport?.signature_a) {
          toast.success(
            "Đã lưu chữ ký Bên A, vui lòng nhắn Người thuê ký xác nhận.",
          );
        } else {
          toast.success(
            "Đơn hàng đã chính thức kích hoạt hoạt động.",
          );
        }
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Lưu thông tin biên bản bàn giao thất bại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Các biến kiểm tra trạng thái chữ ký cũ để khóa input tương ứng
  const hasOwnerSignedCheckIn = !!handoverReport?.signature_a;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-4xl mx-auto my-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* HEADER BIÊN BẢN */}
        <div
          className={`${isCheckOutMode ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"} border-b p-8 flex justify-between items-center`}
        >
          <div>
            <h2
              className={`text-xl font-extrabold tracking-tight mb-1 ${isCheckOutMode ? "text-red-700" : "text-[#0b45b3]"}`}
            >
              {isCheckOutMode
                ? "Biên Bản Nghiệm Thu & Nhận Lại Thiết Bị (Check-out)"
                : "Biên Bản Kiểm Tra & Bàn Giao Thiết Bị (Check-in)"}
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Mã đơn hàng:{" "}
              <span className="font-mono font-bold text-gray-800">
                #{String(bookingId).slice(0, 8).toUpperCase()}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">
              {isCheckOutMode
                ? bookingData?.end_date
                  ? new Date(bookingData.end_date).toLocaleDateString("vi-VN")
                  : "---"
                : bookingData?.start_date
                  ? new Date(bookingData.start_date).toLocaleDateString("vi-VN")
                  : "---"}
            </p>
            <p className="text-xs text-gray-400">
              {isCheckOutMode ? "Ngày thu hồi máy" : "Ngày bàn giao máy"}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* THÔNG TIN HAI BÊN THAM GIA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                Bên A (Bên Cho Thuê / Chủ máy)
              </h3>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-sm">
                <p>
                  <span className="text-gray-400 w-20 inline-block">
                    Họ Tên:
                  </span>{" "}
                  <span className="font-bold text-gray-800">
                    {owner?.full_name || "Chưa cập nhật"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400 w-20 inline-block">
                    Số ĐT:
                  </span>{" "}
                  <span className="font-medium text-gray-700">
                    {owner?.phone || "---"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400 w-20 inline-block">
                    Địa chỉ:
                  </span>{" "}
                  <span className="font-medium text-gray-700">
                    {owner?.address || "---"}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                Bên B (Bên Thuê / Khách hàng)
              </h3>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-sm">
                <p>
                  <span className="text-gray-400 w-20 inline-block">
                    Họ Tên:
                  </span>{" "}
                  <span className="font-bold text-gray-800">
                    {renter?.full_name || "Chưa cập nhật"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400 w-20 inline-block">
                    Số ĐT:
                  </span>{" "}
                  <span className="font-medium text-gray-700">
                    {renter?.phone || "---"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* KIỂM TRA THIẾT BỊ, HÌNH ẢNH MINH CHỨNG & NOTE */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
              Danh mục tài sản bàn giao nghiệm thu
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Danh sách sản phẩm của đơn hàng */}
              <div className="lg:col-span-6 space-y-3">
                {bookingItems.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        disabled
                        className="w-5 h-5 accent-emerald-600 rounded cursor-not-allowed"
                      />
                      <span className="font-semibold text-sm text-gray-800">
                        {item.lens?.title || "Thiết bị cho thuê"}
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      SL: {item.quantity}
                    </span>
                  </div>
                ))}

                {/* Khối check hư hỏng phát sinh mốc Check-out */}
                {isCheckOutMode && (
                  <div
                    className={`p-4 rounded-xl border mt-4 flex items-center justify-between ${isDamaged ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        Phát hiện thiết bị bị lỗi / hư hại mới?
                      </p>
                      <p className="text-xs text-gray-500">
                        Chỉ tích chọn nếu máy phát sinh trầy xước nặng/hỏng hóc
                        so với lúc giao.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isDamaged}
                      disabled={!isOwner}
                      onChange={(e) => setIsDamaged(e.target.checked)}
                      className="w-6 h-6 accent-red-600 rounded cursor-pointer disabled:opacity-50"
                    />
                  </div>
                )}
              </div>

              {/* Ô Nhập nội dung & Tải ảnh minh chứng chứng cứ */}
              <div className="lg:col-span-6 space-y-3">
                <textarea
                  value={isCheckOutMode ? noteCheckout : noteCheckin}
                  onChange={(e) =>
                    isCheckOutMode
                      ? setNoteCheckout(e.target.value)
                      : setNoteCheckin(e.target.value)
                  }
                  disabled={
                    (isCheckOutMode && !isOwner) ||
                    (!isCheckOutMode && hasOwnerSignedCheckIn)
                  }
                  placeholder={
                    isCheckOutMode
                      ? "Ghi chú tình trạng khi nhận lại thiết bị từ người thuê..."
                      : "Ghi chú ngoại hình lúc giao máy (VD: Có một vết xước mờ kính trước...)"
                  }
                  className="w-full h-24 p-3 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
                />

                {/* Nút upload ảnh bảo vệ vai trò */}
                <input
                  type="file"
                  id="handover-image-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={
                    uploading ||
                    (isCheckOutMode && !isOwner) ||
                    (!isCheckOutMode && hasOwnerSignedCheckIn)
                  }
                />
                <label
                  htmlFor="handover-image-upload"
                  className={`w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer transition ${uploading || (isCheckOutMode && !isOwner) || (!isCheckOutMode && hasOwnerSignedCheckIn) ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                >
                  <span>{uploading ? "" : ""}</span>
                  {uploading
                    ? "Đang tải ảnh lên..."
                    : `Đính kèm ảnh hiện trạng (${isCheckOutMode ? imagesCheckout.length : imagesCheckin.length} ảnh)`}
                </label>

                {/* Grid hiển thị hình ảnh hiện trạng theo từng mốc */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(isCheckOutMode ? imagesCheckout : imagesCheckin).map(
                    (url: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {((isCheckOutMode && isOwner) ||
                          (!isCheckOutMode &&
                            !hasOwnerSignedCheckIn &&
                            isOwner)) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ),
                  )}
                </div>

                {/* Nếu đang Check-out, hiển thị thêm box ảnh cũ lúc Check-in để tiện đối chiếu trực tiếp */}
                {isCheckOutMode && imagesCheckin.length > 0 && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Xem lại hình ảnh đối chứng ngoại hình mốc Check-in:
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {imagesCheckin.map((url, i) => (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          key={i}
                          className="aspect-square border border-gray-300 rounded overflow-hidden bg-white block"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* CAM KẾT PHÁP LÝ & KHU VỰC CHỮ KÝ */}
          <div className="space-y-6">
            {!viewOnly && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-blue-600 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600 select-none font-medium">
                  {isCheckOutMode
                    ? "Bên Cho Thuê (Chủ máy) xác nhận đã kiểm nghiệm thu và tiếp nhận lại đầy đủ thiết bị, phụ kiện từ Bên Thuê đúng số lượng cấu hình, biên bản này làm căn cứ quyết định hoàn trả tiền ký quỹ."
                    : "Tôi xác nhận đã kiểm tra đối chứng kỹ thực tế thiết bị trùng khớp danh mục, cam kết bảo quản tài sản vẹn toàn và hoàn trả đúng kỳ hạn quy định."}
                </span>
              </label>
            )}

            {/* GRID CHỮ KÝ GIAI ĐOẠN 1 VÀ 2 (CHECK-IN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* CHỮ KÝ BÊN A (OWNER) */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  Chữ ký Bên A (Chủ máy) - Giao máy
                </p>
                {handoverReport?.signature_a &&
                handoverReport.signature_a.trim() !== "" ? (
                  <img
                    src={handoverReport.signature_a}
                    alt="Signature A"
                    className="h-32 object-contain bg-white rounded-xl border p-1.5 shadow-2xs"
                  />
                ) : !isCheckOutMode && isOwner ? (
                  <SignatureCanvas
                    onSave={(base64) => setSignatureA(base64)}
                    placeholder="Chủ máy giữ chuột trái/vẽ nét ký tại đây"
                  />
                ) : (
                  <div className="h-32 w-full flex items-center justify-center text-xs text-gray-400 border border-dashed rounded-xl bg-white italic text-center px-4">
                    Chờ chủ thiết bị vào lập biên bản và ký giao máy mốc 1
                  </div>
                )}
              </div>

              {/* CHỮ KÝ BÊN B (RENTER) */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  Chữ ký Bên B (Người thuê) - Nhận máy
                </p>
                {handoverReport?.signature_b &&
                handoverReport.signature_b.trim() !== "" ? (
                  <img
                    src={handoverReport.signature_b}
                    alt="Signature B"
                    className="h-32 object-contain bg-white rounded-xl border p-1.5 shadow-2xs"
                  />
                ) : !isCheckOutMode ? (
                  handoverReport?.signature_a ? (
                    isRenter ? (
                      <SignatureCanvas
                        onSave={(base64) => setSignatureB(base64)}
                        placeholder="Người thuê vẽ ký xác nhận nhận máy"
                      />
                    ) : (
                      <div className="h-32 w-full flex items-center justify-center text-xs text-amber-700 font-bold border border-dashed border-amber-200 rounded-xl bg-amber-50 text-center px-4 animate-pulse">
                        Chờ tài khoản Người thuê đăng nhập vào vẽ ký mốc 2...
                      </div>
                    )
                  ) : (
                    <div className="h-32 w-full flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white font-medium px-4 text-center">
                      Khóa ô ký: Đang đợi Bên A lập biên bản trước.
                    </div>
                  )
                ) : (
                  <div className="h-32 w-full flex items-center justify-center text-xs text-gray-400 border border-dashed rounded-xl bg-white italic">
                    {handoverReport?.signature_b
                      ? "Đã ký mốc check-in"
                      : "Không có dữ liệu mốc nhận máy"}
                  </div>
                )}
              </div>
            </div>

            {/* MỐC 3: KHUNG CHỮ KÝ LÚC TRẢ MÁY (CHECK-OUT - CHỈ HIỂN THỊ KHI ĐƠN ĐANG ACTIVE) */}
            {isCheckOutMode && (
              <div className="mt-6 p-6 rounded-2xl border border-red-200 bg-red-50/10 flex flex-col items-center justify-center max-w-xl mx-auto shadow-2xs">
                <p className="text-xs font-extrabold text-red-700 mb-2 tracking-wide uppercase">
                  3. Chữ ký Bên A (Chủ máy) - Xác nhận nghiệm thu thu hồi
                  (Check-out)
                </p>
                {handoverReport?.signature_checkout &&
                handoverReport.signature_checkout.trim() !== "" ? (
                  <img
                    src={handoverReport.signature_checkout}
                    alt="Signature Checkout"
                    className="h-32 object-contain bg-white rounded-xl border border-gray-200 p-1.5 shadow-2xs"
                  />
                ) : isOwner ? (
                  <SignatureCanvas
                    onSave={(base64) => setSignatureCheckout(base64)}
                    placeholder="Chủ máy vẽ nét ký tiếp nhận lại thiết bị hoàn cọc"
                  />
                ) : (
                  <div className="h-32 w-full flex items-center justify-center text-xs text-red-700 font-semibold border border-dashed border-red-200 rounded-xl bg-white text-center px-4">
                    Đang chờ Chủ thiết bị (Bên A) kiểm tra máy thực tế và ký
                    nhận thu hồi tài sản...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER BUTTONS ACTION */}
        <div className="bg-gray-50 p-6 flex justify-end gap-4 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
            >
              Quay lại đơn
            </button>
          )}

          {!viewOnly && ( 
          <button
            type="button"
            disabled={
              !agreed ||
              isSubmitting ||
              uploading ||
              (!isCheckOutMode && isRenter && !handoverReport?.signature_a) || 
              (isCheckOutMode && !isOwner) 
            }
            onClick={handleSubmit}
            className={`px-8 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition shadow-md ${
              agreed && !isSubmitting && !uploading
                ? isCheckOutMode
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
                  : "bg-[#0b45b3] text-white hover:bg-blue-700 shadow-blue-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            <span>{isSubmitting ? "" : ""}</span>
            {isSubmitting
              ? "Đang xử lý biên bản..."
              : isCheckOutMode
                ? "Xác nhận thu hồi máy (Check-out)"
                : !handoverReport?.signature_a
                  ? "Ký tên & Gửi biên bản Bên A"
                  : "Ký nhận máy & Kích hoạt đơn hàng"}
          </button>
          )}
        </div>
      </div>
    </>
  );
}
