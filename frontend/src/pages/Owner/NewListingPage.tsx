import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getUserIdFromToken } from "../../utils/auth";

interface ConditionItem {
  id: string;
  label: string;
  checked: boolean;
}

export default function NewListingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null); // Khai báo Ref để kích hoạt sự kiện chọn file từ máy tính

  // 1. Quản lý State cho các trường thông tin Form (Đã sẵn sàng)
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Sony");
  const [productionYear, setProductionYear] = useState<number>(2024);
  const [description, setDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [depositValue, setDepositValue] = useState(""); // Giá đền bù hư hỏng
  const [insurancePackage, setInsurancePackage] = useState("Cơ bản (Đề xuất)");
  const [loading, setLoading] = useState(false);

  // State quản lý danh sách file thực tế để gửi lên BE và mảng link ảnh ảo để hiển thị lên UI
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // State quản lý mảng tình trạng linh kiện (checkbox)
  const [conditions, setConditions] = useState<ConditionItem[]>([
    { id: "sensor", label: "Cảm biến sạch", checked: true },
    { id: "body", label: "Thân máy không trầy xước", checked: true },
    { id: "lens", label: "Ống kính không mốc/rễ tre", checked: true },
    { id: "screen", label: "Màn hình không điểm chết", checked: false },
  ]);

  // Thay đổi trạng thái checkbox linh kiện
  const handleToggleCondition = (id: string) => {
    setConditions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  // Logic xử lý khi người dùng nhấn chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // 1. Lưu file gốc vào state để sau này đẩy vào FormData gửi lên BE
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      // 2. Tạo URL ảo (Blob) tạm thời để hiển thị hình ảnh preview lập tức lên màn hình
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  // Logic xóa ảnh khi người dùng nhấn nút close (X) trên góc ảnh preview
  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Tính toán tiến độ hoàn tất form dựa vào các trường bắt buộc + có ảnh hay chưa
  const calculateProgress = () => {
    let score = 0;
    if (title.trim()) score += 20;
    if (description.trim()) score += 20;
    if (pricePerDay.trim()) score += 20;
    if (depositValue.trim()) score += 20;
    if (previewImages.length > 0) score += 20; // Thêm 20% tiến độ nếu có ảnh tải lên
    return score;
  };

  // Hàm định dạng hiển thị số có dấu chấm hàng nghìn khi gõ (Visual only)
  const formatNumberString = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    return new Intl.NumberFormat("vi-VN").format(parseInt(cleanValue));
  };

  // 2. Logic xử lý submit đăng tin lên Backend
  const handleSubmitListing = async () => {
    if (!title.trim() || !pricePerDay || !depositValue) {
      alert(
        "Vui lòng điền đầy đủ các thông tin bắt buộc (Tên máy, Giá thuê, Giá đền bù)!",
      );
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      return;
    }

    const rawPrice = parseInt(pricePerDay.replace(/\D/g, ""), 10);
    const rawDeposit = parseInt(depositValue.replace(/\D/g, ""), 10);

    try {
      setLoading(true);

      // Gói Payload JSON chuẩn bị truyền xuống API
      const payload = {
        title: title.trim(),
        brand: brand,
        description: `${description.trim()} [Năm SX: ${productionYear}] [S/N: ${serialNumber}] [Bảo hiểm: ${insurancePackage}]`,
        price_per_day: rawPrice,
        required_deposit_amount: rawDeposit,
        city: "TP. Hồ Chí Minh",
        district: "Quận 1",
        thumbnail:
          "https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?q=80&w=600&auto=format&fit=crop", // Ảnh mẫu (Sẽ cập nhật khi xử lý upload ở BE)
        owner_id: userId,
      };

      const response = await api.post("/lenses", payload);
      if (response.status === 201 || response.data) {
        alert(
          "🎉 Đăng tin cho thuê thiết bị thành công! Đang chờ quản trị viên duyệt.",
        );
        navigate("/dashboard/my-listings");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đăng tin:", error);
      alert(
        "Đã xảy ra lỗi hệ thống khi đăng tin. Vui lòng kiểm tra lại dữ liệu đầu vào!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f2f3fe] text-[#191b23] font-sans pb-32">
      <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <nav className="flex gap-2 text-xs text-[#424654] mb-3">
            <span
              className="cursor-pointer hover:text-[#0040a1]"
              onClick={() => navigate("/dashboard/my-listings")}
            >
              Thiết bị của tôi
            </span>
            <span>/</span>
            <span className="text-[#0040a1] font-medium">Đăng tin mới</span>
          </nav>
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-[#191b23]">
            Đăng thiết bị mới lên LensLease
          </h2>
          <p className="text-[#424654] mt-2 max-w-2xl text-sm leading-relaxed">
            Cung cấp chi tiết chính xác để tăng cơ hội tiếp cận khách hàng tiềm
            năng và đảm bảo an toàn cho thiết bị of bạn.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 lg:col-span-8 space-y-8 md:space-y-12">
            {/* Khối 1: Thông tin cơ bản */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 md:mb-8 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">
                  Thông tin cơ bản
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Tên máy / Thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-b-2 focus:border-[#0040a1] focus:bg-[#e1e2ec]/20 transition-all text-sm"
                    placeholder="Ví dụ: Sony Alpha A7 IV hoặc Ống kính Sony FE 24-70mm f/2.8 GM II"
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Hãng
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ví dụ: Sony, Canon, Fujifilm..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-b-2 focus:border-[#0040a1] focus:bg-[#e1e2ec]/20 transition-all text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Năm sản xuất
                  </label>
                  <input
                    value={productionYear}
                    onChange={(e) => setProductionYear(Number(e.target.value))}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                    placeholder="2024"
                    type="number"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm resize-none"
                    placeholder="Chia sẻ sâu về tình trạng ống kính/thân máy, số lượng pin đi kèm, hoặc các phụ kiện, filter hỗ trợ kèm theo khi thuê..."
                    rows={4}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Khối 2: Chi tiết kỹ thuật & Bảo mật */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 md:mb-8 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">
                  Chi tiết kỹ thuật & Bảo mật
                </h3>
              </div>
              <div className="space-y-6 md:space-y-8">
                <div>
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-1">
                    Số seri (S/N)
                  </label>
                  <p className="text-[11px] text-[#424654] mb-3 italic">
                    Thông tin này sẽ được hệ thống bảo mật và chỉ dùng để đối
                    soát khi có sự cố phát sinh.
                  </p>
                  <input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full max-w-sm bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                    placeholder="S/N: 29384XXX"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-4">
                    Tình trạng linh kiện hiện tại
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conditions.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-4 border border-[#c3c6d6]/40 rounded-lg cursor-pointer hover:bg-[#f2f3fe] transition-colors select-none"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleCondition(item.id)}
                          className="w-5 h-5 rounded border-[#c3c6d6] text-[#0040a1] focus:ring-[#0040a1]"
                        />
                        <span className="text-sm font-medium text-[#191b23]">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Khối 3: Chính sách & Giá */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 md:mb-8 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">
                  Chính sách & Giá
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Giá thuê theo ngày <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      value={pricePerDay}
                      onChange={(e) =>
                        setPricePerDay(formatNumberString(e.target.value))
                      }
                      className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm pr-12 font-semibold"
                      placeholder="500.000"
                      type="text"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#424654]">
                      VNĐ
                    </span>
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Gói bảo hiểm đề xuất
                  </label>
                  <select
                    value={insurancePackage}
                    onChange={(e) => setInsurancePackage(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  >
                    <option value="Cơ bản (Đề xuất)">Cơ bản (Đề xuất)</option>
                    <option value="Toàn diện (+15%)">Toàn diện (+15%)</option>
                    <option value="Không bảo hiểm (Rủi ro cao)">
                      Không bảo hiểm (Rủi ro cao)
                    </option>
                  </select>
                </div>

                <div className="col-span-2 p-5 md:p-6 rounded-xl bg-[#ffdad6]/40 border-2 border-dashed border-[#ba1a1a]/40">
                  <label className="flex items-center gap-2 text-xs font-extrabold text-[#ba1a1a] uppercase tracking-wider mb-3">
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      warning
                    </span>
                    Giá đền bù nếu xảy ra hư hỏng / mất mát thiết bị{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-[#424654] mb-4">
                    Mức phí đền bù này sẽ là căn cứ pháp lý cốt lõi để hệ thống
                    xử lý khi có sự cố nghiêm trọng xảy ra với thiết bị trong
                    quá trình cho thuê.
                  </p>
                  <div className="relative max-w-md">
                    <input
                      value={depositValue}
                      onChange={(e) =>
                        setDepositValue(formatNumberString(e.target.value))
                      }
                      className="w-full bg-white p-4 rounded-t-lg border-b-2 border-[#ba1a1a]/60 font-bold text-[#ba1a1a] focus:outline-none focus:border-[#ba1a1a] transition-all text-sm pr-12 shadow-sm"
                      placeholder="45.000.000"
                      type="text"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#ba1a1a]">
                      VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Cột phải: Khối Upload hình ảnh chiếm 4 cột */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
                <h3 className="text-base md:text-lg font-bold font-headline mb-5">
                  Hình ảnh thiết bị
                </h3>
                <div className="space-y-4">
                  {/* Thẻ input file ẩn được điều hướng bằng Ref để bắt sự kiện tải file của trình duyệt */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Khi nhấn vào khung kéo thả này, nó sẽ tự động kích hoạt click vào ô chọn file ẩn phía trên */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-full rounded-xl border-2 border-dashed border-[#c3c6d6] bg-[#f2f3fe]/50 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-[#0040a1] transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#0040a1]/10 flex items-center justify-center text-[#0040a1] mb-3 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-2xl">
                        add_a_photo
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#191b23]">
                      Kéo thả hoặc click để tải
                    </p>
                    <p className="text-[11px] text-[#424654] mt-1.5">
                      Tối thiểu 5 ảnh thực tế rõ góc cạnh (PNG, JPG)
                    </p>
                  </div>

                  {/* Lặp qua danh sách ảnh thực tế để hiển thị Preview động thay vì ảnh tĩnh (Hardcode) */}
                  <div className="grid grid-cols-3 gap-3">
                    {previewImages.map((src, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg bg-[#ededf8] overflow-hidden group relative border border-[#e7e7f2]"
                      >
                        <img
                          alt={`Product Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          src={src}
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-[#ba1a1a] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-xs font-bold">
                            close
                          </span>
                        </button>
                      </div>
                    ))}

                    {/* Ô bấm thêm nhanh nếu đã có ảnh trước đó */}
                    {previewImages.length > 0 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-[#c3c6d6] flex items-center justify-center text-[#424654] bg-[#f2f3fe]/20 hover:bg-[#ededf8] cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined font-bold">
                          add
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-[#f2f3fe]">
                  <h4 className="text-xs font-bold text-[#191b23] uppercase tracking-wide mb-3">
                    Mẹo đăng ảnh hút khách
                  </h4>
                  <ul className="text-[11px] space-y-2 text-[#424654] leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-[#0040a1] font-bold">01.</span> Chụp
                      thiết bị trong không gian đủ sáng tự nhiên.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0040a1] font-bold">02.</span> Thể
                      hiện rõ tình trạng ngàm, thấu kính trước sau và sensor.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0040a1] font-bold">03.</span> Đặt
                      máy trên nền đơn sắc trung tính để làm nổi bật sản phẩm.
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-16rem)] bg-white/90 backdrop-blur-md px-6 md:px-12 py-5 flex justify-end gap-6 items-center shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-40 border-t border-[#e7e7f2]">
        <div className="mr-auto hidden sm:block">
          <span className="text-xs font-bold text-[#424654] uppercase tracking-widest">
            Tiến độ hoàn tất form
          </span>
          <div className="w-48 h-1.5 bg-[#ededf8] rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[#0040a1] transition-all duration-700"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/my-listings")}
          disabled={loading}
          className="px-6 md:px-8 py-3 text-sm font-bold text-[#424654] hover:text-[#191b23] transition-colors disabled:opacity-50"
        >
          Hủy
        </button>

        <button
          onClick={handleSubmitListing}
          disabled={loading}
          className="px-8 md:px-10 py-3 bg-[#0040a1] text-white text-sm font-bold rounded-lg shadow-xl shadow-[#0040a1]/20 hover:bg-[#0056d2] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng tin ngay"}
        </button>
      </footer>
    </div>
  );
}
