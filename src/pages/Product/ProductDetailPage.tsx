import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/swiper-bundle.css";

import type { Product } from "../../types/models/product";
import { formatVND } from "../../utils/format";
import Button from "../../components/common/Button";
import productService from "../../services/productService";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Không thể tải thông tin sản phẩm");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{error || "Không tìm thấy sản phẩm"}</h1>
        <Button onClick={() => navigate("/products")}>Quay lại danh sách sản phẩm</Button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0 || product.status === "out_of_stock";
  const maxQuantity = Math.min(product.stock, 99);
  const categoryName = product.categoryId?.name || "Chưa phân loại";
  const productImages = product.listProductImage?.map((img) => img.url) || [];

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-orange-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-orange-600">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Swiper */}
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                spaceBetween={10}
                navigation
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                className="rounded-lg overflow-hidden aspect-square"
              >
                {productImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img src={image} alt={`${product.name} - ${index + 1}`} className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Thumbnail Swiper */}
              {productImages.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  watchSlidesProgress
                  className="thumbs-swiper"
                >
                  {productImages.map((image, index) => (
                    <SwiperSlide key={index} className="cursor-pointer">
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-orange-500 transition-colors"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                {/* Category Badge */}
                <div className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  {categoryName}
                </div>

                {/* Product Name */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                {/* Rating and Reviews */}
                {product.rating && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-lg font-medium text-gray-700">{product.rating.toFixed(1)}</span>
                    </div>
                    {product.reviewCount && <span className="text-gray-500">({product.reviewCount} đánh giá)</span>}
                  </div>
                )}

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-lg text-gray-600">Đơn giá:</span>
                    <span className="text-2xl font-semibold text-gray-800">{formatVND(product.price)}</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg text-gray-600">Tổng tiền:</span>
                    <span className="text-4xl font-bold text-orange-600">{formatVND(product.price * quantity)}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {product.preparationTime && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Thời gian chuẩn bị</p>
                        <p className="font-medium text-gray-800">{product.preparationTime}</p>
                      </div>
                    </div>
                  )}
                  {product.calories && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Calo</p>
                        <p className="font-medium text-gray-800">{product.calories} kcal</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-gray-800">Tình trạng:</span>
                    <span
                      className={`font-bold ${
                        isOutOfStock ? "text-red-600" : product.stock <= 5 ? "text-orange-600" : "text-green-600"
                      }`}
                    >
                      {isOutOfStock
                        ? "Hết hàng"
                        : product.stock <= 5
                          ? `Chỉ còn ${product.stock} suất`
                          : `Còn hàng (${product.stock} suất)`}
                    </span>
                  </div>
                  {!isOutOfStock && product.stock <= 5 && (
                    <p className="text-sm text-orange-600">⚠️ Số lượng có hạn, đặt ngay!</p>
                  )}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-lg font-semibold text-gray-800">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-4 py-2 text-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= maxQuantity) {
                          setQuantity(val);
                        }
                      }}
                      disabled={isOutOfStock}
                      className="w-16 text-center font-semibold text-lg border-none focus:outline-none"
                      min="1"
                      max={maxQuantity}
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity || isOutOfStock}
                      className="px-4 py-2 text-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-4 text-lg font-semibold ${
                      isOutOfStock
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  </Button>
                  <button
                    className="px-6 py-4 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                    title="Yêu thích"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
