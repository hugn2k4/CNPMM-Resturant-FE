import type { AxiosResponse } from "axios";
import type {
  AdjustPointsRequest,
  CalculatePotentialPointsRequest,
  ValidatePointsRequest,
} from "../types/requests/voucher";
import type {
  CalculatePotentialPointsResponse,
  GetLeaderboardResponse,
  GetLoyaltyAccountResponse,
  GetTransactionsResponse,
  ValidatePointsResponse,
} from "../types/responses/voucher";
import axiosClient from "../utils/axiosClient";

const loyaltyApi = {
  // User APIs
  getLoyaltyAccount: (): Promise<AxiosResponse<GetLoyaltyAccountResponse>> => {
    return axiosClient.get("/loyalty/account");
  },

  getTransactionHistory: (
    filters?: {
      type?: string;
      startDate?: string;
      endDate?: string;
    },
    page = 1,
    limit = 20
  ): Promise<AxiosResponse<GetTransactionsResponse>> => {
    return axiosClient.get("/loyalty/transactions", {
      params: { ...filters, page, limit },
    });
  },

  validatePointsRedemption: (data: ValidatePointsRequest): Promise<AxiosResponse<ValidatePointsResponse>> => {
    return axiosClient.post("/loyalty/validate-redemption", data);
  },

  calculatePotentialPoints: (
    data: CalculatePotentialPointsRequest
  ): Promise<AxiosResponse<CalculatePotentialPointsResponse>> => {
    return axiosClient.post("/loyalty/calculate", data);
  },

  getLeaderboard: (limit = 10): Promise<AxiosResponse<GetLeaderboardResponse>> => {
    return axiosClient.get("/loyalty/leaderboard", {
      params: { limit },
    });
  },

  // Admin APIs
  adjustPoints: (
    data: AdjustPointsRequest
  ): Promise<
    AxiosResponse<{
      success: boolean;
      message: string;
      data: {
        adjustedPoints: number;
        newBalance: number;
        description: string;
      };
    }>
  > => {
    return axiosClient.post("/loyalty/adjust", data);
  },

  getUserLoyaltyAccount: (userId: string): Promise<AxiosResponse<GetLoyaltyAccountResponse>> => {
    return axiosClient.get(`/loyalty/user/${userId}`);
  },
};

export default loyaltyApi;
