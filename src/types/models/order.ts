import type { Product } from "./product";
import type { User } from "./user";

export interface OrderItem {
  _id?: string;
  productId: Product | string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  note?: string;
}

export interface Order {
  _id: string;
  userId: User | string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "COD";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "confirmed" | "preparing" | "shipping" | "delivered" | "cancelled";
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: "COD";
  note?: string;
  totalAmount: number;
  shippingFee?: number;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
