import axiosClient from "../utils/axiosClient";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const wishlistApi = {
  // Get all product IDs in wishlist
  getWishlist: () => {
    return axiosClient.get<ApiResponse<string[]>>("/wishlist");
  },

  // Add product to wishlist
  addItem: (productId: string) => {
    return axiosClient.post<ApiResponse<void>>(`/wishlist/${productId}`);
  },

  // Remove product from wishlist
  removeItem: (productId: string) => {
    return axiosClient.delete<ApiResponse<void>>(`/wishlist/${productId}`);
  },

  // Get wishlist with full product details (for MyFavoritesPage)
  getWishlistWithProducts: (params?: { page?: number; limit?: number }) => {
    return axiosClient.get<ApiResponse<{ products: unknown[]; pagination: unknown }>>("/wishlist/products", { params });
  },
};

export default wishlistApi;
