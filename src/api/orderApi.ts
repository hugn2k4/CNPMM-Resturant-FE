import type { CreateOrderRequest, Order, OrderListResponse } from "../types/models/order";
import type { ApiResponse } from "../types/responses/api.response";
import axiosClient from "../utils/axiosClient";

const orderApi = {
  // Tạo đơn hàng mới
  createOrder: (data: CreateOrderRequest): Promise<ApiResponse<Order>> =>
    axiosClient.post("/orders", data).then((response) => response.data),

  // Lấy danh sách đơn hàng của user
  getMyOrders: (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<OrderListResponse>> =>
    axiosClient.get("/orders/my-orders", { params }).then((response) => response.data),

  // Lấy chi tiết đơn hàng
  getOrderDetail: (orderId: string): Promise<ApiResponse<Order>> =>
    axiosClient.get(`/orders/${orderId}`).then((response) => response.data),

  // Hủy đơn hàng
  cancelOrder: (orderId: string, reason?: string): Promise<ApiResponse<Order>> =>
    axiosClient.patch(`/orders/${orderId}/cancel`, { reason }).then((response) => response.data),

  // Xác nhận đã nhận hàng
  confirmReceived: (orderId: string): Promise<ApiResponse<Order>> =>
    axiosClient.patch(`/orders/${orderId}/confirm-received`).then((response) => response.data),
};

export default orderApi;
