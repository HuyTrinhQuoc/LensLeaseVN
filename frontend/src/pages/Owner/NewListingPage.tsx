import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getUserIdFromToken } from "../../utils/auth";
import "../../styles/new-listing.css";

interface ConditionItem {
  id: string;
  label: string;
  checked: boolean;
}

// Danh sách các link ảnh mẫu từ Unsplash để hệ thống bốc ngẫu nhiên khi người dùng nhấn "Thêm ảnh"
const mockUnsplashImages = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616712134411-6b6ae89bc3ba?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502920917128-1aa2876c7eaa?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=600&auto=format&fit=crop"
];

export default function NewListingPage() {
  const navigate = useNavigate();

  // 1. Quản lý State cho các trường thông tin Form
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState(""); // Cho tự nhập tự do theo yêu cầu mới của bạn
  const [productionYear, setProductionYear] = useState<number>(2024);
  const [description, setDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [depositValue, setDepositValue] = useState(""); 
  const [insurancePackage, setInsurancePackage] = useState("Cơ bản (Đề xuất)");
  const [loading, setLoading] = useState(false);

  // Lưu danh sách đường dẫn chuỗi (String URL) thay vì File đối tượng
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [conditions, setConditions] = useState<ConditionItem[]>([
    { id: "sensor", label: "Cảm biến sạch", checked: true },
    { id: "body", label: "Thân máy không trầy xước", checked: true },
    { id: "lens", label: "Ống kính không mốc/rễ tre", checked: true },
    { id: "screen", label: "Màn hình không điểm chết", checked: false },
  ]);

  const handleToggleCondition = (id: string) => {
    setConditions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Logic bốc ngẫu nhiên một ảnh Unsplash khi bấm nút Thêm Ảnh
  const handleAddMockImage = () => {
    const randomIndex = Math.floor(Math.random() * mockUnsplashImages.length);
    const selectedUrl = mockUnsplashImages[randomIndex];
    setPreviewImages((prev) => [...prev, selectedUrl]);
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateProgress = () => {
    let score = 0;
    if (title.trim()) score += 20;
    if (description.trim()) score += 20;
    if (pricePerDay.trim()) score += 20;
    if (depositValue.trim()) score += 20;
    if (previewImages.length > 0) score += 20;
    return score;
  };

  const formatNumberString = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    return new Intl.NumberFormat("vi-VN").format(parseInt(cleanValue));
  };

  // 2. Gửi request dạng JSON thuần xuống Backend
const handleSubmitListing = async () => {
    // 1. Lấy ID người dùng
    const userId = getUserIdFromToken();
    if (!userId) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này!");
      return;
    }

    // 2. Kiểm tra các trường bắt buộc (dựa trên các biến State bạn đã khai báo)
    if (!title || !brand || !pricePerDay) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Hãng, Giá thuê)!");
      return;
    }

    setLoading(true);
    try {
      const activeConditions = conditions
        .filter((c) => c.checked)
        .map((c) => c.label)
        .join(", ");

      // 3. Map dữ liệu từ các State riêng lẻ của bạn
      const requestData = {
        name: title,
        brand: brand,
        // Lưu ý: Đảm bảo Backend của bạn có nhận 'production_year' hoặc 'serial_number' không, 
        // nếu không thì để mặc định hoặc bỏ qua
        production_year: productionYear, 
        price_per_day: parseInt(pricePerDay.replace(/\D/g, ""), 10) || 0,
        deposit_value: parseInt(depositValue.replace(/\D/g, ""), 10) || 0,
        description: description,
        condition_details: activeConditions,
        images: previewImages, // Dùng biến previewImages bạn đã khai báo
      };

      // 4. Gọi API
      const response = await api.post("/lenses", requestData, {
        headers: {
          "x-user-id": userId,
        },
      });

      if (response.status === 201 || response.data) {
        alert("Đăng tin thiết bị mới thành công!");
        navigate("/dashboard/my-listings");
      }
    } catch (error: any) {
      console.error("Lỗi khi đăng tin:", error);
      alert(error.response?.data?.message || "Đăng tin thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f2f3fe] text-[#191b23] font-sans pb-32">
      <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <nav className="flex gap-2 text-xs text-[#424654] mb-3">
            <span className="cursor-pointer hover:text-[#0040a1]" onClick={() => navigate("/dashboard/my-listings")}>Thiết bị của tôi</span>
            <span>/</span>
            <span className="text-[#0040a1] font-medium">Đăng tin mới</span>
          </nav>
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-[#191b23]">
            Đăng thiết bị mới lên LensLease
          </h2>
        </header>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 lg:col-span-8 space-y-8 md:space-y-12">
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">Thông tin cơ bản</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">Tên máy / Thiết bị <span className="text-red-500">*</span></label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-b-2 focus:border-[#0040a1] transition-all text-sm"
                    placeholder="Ví dụ: Sony Alpha A7 IV"
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">Hãng</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ví dụ: Sony, Canon..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-b-2 focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">Năm sản xuất</label>
                  <input
                    value={productionYear}
                    onChange={(e) => setProductionYear(Number(e.target.value))}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                    type="number"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">Mô tả chi tiết</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm resize-none"
                    rows={4}
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">Chi tiết kỹ thuật & Bảo mật</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-1">Số seri (S/N)</label>
                  <input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full max-w-sm bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                    placeholder="S/N: 29384XXX"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-4">Tình trạng linh kiện</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conditions.map((item) => (
                      <label key={item.id} className="flex items-center gap-3 p-4 border border-[#c3c6d6]/40 rounded-lg cursor-pointer hover:bg-[#f2f3fe] transition-colors select-none">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleCondition(item.id)}
                          className="w-5 h-5 rounded text-[#0040a1] focus:ring-[#0040a1]"
                        />
                        <span className="text-sm font-medium text-[#191b23]">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">Chính sách & Giá</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">Giá thuê theo ngày <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(formatNumberString(e.target.value))}
                      className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm pr-12 font-semibold"
                      placeholder="500.000"
                      type="text"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#424654]">VNĐ</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">Gói bảo hiểm</label>
                  <select value={insurancePackage} onChange={(e) => setInsurancePackage(e.target.value)} className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm">
                    <option value="Cơ bản (Đề xuất)">Cơ bản (Đề xuất)</option>
                    <option value="Toàn diện (+15%)">Toàn diện (+15%)</option>
                    <option value="Không bảo hiểm">Không bảo hiểm</option>
                  </select>
                </div>
                <div className="col-span-2 p-6 rounded-xl bg-[#ffdad6]/40 border-2 border-dashed border-[#ba1a1a]/40">
                  <label className="flex items-center gap-2 text-xs font-extrabold text-[#ba1a1a] uppercase tracking-wider mb-3">Giá đền bù nếu xảy ra sự cố <span className="text-red-500">*</span></label>
                  <div className="relative max-w-md">
                    <input
                      value={depositValue}
                      onChange={(e) => setDepositValue(formatNumberString(e.target.value))}
                      className="w-full bg-white p-4 rounded-t-lg border-b-2 border-[#ba1a1a]/60 font-bold text-[#ba1a1a] focus:outline-none focus:border-[#ba1a1a] transition-all text-sm pr-12"
                      placeholder="45.000.000"
                      type="text"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#ba1a1a]">VNĐ</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
                <h3 className="text-base md:text-lg font-bold font-headline mb-5">Hình ảnh thiết bị</h3>
                <div className="space-y-4">
                  {/* Khung click để chọn ảnh ngẫu nhiên từ Unsplash */}
                  <div 
                    onClick={handleAddMockImage}
                    className="aspect-square w-full rounded-xl border-2 border-dashed border-[#c3c6d6] bg-[#f2f3fe]/50 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[#0040a1] transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl text-[#0040a1] mb-2">add_a_photo</span>
                    <p className="text-sm font-bold text-[#191b23]">Nhấp để thêm ảnh mẫu</p>
                    <p className="text-[11px] text-[#424654] mt-1">(Hệ thống tự động lấy link ảnh Unsplash)</p>
                  </div>

                  {/* Vùng lặp kết quả link ảnh preview */}
                  <div className="grid grid-cols-3 gap-3">
                    {previewImages.map((src, index) => (
                      <div key={index} className="aspect-square rounded-lg bg-[#ededf8] overflow-hidden group relative border border-[#e7e7f2]">
                        <img alt="Preview" className="w-full h-full object-cover" src={src} />
                        <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-[#ba1a1a]">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-16rem)] bg-white/90 backdrop-blur-md px-6 md:px-12 py-5 flex justify-end gap-6 items-center shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-40 border-t border-[#e7e7f2]">
        <div className="mr-auto hidden sm:block">
          <span className="text-xs font-bold text-[#424654] uppercase tracking-widest">Tiến độ hoàn tất</span>
          <div className="w-48 h-1.5 bg-[#ededf8] rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-[#0040a1] transition-all duration-700" style={{ width: `${calculateProgress()}%` }}></div>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard/my-listings")} disabled={loading} className="px-6 py-3 text-sm font-bold text-[#424654]">Hủy</button>
        <button onClick={handleSubmitListing} disabled={loading} className="px-8 py-3 bg-[#0040a1] text-white text-sm font-bold rounded-lg shadow-xl">
          {loading ? "Đang xử lý..." : "Đăng tin ngay"}
        </button>
      </footer>
    </div>
  );
}