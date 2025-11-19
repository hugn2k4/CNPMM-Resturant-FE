export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  listProductImage: Array<{
    _id: string;
    url: string;
    alt?: string;
  }>;
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
  };
  stock: number;
  status: "available" | "unavailable" | "out_of_stock";
  rating?: number;
  reviewCount?: number;
  preparationTime?: string;
  calories?: number;
  listReview?: Array<{
    _id: string;
    content: string;
    rate: number;
    userId: string;
  }>;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
