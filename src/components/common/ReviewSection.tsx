import { useState, useEffect } from "react";
import reviewApi, { type Review, type ReviewsResponse, type RatingStats } from "../../api/reviewApi";
import { useGlobal } from "../../hooks/useGlobal";
import { useSnackbar } from "../../hooks/useSnackbar";
import LoginRequiredDialog from "./LoginRequiredDialog";
import Button from "./Button";

interface ReviewSectionProps {
  productId: string;
  orderId?: string; // Optional: nếu có orderId, sẽ đánh giá cho order cụ thể
}

export default function ReviewSection({ productId, orderId }: ReviewSectionProps) {
  const { isLogin } = useGlobal();
  const { showSnackbar } = useSnackbar();

  // Debug: log orderId để kiểm tra
  useEffect(() => {
    if (orderId) {
      console.log("ReviewSection received orderId:", orderId, "isLogin:", isLogin);
    }
  }, [orderId, isLogin]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getByProduct(productId, {
        page,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      // Backend returns: { success: true, message: '...', data: { reviews: [...], pagination: {...} } }
      // Axios wraps it: response.data = { success, message, data: ReviewsResponse }
      const apiResponse = response.data as { success?: boolean; data?: ReviewsResponse; message?: string };
      const data: ReviewsResponse = apiResponse.data || (apiResponse as unknown as ReviewsResponse);
      setReviews(data?.reviews || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showSnackbar("Không thể tải đánh giá", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reviewApi.getStats(productId);
      // Backend returns: { success: true, message: '...', data: { totalReviews, averageRating, ... } }
      // Axios wraps it: response.data = { success, message, data: RatingStats }
      const apiResponse = response.data as { success?: boolean; data?: RatingStats; message?: string };
      const data: RatingStats = apiResponse.data || (apiResponse as unknown as RatingStats);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      setShowLoginDialog(true);
      return;
    }

    if (!content.trim()) {
      showSnackbar("Vui lòng nhập nội dung bình luận", "error");
      return;
    }

    if (content.trim().length < 3) {
      showSnackbar("Nội dung bình luận quá ngắn (tối thiểu 3 ký tự)", "error");
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewApi.create({
        productId,
        content: content.trim(),
        rate: rating,
        ...(orderId && { orderId }), // Gửi orderId nếu có
      });

      // Backend returns: { success: true, message: '...', data: Review, points: {...} }
      const apiResponse = response.data as {
        success?: boolean;
        data?: Review;
        points?: { points: number; newBalance: number; message: string };
      };
      const points =
        apiResponse.points ||
        (response.data as { points?: { points: number; newBalance: number; message: string } })?.points;

      if (points) {
        showSnackbar(
          `🎉 Bình luận đã được gửi thành công! Bạn đã nhận được ${points.points} điểm. Số dư hiện tại: ${points.newBalance} điểm`,
          "success"
        );
      } else {
        showSnackbar("Bình luận đã được gửi thành công!", "success");
      }

      setContent("");
      setRating(5);
      // Refresh reviews
      await fetchReviews();
      await fetchStats();
    } catch (error: unknown) {
      console.error("Error creating review:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string; error?: string[] } } })?.response?.data?.message ||
        (error as { response?: { data?: { error?: string[] } } })?.response?.data?.error?.join(", ") ||
        "Không thể gửi bình luận. Vui lòng thử lại.";
      showSnackbar(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hôm nay";
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StarRating = ({
    rating,
    onRatingChange,
    interactive = false,
    size = "md",
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            disabled={!interactive}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <svg
              className={`${sizeClasses[size]} ${
                star <= (interactive ? hoveredRating || rating : rating) ? "text-yellow-400" : "text-gray-300"
              } fill-current transition-colors`}
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Rating Statistics */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-gray-900 mb-2">{stats.averageRating.toFixed(1)}</div>
              <StarRating rating={Math.round(stats.averageRating)} size="lg" />
              <p className="text-gray-600 mt-2">{stats.totalReviews} đánh giá</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-8">{star} sao</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Form (Only when orderId is provided - from order detail page) */}
      {orderId && isLogin && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Viết đánh giá</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">💝 Quà tặng đặc biệt!</p>
                  <p>
                    Mỗi đánh giá sẽ nhận được <strong>100 điểm</strong> (tương đương <strong>1,000 VND</strong>) để sử
                    dụng khi thanh toán đơn hàng tiếp theo!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
              <StarRating rating={rating} onRatingChange={setRating} interactive={true} size="lg" />
            </div>

            <div>
              <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung đánh giá
              </label>
              <textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
              <div className="mt-1 text-sm text-gray-500 text-right">{content.length}/1000 ký tự</div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi đánh giá"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Message when no orderId - only show reviews */}
      {!orderId && isLogin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-gray-700 text-sm">
            Để đánh giá sản phẩm, vui lòng vào trang <strong>Đơn hàng của tôi</strong> và chọn "Đánh giá" cho sản phẩm
            đã mua.
          </p>
        </div>
      )}

      {/* Login Prompt */}
      {!orderId && !isLogin && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Bạn cần đăng nhập để xem đánh giá</p>
          <Button onClick={() => setShowLoginDialog(true)} className="bg-orange-500 text-white hover:bg-orange-600">
            Đăng nhập
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tất cả đánh giá ({stats?.totalReviews || 0})</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
            <p className="text-gray-400 mt-2">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {review.userId.image ? (
                        <img
                          src={review.userId.image}
                          alt={review.userId.firstName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                          {review.userId.firstName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.userId.firstName} {review.userId.lastName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rate} size="sm" />
                            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap">{review.content}</p>

                      {review.isVerifiedPurchase && (
                        <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Đã mua hàng
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Login Dialog */}
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        message="Bạn cần đăng nhập để viết đánh giá. Vui lòng đăng nhập hoặc tạo tài khoản mới."
        returnUrl={`/products/${productId}`}
      />
    </div>
  );
}
