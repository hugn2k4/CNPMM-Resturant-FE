import productApi, { type GetProductsParams } from "../api/productApi";
import categoryApi from "../api/categoryApi";
import reviewApi from "../api/reviewApi";

const productService = {
  // Products
  async getProducts(params?: GetProductsParams) {
    try {
      const response = await productApi.getAll(params);
      return response.data?.data || { products: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    } catch (error) {
      console.error("Error in getProducts:", error);
      return { products: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
  },

  async getProductById(id: string) {
    try {
      const response = await productApi.getById(id);
      return response.data?.data || null;
    } catch (error) {
      console.error("Error in getProductById:", error);
      throw error;
    }
  },

  async getFeaturedProducts(limit?: number) {
    try {
      const response = await productApi.getFeatured(limit);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getFeaturedProducts:", error);
      return [];
    }
  },

  async getProductsByCategory(categoryId: string, page?: number, limit?: number) {
    try {
      const response = await productApi.getByCategory(categoryId, { page, limit });
      return response.data?.data || { products: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      return { products: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
  },

  // ===== API TRANG CHỦ =====

  async getHomePageData() {
    try {
      const response = await productApi.getHomePageData();
      return response.data?.data || { newest: [], bestSelling: [], mostViewed: [], topDiscount: [] };
    } catch (error) {
      console.error("Error in getHomePageData:", error);
      return { newest: [], bestSelling: [], mostViewed: [], topDiscount: [] };
    }
  },

  async getNewestProducts(limit?: number) {
    try {
      const response = await productApi.getNewest(limit);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getNewestProducts:", error);
      return [];
    }
  },

  async getBestSellingProducts(limit?: number) {
    try {
      const response = await productApi.getBestSelling(limit);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getBestSellingProducts:", error);
      return [];
    }
  },

  async getMostViewedProducts(limit?: number) {
    try {
      const response = await productApi.getMostViewed(limit);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getMostViewedProducts:", error);
      return [];
    }
  },

  async getTopDiscountProducts(limit?: number) {
    try {
      const response = await productApi.getTopDiscount(limit);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getTopDiscountProducts:", error);
      return [];
    }
  },

  // Categories
  async getCategories(isActive = true) {
    try {
      const response = await categoryApi.getAll(isActive);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getCategories:", error);
      return [];
    }
  },

  async getCategoryById(id: string) {
    const response = await categoryApi.getById(id);
    return response.data;
  },

  async getCategoryBySlug(slug: string) {
    const response = await categoryApi.getBySlug(slug);
    return response.data;
  },

  // Reviews
  async getProductReviews(productId: string, page?: number, limit?: number) {
    const response = await reviewApi.getByProduct(productId, { page, limit });
    return response.data;
  },

  async getReviewStats(productId: string) {
    const response = await reviewApi.getStats(productId);
    return response.data;
  },

  async createReview(productId: string, content: string, rate: number, images?: string[]) {
    const response = await reviewApi.create({ productId, content, rate, images });
    return response.data;
  },

  async updateReview(id: string, content?: string, rate?: number, images?: string[]) {
    const response = await reviewApi.update(id, { content, rate, images });
    return response.data;
  },

  async deleteReview(id: string) {
    const response = await reviewApi.delete(id);
    return response.data;
  },

  // Similar products
  async getSimilarProducts(id: string, limit?: number) {
    try {
      const response = await productApi.getSimilar(id, limit);
      return response.data?.data || [];
    } catch (error) {
      console.error("Error in getSimilarProducts:", error);
      return [];
    }
  },

  // Product view tracking
  async logProductView(id: string, sessionId?: string) {
    try {
      await productApi.logView(id, sessionId);
    } catch (error) {
      console.error("Error in logProductView:", error);
      // Don't throw, just log - view tracking is not critical
    }
  },

  async getRecentViews(sessionId?: string, limit?: number) {
    try {
      const response = await productApi.getRecent(sessionId, limit);
      return response.data?.data || { views: [], products: [] };
    } catch (error) {
      console.error("Error in getRecentViews:", error);
      return { views: [], products: [] };
    }
  },
};

export default productService;
