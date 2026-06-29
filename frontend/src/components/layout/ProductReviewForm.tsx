import { useState } from "react";
import { reviewService } from "../../services/review.service";
import { getUserIdFromToken } from "../../utils/auth"; 
import { toast } from "react-hot-toast";

interface ProductReviewFormProps {
  bookingId: string;
  lensId?: string;      
  reviewedUserId?: string;  
  targetName?: string;      
}

export default function ProductReviewForm({ 
  bookingId, 
  lensId, 
  reviewedUserId, 
  targetName 
}: ProductReviewFormProps) {
  const [rating, setRating] = useState<number>(5); 
  const [comment, setComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const isOwnerReviewing = !!reviewedUserId; 

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }
    
    const selfId = getUserIdFromToken();
    if (!selfId) {
      toast.error("Không tìm thấy thông tin phiên đăng nhập. Vui lòng thử lại!");
      return;
    }
    
    try {
      setLoading(true);
      
      await reviewService.createReview({
        booking_id: bookingId,
        lens_id: lensId || undefined,
        reviewed_user_id: reviewedUserId || undefined,
        rating: rating,
        comment: comment,
        reviewer_id: selfId 
      }); 
      
      toast.success(
        isOwnerReviewing 
          ? "Đã gửi đánh giá thành viên thành công!" 
          : "Đã gửi đánh giá sản phẩm thành công!"
      );
      setIsSubmitted(true);
      setComment("");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Gửi đánh giá thất bại hoặc bạn đã đánh giá rồi.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center text-green-700 font-medium text-sm">
        {isOwnerReviewing 
          ? "Cảm ơn chủ máy đã gửi đánh giá đóng góp cho cộng đồng người thuê! 🎉" 
          : "Cảm ơn bạn đã gửi đánh giá cho sản phẩm này! 🎉"
        }
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-1">
        {isOwnerReviewing ? "Đánh giá người thuê máy" : "Đánh giá thiết bị này"}
      </h3>
      {targetName && (
        <p className="text-xs text-gray-500 mb-4">
          Đối tượng: <span className="font-bold text-gray-700">{targetName}</span>
        </p>
      )}
      
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
          {isOwnerReviewing ? "Mức độ uy tín / ý thức của khách thuê:" : "Mức độ hài lòng của bạn:"}
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-2xl transition-transform hover:scale-110 focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-7 h-7 ${
                  star <= (hoverRating || rating) ? "text-amber-400" : "text-gray-200"
                }`}
              >
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 font-semibold">
            {rating} sao
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
          Nội dung nhận xét:
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            isOwnerReviewing 
              ? "Ví dụ: Khách giữ gìn máy cẩn thận, trả đúng giờ hẹn, giao tiếp lịch sự thiện chí..."
              : "Ví dụ: Thiết bị rất mới, kính trong không trầy xước, chủ máy nhiệt tình..."
          }
          className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent resize-none placeholder:text-gray-400"
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleSubmitReview}
        className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition disabled:opacity-50"
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </div>
  );
}