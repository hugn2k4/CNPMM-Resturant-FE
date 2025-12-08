import { LoyaltyTier, PointTransactionType, VoucherDiscountType } from "../enums/voucher";

export interface IVoucher {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  maxUsage?: number;
  maxUsagePerUser: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  isValid?: boolean;
  userUsageCount?: number;
  isSaved?: boolean;
  canUse?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ILoyaltyAccount {
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  tierBenefits: ITierBenefits;
  nextTier?: INextTierInfo;
  conversionRate: IConversionRate;
}

export interface ITierBenefits {
  pointsMultiplier: number;
  birthdayBonus: number;
  description: string;
}

export interface INextTierInfo {
  tier: LoyaltyTier;
  requiredPoints: number;
  pointsNeeded: number;
}

export interface IConversionRate {
  pointsPerCurrency: number;
  currencyPerPoint: number;
}

export interface IPointTransaction {
  _id: string;
  user: string;
  type: PointTransactionType;
  points: number;
  description: string;
  order?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
  balanceAfter: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IVoucherValidation {
  voucher: {
    _id: string;
    code: string;
    name: string;
    discountType: VoucherDiscountType;
    discountValue: number;
  };
  discountAmount: number;
  finalAmount: number;
}

export interface IPointsRedemption {
  pointsToRedeem: number;
  discountAmount: number;
  remainingPoints: number;
}
