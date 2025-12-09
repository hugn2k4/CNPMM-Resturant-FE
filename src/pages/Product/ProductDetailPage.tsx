import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/swiper-bundle.css";

import type { Product } from "../../types/models/product";
import { formatVND } from "../../utils/format";
import Button from "../../components/common/Button";
import ProductCard from "../../components/common/ProductCard";
import productService from "../../services/productService";
import cartService from "../../services/cartService";
import { useGlobal } from "../../hooks/useGlobal";
import { useSnackbar } from "../../hooks/useSnackbar";
import LoginRequiredDialog from "../../components/common/LoginRequiredDialog";
import ReviewSection from "../../components/common/ReviewSection";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLogin } = useGlobal();
  const { showSnackbar } = useSnackbar();

  // Lấy orderId từ URL query params nếu có
  const orderId = searchParams.get("orderId") || undefined;

  // Debug: log orderId để kiểm tra
  useEffect(() => {
    if (orderId) {
      console.log("OrderId from URL:", orderId);
    }
  }, [orderId]);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "info">("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);

        // Fetch related products based on category
        if (data.categoryId?._id) {
          try {
            const relatedData = await productService.getProducts({
              categoryId: data.categoryId._id,
              limit: 8,
              status: "available",
            });
            // Filter out current product
            const filtered = relatedData.products.filter((p) => p._id !== data._id);
            setRelatedProducts(filtered);
          } catch (err) {
            console.error("Error fetching related products:", err);
          }
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Không thể tải thông tin sản phẩm");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Scroll to top when product changes
    window.scrollTo(0, 0);
  }, [id]);

  // Scroll to reviews section when hash is #reviews
  useEffect(() => {
    if (window.location.hash === "#reviews" && product) {
      // Wait for page to load, then scroll
      setTimeout(() => {
        const reviewsSection = document.getElementById("reviews-section");
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  }, [product]);

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

  const handleAddToCart = async () => {
    if (!isLogin) {
      setShowLoginDialog(true);
      return;
    }

    if (!product || isOutOfStock) return;

    try {
      setAddingToCart(true);
      await cartService.addItem(product._id, quantity);
      showSnackbar(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`, "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      showSnackbar(apiError.response?.data?.message || "Không thể thêm vào giỏ hàng", "error");
    } finally {
      setAddingToCart(false);
    }
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
          <Link to={`/products?category=${product.categoryId?._id || ""}`} className="hover:text-orange-600">
            {categoryName}
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
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"} fill-current`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="text-lg font-medium text-gray-700 ml-2">{product.rating.toFixed(1)}</span>
                    </div>
                    {product.reviewCount !== undefined && (
                      <span className="text-gray-500">({product.reviewCount} đánh giá)</span>
                    )}
                    {product.soldCount !== undefined && (
                      <span className="text-gray-500 ml-2">• Đã bán: {product.soldCount}</span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-lg text-gray-600">Đơn giá:</span>
                    <span className="text-2xl font-semibold text-gray-800">{formatVND(product.price)}</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg text-gray-600">Tổng tiền:</span>
                    <span className="text-4xl font-bold text-orange-600">{formatVND(product.price * quantity)}</span>
                  </div>
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

                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                  {product.preparationTime && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Thời gian</p>
                        <p className="font-medium text-gray-800">{product.preparationTime}</p>
                      </div>
                    </div>
                  )}
                  {product.calories && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    disabled={isOutOfStock || addingToCart}
                    className={`flex-1 py-4 text-lg font-semibold ${
                      isOutOfStock
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang thêm...
                      </span>
                    ) : isOutOfStock ? (
                      "Hết hàng"
                    ) : (
                      "Thêm vào giỏ hàng"
                    )}
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

          {/* Tabs Section */}
          <div className="border-t">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === "description"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === "info"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                Thông tin chi tiết
              </button>
            </div>

            <div className="p-6 lg:p-8">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-700">Danh mục:</span>
                      <span className="text-gray-600">{categoryName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-700">Giá:</span>
                      <span className="text-orange-600 font-bold">{formatVND(product.price)}</span>
                    </div>
                    {product.preparationTime && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold text-gray-700">Thời gian chuẩn bị:</span>
                        <span className="text-gray-600">{product.preparationTime}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {product.calories && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-semibold text-gray-700">Calo:</span>
                        <span className="text-gray-600">{product.calories} kcal</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-semibold text-gray-700">Tình trạng:</span>
                      <span className={isOutOfStock ? "text-red-600" : "text-green-600"}>
                        {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section - Always visible below tabs */}
        {product && (
          <div id="reviews-section" className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 lg:p-8">
              <ReviewSection productId={product._id} orderId={orderId} />
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Login Required Dialog */}
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        message="Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Vui lòng đăng nhập hoặc tạo tài khoản mới."
        returnUrl={`/products/${id}`}
      />
    </div>
  );
}
