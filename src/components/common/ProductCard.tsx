import { Link } from "react-router-dom";
import type { Product } from "../../types/models/product";
import { formatVND } from "../../utils/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0 || product.status === "out_of_stock";

  // Get category name from populated field or use default
  const categoryName = product.categoryId?.name || "Chưa phân loại";
  const mainImage = product.listProductImage?.[0]?.url || "/placeholder.jpg";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/products/${product._id}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-xl">Hết hàng</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            {categoryName}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {product.rating && (
              <>
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
                {product.reviewCount && <span className="text-sm text-gray-500">({product.reviewCount})</span>}
              </>
            )}
          </div>
          {product.preparationTime && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {product.preparationTime}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-orange-600">{formatVND(product.price)}</span>
            <span className={`text-sm ${product.stock <= 5 && product.stock > 0 ? "text-red-500" : "text-gray-500"}`}>
              {isOutOfStock ? "Hết hàng" : `Còn ${product.stock} suất`}
            </span>
          </div>

          <Link
            to={`/products/${product._id}`}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
            onClick={(e) => isOutOfStock && e.preventDefault()}
          >
            {isOutOfStock ? "Hết hàng" : "Xem chi tiết"}
          </Link>
        </div>
      </div>
    </div>
  );
}
