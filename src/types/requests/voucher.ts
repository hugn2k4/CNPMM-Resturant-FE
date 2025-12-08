export interface CreateVoucherRequest {
  code: string;
  name: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  maxUsage?: number;
  maxUsagePerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {}

export interface ValidateVoucherRequest {
  code: string;
  orderData: {
    subtotal: number;
    items: Array<{
      product: string;
      quantity: number;
      price: number;
    }>;
  };
}

export interface ValidatePointsRequest {
  points: number;
}

export interface CalculatePotentialPointsRequest {
  orderAmount: number;
}

export interface AdjustPointsRequest {
  userId: string;
  points: number;
  description: string;
}
