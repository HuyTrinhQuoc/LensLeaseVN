import { useMemo } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Số trang hiển thị xung quanh trang hiện tại */
  siblingCount?: number;
}

/**
 * Component Pagination tái sử dụng cho toàn ứng dụng.
 * Thiết kế premium với hiệu ứng hover, active state rõ ràng,
 * và hỗ trợ rút gọn trang ("...") khi có quá nhiều trang.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  // Không render nếu chỉ có 1 trang hoặc ít hơn
  if (totalPages <= 1) return null;

  // Tính toán danh sách các trang hiển thị
  const pageRange = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5; // first + last + current + 2 dots + siblings

    // Nếu tổng số trang ít hơn tổng số nút cần hiển thị → hiện tất cả
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      // Nhiều trang bên trái, ít bên phải
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "dots-right", totalPages];
    }

    if (showLeftDots && !showRightDots) {
      // Ít trang bên trái, nhiều bên phải
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, "dots-left", ...rightRange];
    }

    // Cả hai bên đều có dots
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, "dots-left", ...middleRange, "dots-right", totalPages];
  }, [currentPage, totalPages, siblingCount]);

  return (
    <nav aria-label="Phân trang" className="flex justify-center items-center gap-1.5 select-none">
      {/* Nút Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        className="group relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all duration-200 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Danh sách các trang */}
      {pageRange.map((page, index) => {
        if (typeof page === "string") {
          // Dots separator
          return (
            <span
              key={page + index}
              className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm font-medium"
            >
              •••
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={isActive ? "page" : undefined}
            className={`
              relative w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm
              ${
                isActive
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              }
            `}
          >
            {page}
            {isActive && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-400 rounded-full opacity-60" />
            )}
          </button>
        );
      })}

      {/* Nút Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
        className="group relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all duration-200 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </nav>
  );
}
