import axiosClient from "../utils/axiosClient";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const categoryApi = {
  // Lấy tất cả categories
  getAll: (isActive?: boolean) => {
    return axiosClient.get<ApiResponse<Category[]>>("/categories", {
      params: { isActive },
    });
  },

  // Lấy category theo ID
  getById: (id: string) => {
    return axiosClient.get<ApiResponse<Category>>(`/categories/${id}`);
  },

  // Lấy category theo slug
  getBySlug: (slug: string) => {
    return axiosClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
  },

  // Tạo category mới
  create: (data: Partial<Category>) => {
    return axiosClient.post<ApiResponse<Category>>("/categories", data);
  },

  // Cập nhật category
  update: (id: string, data: Partial<Category>) => {
    return axiosClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
  },

  // Xóa category
  delete: (id: string) => {
    return axiosClient.delete<ApiResponse<void>>(`/categories/${id}`);
  },
};

export default categoryApi;
