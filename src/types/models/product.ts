export interface Image {
  _id: string;
  url: string;
  alt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
}

export interface Review {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  listProductImage?: Image[];
  listReview?: Review[];
  status: "available" | "unavailable" | "out_of_stock";
  categoryId?: Category;
  stock: number;
  preparationTime?: string;
  calories?: number;
  rating?: number;
  reviewCount?: number;
  // Các trường mới
  viewCount?: number;
  soldCount?: number;
  discount?: number;
  discountPrice?: number;
  finalPrice?: number;
  isDeleted?: boolean;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
