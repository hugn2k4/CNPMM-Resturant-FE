import wishlistApi from "../api/wishlistApi";

const wishlistService = {
  // Get all product IDs in wishlist
  async getWishlist(): Promise<string[]> {
    try {
      const response = await wishlistApi.getWishlist();
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getWishlist:", error);
      return [];
    }
  },

  // Add product to wishlist
  async addItem(productId: string) {
    try {
      await wishlistApi.addItem(productId);
    } catch (error) {
      console.error("Error in addItem:", error);
      throw error;
    }
  },

  // Remove product from wishlist
  async removeItem(productId: string) {
    try {
      await wishlistApi.removeItem(productId);
    } catch (error) {
      console.error("Error in removeItem:", error);
      throw error;
    }
  },

  // Get wishlist with full product details
  async getWishlistWithProducts(params?: { page?: number; limit?: number }) {
    try {
      const response = await wishlistApi.getWishlistWithProducts(params);
      return response.data?.data || { products: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    } catch (error) {
      console.error("Error in getWishlistWithProducts:", error);
      return { products: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
  },
};

export default wishlistService;
