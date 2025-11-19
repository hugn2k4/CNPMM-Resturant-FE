import axiosClient from "../utils/axiosClient";

export interface Review {
  _id: string;
  content: string;
  rate: number;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
  productId: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RatingStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const reviewApi = {
  // Lấy reviews của sản phẩm
  getByProduct: (
    productId: string,
    params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc" }
  ) => {
    return axiosClient.get<ReviewsResponse>(`/reviews/product/${productId}`, { params });
  },

  // Lấy reviews của user
  getByUser: (userId: string, params?: { page?: number; limit?: number }) => {
    return axiosClient.get<ReviewsResponse>(`/reviews/user/${userId}`, { params });
  },

  // Lấy thống kê rating
  getStats: (productId: string) => {
    return axiosClient.get<RatingStats>(`/reviews/stats/${productId}`);
  },

  // Tạo review mới
  create: (data: { productId: string; content: string; rate: number; images?: string[] }) => {
    return axiosClient.post<Review>("/reviews", data);
  },

  // Cập nhật review
  update: (id: string, data: { content?: string; rate?: number; images?: string[] }) => {
    return axiosClient.put<Review>(`/reviews/${id}`, data);
  },

  // Xóa review
  delete: (id: string) => {
    return axiosClient.delete(`/reviews/${id}`);
  },
};

export default reviewApi;
