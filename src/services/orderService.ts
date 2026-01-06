import orderApi from "../api/orderApi";
import type { CreateOrderRequest, Order, OrderListResponse } from "../types/models/order";

const orderService = {
  // Tạo đơn hàng mới
  async createOrder(data: CreateOrderRequest): Promise<Order | null> {
    try {
      const response = await orderApi.createOrder(data);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng
  async getMyOrders(params?: { page?: number; limit?: number; status?: string }): Promise<OrderListResponse | null> {
    try {
      const response = await orderApi.getMyOrders(params);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error("Error in getMyOrders:", error);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  async getOrderDetail(orderId: string): Promise<Order | null> {
    try {
      const response = await orderApi.getOrderDetail(orderId);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error("Error in getOrderDetail:", error);
      throw error;
    }
  },

  // Hủy đơn hàng
  async cancelOrder(orderId: string, reason?: string): Promise<Order | null> {
    try {
      const response = await orderApi.cancelOrder(orderId, reason);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error("Error in cancelOrder:", error);
      throw error;
    }
  },

  // Xác nhận đã nhận hàng
  async confirmReceived(orderId: string): Promise<Order | null> {
    try {
      const response = await orderApi.confirmReceived(orderId);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error("Error in confirmReceived:", error);
      throw error;
    }
  },
};

export default orderService;
