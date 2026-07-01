import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ProductItem } from "../../type/product.type";

interface ProductCardProps {
  item: ProductItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(
    Number(item.price_per_day) || 0,
  );
  const displayImage =
    item.thumbnail ||
    (item.images && item.images[0]?.image_url) ||
    "/placeholder.jpg";

  const [isCompared, setIsCompared] = useState<boolean>(false);

  useEffect(() => {
    const compareIds = JSON.parse(
      localStorage.getItem("compare_product_ids") || "[]",
    );
    setIsCompared(compareIds.includes(item.id));

    const handleStorageChange = () => {
      const updatedIds = JSON.parse(
        localStorage.getItem("compare_product_ids") || "[]",
      );
      setIsCompared(updatedIds.includes(item.id));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("compare_changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("compare_changed", handleStorageChange);
    };
  }, [item.id]);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let compareIds: string[] = JSON.parse(
      localStorage.getItem("compare_product_ids") || "[]",
    );

    if (compareIds.includes(item.id)) {
      compareIds = compareIds.filter((id) => id !== item.id);
    } else {
      if (compareIds.length >= 4) {
        alert("Bạn chỉ có thể chọn tối đa 4 thiết bị để so sánh cùng lúc!");
        return;
      }
      compareIds.push(item.id);
    }

    localStorage.setItem("compare_product_ids", JSON.stringify(compareIds));
    setIsCompared(!isCompared);

    window.dispatchEvent(new Event("compare_changed"));
  };

  return (
    <Link
      to={`/products/${item.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full relative"
    >
      {/* 1. Phần Hình Ảnh */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={displayImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 z-10 group/compare">
          <button
            onClick={handleCompareClick}
            className={`flex items-center gap-1 h-7 pl-1.5 pr-2.5 rounded-lg text-xs font-bold shadow-md backdrop-blur-sm transition-all duration-300 overflow-hidden max-w-[28px] hover:max-w-[120px] ${
              isCompared
                ? "bg-orange-600 text-white max-w-[120px]"
                : "bg-white/90 text-gray-700 hover:bg-orange-50"
            }`}
          >
            <span
              className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                isCompared ? "scale-110 text-white" : "text-gray-500"
              }`}
            >
              {isCompared ? "check" : "compare_arrows"}
            </span>

            <span
              className={`whitespace-nowrap transition-opacity duration-300 ${
                isCompared
                  ? "opacity-100"
                  : "opacity-0 group-hover/compare:opacity-100"
              }`}
            >
              {isCompared ? "Đã chọn" : "So sánh"}
            </span>
          </button>
        </div>

        <div
          className={`absolute top-3 left-28 px-2.5 py-1.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm z-10 ${item.available !== false ? "bg-blue-600/90 backdrop-blur-sm" : "bg-red-500/90 backdrop-blur-sm"}`}
        >
          {item.available !== false ? "CÓ SẴN NGAY" : "ĐÃ CHO THUÊ"}
        </div>

        {/* Nút tim Góc Phải */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm z-10">
          🤍
        </button>

        {/* Giá tiền - Góc dưới trái */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
          {formattedPrice}đ{" "}
          <span className="font-normal text-gray-500 text-xs">/ngày</span>
        </div>
      </div>

      {/* 2. Phần Thông Tin (Body) */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors min-h-[44px]">
            {item.title}
          </h3>
          {/* Rating Badge Nhỏ */}
          <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap">
            <span className="text-orange-500 text-[10px]">⭐</span>
            <span className="text-[11px] font-bold text-orange-700">
              {item.rating_avg != null && Number(item.rating_avg) > 0
                ? Number(item.rating_avg).toFixed(1)
                : "—"}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4 flex items-center gap-1 min-h-[16px]">
          <span className="material-symbols-outlined text-[14px]">
            location_on
          </span>
          {item.district ? `${item.district}, ${item.city}` : "Toàn quốc"}
        </div>

        {/* Footer Card */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            {item.brand || "Premium Brand"}
          </p>

          {/* Avatar Chủ máy */}
          <div
            className="w-8 h-8 rounded-full bg-slate-100 border border-gray-100 shadow-sm flex items-center justify-center text-xs overflow-hidden"
            title={item.owner?.full_name}
          >
            {item.owner?.avatar_url ? (
              <img
                src={item.owner.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-[10px]">👤</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
