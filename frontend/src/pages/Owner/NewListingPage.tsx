import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getUserIdFromToken } from "../../utils/auth";
import "../../styles/new-listing.css";
import toast from "react-hot-toast";

interface ConditionItem {
  id: string;
  label: string;
  checked: boolean;
}

export default function NewListingPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [productionYear, setProductionYear] = useState<number>(2024);
  const [description, setDescription] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [depositValue, setDepositValue] = useState("");
  const [insurancePackage, setInsurancePackage] = useState("Cơ bản (Đề xuất)");
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  const [focalLength, setFocalLength] = useState("");
  const [maxAperture, setMaxAperture] = useState("");
  const [mount, setMount] = useState("");
  const [sensorFormat, setSensorFormat] = useState("Full Frame");
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/lenses/categories/all");
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục từ DB:", error);
      }
    };

    fetchCategories();
  }, []);

  const [conditions, setConditions] = useState<ConditionItem[]>([
    { id: "sensor", label: "Cảm biến sạch", checked: true },
    { id: "body", label: "Thân máy không trầy xước", checked: true },
    { id: "lens", label: "Ống kính không mốc/rễ tre", checked: true },
    { id: "screen", label: "Màn hình không điểm chết", checked: false },
  ]);

  const handleToggleCondition = (id: string) => {
    setConditions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    setUploading(true);
    const uploadToastId = toast.loading(`Đang tải lên ${files.length} ảnh...`);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          console.error("Lỗi từ Cloudinary API:", data);
        }
      }

      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Lỗi kết nối upload Cloudinary:", error);
      toast.error("Có lỗi xảy ra trong quá trình tải ảnh lên đám mây!", {
        id: uploadToastId,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateProgress = () => {
    let score = 0;
    if (title.trim()) score += 15;
    if (brand.trim()) score += 10;
    if (categoryId) score += 15;
    if (city) score += 15;
    if (pricePerDay.trim()) score += 15;
    if (depositValue.trim()) score += 15;
    if (previewImages.length > 0) score += 15;
    return Math.min(score, 100);
  };

  const formatNumberString = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    return new Intl.NumberFormat("vi-VN").format(parseInt(cleanValue));
  };

  const handleSubmitListing = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này!"); 
      return;
    }

    if (!title || !brand || !pricePerDay || !categoryId || !city || !district) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)"); 
      return;
    }

    setLoading(true);
    const actionToastId = toast.loading("Đang xử lý đăng tin...");

    try {
      const activeConditions = conditions
        .filter((c) => c.checked)
        .map((c) => c.label)
        .join(", ");

      const requestData = {
        name: title,
        brand: brand,
        production_year: productionYear,
        serial_number: serialNumber,
        price_per_day: parseInt(pricePerDay.replace(/\D/g, ""), 10) || 0,
        deposit_value: parseInt(depositValue.replace(/\D/g, ""), 10) || 0,
        description: description,
        condition_details: activeConditions,
        images: previewImages,
        category_id: categoryId,
        city: city,
        district: district,
        ward: ward || "N/A",
        specs: {
          focal_length: focalLength || "N/A",
          max_aperture: maxAperture || "N/A",
          mount: mount || "N/A",
          sensor_format: sensorFormat,
        },
      };

      const response = await api.post("/lenses", requestData, {
        headers: {
          "x-user-id": userId,
        },
      });

      if (response.status === 201 || response.data) {
        toast.success("Đăng tin thiết bị thành công và đang chờ duyệt!", {
          id: actionToastId,
          duration: 4000,
        });
        
        navigate("/dashboard/my-listings");
      }
    } catch (error: any) {
      console.error("Lỗi khi đăng tin:", error);
      const errorMsg = error.response?.data?.message || "Đăng tin thất bại!";
      toast.error(errorMsg, { id: actionToastId }); 
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
        </header>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 lg:col-span-8 space-y-8 md:space-y-12">
            {/* SECTION 1: THÔNG TIN CƠ BẢN */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
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
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-b-2 focus:border-[#0040a1] transition-all text-sm"
                    placeholder="Ví dụ: Sony Alpha A7 IV hoặc Lens Sony 24-70mm f/2.8 GM II"
                    type="text"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Hãng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ví dụ: Sony, Canon, Fujifilm..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-b-2 focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>

                {/* 🆕 Ô CHỌN DANH MỤC SẢN PHẨM MỚI THÊM */}
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Danh mục thiết bị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Năm sản xuất
                  </label>
                  <input
                    value={productionYear}
                    onChange={(e) => setProductionYear(Number(e.target.value))}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                    type="number"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-1">
                    Số seri (S/N)
                  </label>
                  <input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                    placeholder="S/N: 29384XXX"
                    type="text"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả về phụ kiện đi kèm, lưu ý khi sử dụng máy..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm resize-none"
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* SECTION 2: THÔNG SỐ KỸ THUẬT CHUYÊN SÂU (MỚI THÊM) */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">
                  Thông số kỹ thuật
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Ngàm thiết bị (Mount)
                  </label>
                  <input
                    type="text"
                    value={mount}
                    onChange={(e) => setMount(e.target.value)}
                    placeholder="Ví dụ: Sony E-mount, Canon RF, Nikon Z..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Định dạng cảm biến
                  </label>
                  <select
                    value={sensorFormat}
                    onChange={(e) => setSensorFormat(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  >
                    <option value="Full Frame">Full Frame</option>
                    <option value="APS-C (Crop)">APS-C (Crop)</option>
                    <option value="Medium Format">Medium Format</option>
                    <option value="Micro Four Thirds">Micro Four Thirds</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Tiêu cự (Focal Length)
                  </label>
                  <input
                    type="text"
                    value={focalLength}
                    onChange={(e) => setFocalLength(e.target.value)}
                    placeholder="Ví dụ: 24-70mm, 50mm..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Khẩu độ lớn nhất (Max Aperture)
                  </label>
                  <input
                    type="text"
                    value={maxAperture}
                    onChange={(e) => setMaxAperture(e.target.value)}
                    placeholder="Ví dụ: f/2.8, f/1.4, f/4..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: VỊ TRÍ ĐỊA LÝ KHU VỰC CHO THUÊ (MỚI THÊM) */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">
                  Khu vực bàn giao máy
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ví dụ: TP. Hồ Chí Minh, Hà Nội..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Quận / Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ví dụ: Quận 1, Cầu Giấy..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#424654] uppercase tracking-wider mb-2">
                    Phường / Xã / Số nhà
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ví dụ: Phường Bến Nghé, Số 12..."
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4: TÌNH TRẠNG & ĐIỀU KIỆN */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">
                  Cam kết tình trạng linh kiện
                </h3>
              </div>
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
                      className="w-5 h-5 rounded text-[#0040a1] focus:ring-[#0040a1]"
                    />
                    <span className="text-sm font-medium text-[#191b23]">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* SECTION 5: CHÍNH SÁCH & GIÁ */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#0040a1] pl-4">
                <h3 className="text-lg md:text-xl font-bold font-headline">
                  Chính sách giá thuê
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
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
                    Gói bảo hiểm thiết bị
                  </label>
                  <select
                    value={insurancePackage}
                    onChange={(e) => setInsurancePackage(e.target.value)}
                    className="w-full bg-[#e1e2ec]/40 p-4 rounded-t-lg border-b-2 border-transparent focus:outline-none focus:border-[#0040a1] transition-all text-sm"
                  >
                    <option value="Cơ bản (Đề xuất)">Cơ bản (Đề xuất)</option>
                    <option value="Toàn diện (+15%)">Toàn diện (+15%)</option>
                    <option value="Không bảo hiểm">Không bảo hiểm</option>
                  </select>
                </div>
                <div className="col-span-2 p-6 rounded-xl bg-[#ffdad6]/40 border-2 border-dashed border-[#ba1a1a]/40">
                  <label className="flex items-center gap-2 text-xs font-extrabold text-[#ba1a1a] uppercase tracking-wider mb-3">
                    Trị giá máy (Dùng để tính đền bù nếu xảy ra sự cố){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-md">
                    <input
                      value={depositValue}
                      onChange={(e) =>
                        setDepositValue(formatNumberString(e.target.value))
                      }
                      className="w-full bg-white p-4 rounded-t-lg border-b-2 border-[#ba1a1a]/60 font-bold text-[#ba1a1a] focus:outline-none focus:border-[#ba1a1a] transition-all text-sm pr-12"
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

          {/* CỘT PHẢI: QUẢN LÝ ẢNH */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#e7e7f2]">
                <h3 className="text-base md:text-lg font-bold font-headline mb-5">
                  Hình ảnh thiết bị
                </h3>
                <div className="space-y-4">
                  <label className="aspect-square w-full rounded-xl border-2 border-dashed border-[#c3c6d6] bg-[#f2f3fe]/50 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[#0040a1] transition-colors relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0040a1] mb-2"></div>
                        <p className="text-sm font-bold text-[#0040a1]">
                          Đang tải lên...
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-2xl text-[#0040a1] mb-2">
                          add_a_photo
                        </span>
                        <p className="text-sm font-bold text-[#191b23]">
                          Nhấp để chọn ảnh từ máy tính
                        </p>
                        <p className="text-[11px] text-[#424654] mt-1">
                          (Hỗ trợ chọn nhiều file cùng lúc)
                        </p>
                      </>
                    )}
                  </label>

                  {previewImages.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-bold text-[#424654] uppercase tracking-wider mb-3">
                        Ảnh đã chọn ({previewImages.length})
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {previewImages.map((url, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border border-[#e7e7f2] group bg-gray-50"
                          >
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md opacity-90 transition-all flex items-center justify-center"
                              title="Xóa ảnh này"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>

                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-[#0040a1] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                Ảnh chính
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-16rem)] bg-white/90 backdrop-blur-md px-6 md:px-12 py-5 flex justify-end gap-6 items-center shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-40 border-t border-[#e7e7f2]">
        <div className="mr-auto hidden sm:block">
          <span className="text-xs font-bold text-[#424654] uppercase tracking-widest">
            Tiến độ hoàn tất
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
          className="px-6 py-3 text-sm font-bold text-[#424654]"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmitListing}
          disabled={loading}
          className="px-8 py-3 bg-[#0040a1] text-white text-sm font-bold rounded-lg shadow-xl disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng tin ngay"}
        </button>
      </footer>
    </div>
  );
}
