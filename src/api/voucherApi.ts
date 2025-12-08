import type { AxiosResponse } from "axios";
import type { CreateVoucherRequest, UpdateVoucherRequest, ValidateVoucherRequest } from "../types/requests/voucher";
import type {
  GetVoucherResponse,
  GetVouchersResponse,
  ToggleSaveVoucherResponse,
  ValidateVoucherResponse,
} from "../types/responses/voucher";
import axiosClient from "../utils/axiosClient";

const voucherApi = {
  // User APIs
  getAvailableVouchers: (page = 1, limit = 20): Promise<AxiosResponse<GetVouchersResponse>> => {
    return axiosClient.get("/vouchers/available", {
      params: { page, limit },
    });
  },

  getSavedVouchers: (page = 1, limit = 20): Promise<AxiosResponse<GetVouchersResponse>> => {
    return axiosClient.get("/vouchers/saved", {
      params: { page, limit },
    });
  },

  getVoucherById: (id: string): Promise<AxiosResponse<GetVoucherResponse>> => {
    return axiosClient.get(`/vouchers/${id}`);
  },

  getVoucherByCode: (code: string): Promise<AxiosResponse<GetVoucherResponse>> => {
    return axiosClient.get(`/vouchers/code/${code}`);
  },

  validateVoucher: (data: ValidateVoucherRequest): Promise<AxiosResponse<ValidateVoucherResponse>> => {
    return axiosClient.post("/vouchers/validate", data);
  },

  toggleSaveVoucher: (id: string): Promise<AxiosResponse<ToggleSaveVoucherResponse>> => {
    return axiosClient.post(`/vouchers/${id}/save`);
  },

  // Admin APIs
  getAllVouchers: (
    filters?: {
      isActive?: boolean;
      discountType?: string;
      code?: string;
    },
    page = 1,
    limit = 20
  ): Promise<AxiosResponse<GetVouchersResponse>> => {
    return axiosClient.get("/vouchers", {
      params: { ...filters, page, limit },
    });
  },

  createVoucher: (data: CreateVoucherRequest): Promise<AxiosResponse<GetVoucherResponse>> => {
    return axiosClient.post("/vouchers", data);
  },

  updateVoucher: (id: string, data: UpdateVoucherRequest): Promise<AxiosResponse<GetVoucherResponse>> => {
    return axiosClient.patch(`/vouchers/${id}`, data);
  },

  deleteVoucher: (id: string): Promise<AxiosResponse<{ success: boolean; message: string }>> => {
    return axiosClient.delete(`/vouchers/${id}`);
  },
};

export default voucherApi;
