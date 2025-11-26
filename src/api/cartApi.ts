import axiosClient from "../utils/axiosClient";
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from "../types/models/cart";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CartCountResponse {
  count: number;
}

const cartApi = {
  // Lấy giỏ hàng của user hiện tại
  getCart: () => {
    return axiosClient.get<ApiResponse<Cart>>("/cart");
  },

  // Thêm sản phẩm vào giỏ hàng
  addItem: (data: AddToCartRequest) => {
    return axiosClient.post<ApiResponse<Cart>>("/cart/items", data);
  },

  // Cập nhật số lượng sản phẩm
  updateItemQuantity: (productId: string, data: UpdateCartItemRequest) => {
    return axiosClient.put<ApiResponse<Cart>>(`/cart/items/${productId}`, data);
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeItem: (productId: string) => {
    return axiosClient.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: () => {
    return axiosClient.delete<ApiResponse<Cart>>("/cart");
  },

  // Lấy số lượng items trong giỏ hàng (cho badge)
  getCartItemCount: () => {
    return axiosClient.get<ApiResponse<CartCountResponse>>("/cart/count");
  },
};

export default cartApi;
