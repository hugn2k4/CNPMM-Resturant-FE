import type { ApiResponse } from "../types/responses/api.response";
import axiosClient from "../utils/axiosClient";

const summaryApi = {
  getRevenue: (params?: { from?: string; to?: string; interval?: string }): Promise<ApiResponse<unknown>> =>
    axiosClient.get("/summary/revenue", { params }).then((res) => res.data),

  getDeliveredOrders: (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }): Promise<ApiResponse<unknown>> => axiosClient.get("/summary/delivered-orders", { params }).then((res) => res.data),

  getCashflow: (params?: { from?: string; to?: string }): Promise<ApiResponse<unknown>> =>
    axiosClient.get("/summary/cashflow", { params }).then((res) => res.data),

  getNewCustomers: (params?: { from?: string; to?: string }): Promise<ApiResponse<unknown>> =>
    axiosClient.get("/summary/new-customers", { params }).then((res) => res.data),

  getTopProducts: (params?: { from?: string; to?: string; limit?: number }): Promise<ApiResponse<unknown>> =>
    axiosClient.get("/summary/top-products", { params }).then((res) => res.data),
};

export default summaryApi;
