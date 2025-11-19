import axiosClient from "../utils/axiosClient";
import type { Product } from "../types/models/product";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: "available" | "unavailable" | "out_of_stock";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const productApi = {
  // Lấy danh sách sản phẩm
  getAll: (params?: GetProductsParams) => {
    return axiosClient.get<ApiResponse<ProductsResponse>>("/products", { params });
  },

  // Lấy chi tiết sản phẩm
  getById: (id: string) => {
    return axiosClient.get<ApiResponse<Product>>(`/products/${id}`);
  },

  // Lấy sản phẩm nổi bật
  getFeatured: (limit?: number) => {
    return axiosClient.get<ApiResponse<Product[]>>("/products/featured", {
      params: { limit },
    });
  },

  // Lấy sản phẩm theo danh mục
  getByCategory: (categoryId: string, params?: { page?: number; limit?: number }) => {
    return axiosClient.get<ApiResponse<ProductsResponse>>(`/products/category/${categoryId}`, { params });
  },

  // Tạo sản phẩm mới
  create: (data: Partial<Product>) => {
    return axiosClient.post<ApiResponse<Product>>("/products", data);
  },

  // Cập nhật sản phẩm
  update: (id: string, data: Partial<Product>) => {
    return axiosClient.put<ApiResponse<Product>>(`/products/${id}`, data);
  },

  // Xóa sản phẩm
  delete: (id: string) => {
    return axiosClient.delete<ApiResponse<void>>(`/products/${id}`);
  },

  // Cập nhật tồn kho
  updateStock: (id: string, quantity: number, operation: "set" | "increase" | "decrease" = "set") => {
    return axiosClient.patch<ApiResponse<Product>>(`/products/${id}/stock`, { quantity, operation });
  },
};

export default productApi;
