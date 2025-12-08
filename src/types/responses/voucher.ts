import type {
  ILoyaltyAccount,
  IPointsRedemption,
  IPointTransaction,
  IVoucher,
  IVoucherValidation,
} from "../models/voucher";

export interface GetVouchersResponse {
  success: boolean;
  data: IVoucher[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetVoucherResponse {
  success: boolean;
  data: IVoucher;
}

export interface ValidateVoucherResponse {
  success: boolean;
  message: string;
  data: IVoucherValidation;
}

export interface ToggleSaveVoucherResponse {
  success: boolean;
  message: string;
  data: {
    isSaved: boolean;
  };
}

export interface GetLoyaltyAccountResponse {
  success: boolean;
  data: ILoyaltyAccount;
}

export interface GetTransactionsResponse {
  success: boolean;
  data: IPointTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ValidatePointsResponse {
  success: boolean;
  message: string;
  data: IPointsRedemption;
}

export interface CalculatePotentialPointsResponse {
  success: boolean;
  data: {
    orderAmount: number;
    potentialPoints: number;
    tier: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  lifetimePoints: number;
  tier: string;
}

export interface GetLeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}
