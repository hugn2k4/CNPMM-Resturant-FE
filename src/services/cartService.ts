import cartApi from "../api/cartApi";
import type { Cart, AddToCartRequest } from "../types/models/cart";

const cartService = {
  // Lấy giỏ hàng
  async getCart(): Promise<Cart | null> {
    try {
      const response = await cartApi.getCart();
      return response.data?.data || null;
    } catch (error) {
      console.error("Error in getCart:", error);
      throw error;
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addItem(productId: string, quantity: number = 1): Promise<Cart> {
    try {
      const data: AddToCartRequest = { productId, quantity };
      const response = await cartApi.addItem(data);
      return response.data?.data;
    } catch (error) {
      console.error("Error in addItem:", error);
      throw error;
    }
  },

  // Cập nhật số lượng sản phẩm
  async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    try {
      const response = await cartApi.updateItemQuantity(productId, { quantity });
      return response.data?.data;
    } catch (error) {
      console.error("Error in updateItemQuantity:", error);
      throw error;
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeItem(productId: string): Promise<Cart> {
    try {
      const response = await cartApi.removeItem(productId);
      return response.data?.data;
    } catch (error) {
      console.error("Error in removeItem:", error);
      throw error;
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(): Promise<Cart> {
    try {
      const response = await cartApi.clearCart();
      return response.data?.data;
    } catch (error) {
      console.error("Error in clearCart:", error);
      throw error;
    }
  },

  // Lấy số lượng items trong giỏ hàng
  async getCartItemCount(): Promise<number> {
    try {
      const response = await cartApi.getCartItemCount();
      return response.data?.data?.count || 0;
    } catch (error) {
      console.error("Error in getCartItemCount:", error);
      return 0;
    }
  },
};

export default cartService;
