import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { useSnackbar } from "../../hooks/useSnackbar";
import cartService from "../../services/cartService";
import type { Cart, CartItem } from "../../types/models/cart";
import { formatVND } from "../../utils/format";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function CartPage() {
  const { showSnackbar } = useSnackbar();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      const apiError = error as ApiError;
      showSnackbar(apiError.response?.data?.message || "Không thể tải giỏ hàng", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(productId);
      const updatedCart = await cartService.updateItemQuantity(productId, newQuantity);
      setCart(updatedCart);
      showSnackbar("Đã cập nhật số lượng", "success");
    } catch (error) {
      console.error("Error updating quantity:", error);
      const apiError = error as ApiError;
      showSnackbar(apiError.response?.data?.message || "Không thể cập nhật số lượng", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setUpdating(productId);
      const updatedCart = await cartService.removeItem(productId);
      setCart(updatedCart);
      showSnackbar("Đã xóa sản phẩm khỏi giỏ hàng", "success");
    } catch (error) {
      console.error("Error removing item:", error);
      const apiError = error as ApiError;
      showSnackbar(apiError.response?.data?.message || "Không thể xóa sản phẩm", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;

    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      showSnackbar("Đã xóa toàn bộ giỏ hàng", "success");
    } catch (error) {
      console.error("Error clearing cart:", error);
      const apiError = error as ApiError;
      showSnackbar(apiError.response?.data?.message || "Không thể xóa giỏ hàng", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ hàng</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng</h1>
          {cart.items.length > 0 && (
            <button onClick={handleClearCart} className="text-red-600 hover:text-red-700 font-medium text-sm">
              Xóa toàn bộ
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cart.items.map((item: CartItem) => {
                const product = item.productId;
                const mainImage = product.listProductImage?.[0]?.url || "/placeholder.jpg";
                const isUpdating = updating === product._id;

                return (
                  <div
                    key={item._id}
                    className={`border-b border-gray-200 last:border-b-0 p-4 ${isUpdating ? "opacity-50" : ""}`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link to={`/products/${product._id}`} className="flex-shrink-0">
                        <img src={mainImage} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1">
                        <Link to={`/products/${product._id}`}>
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors mb-1">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">{formatVND(item.price)}</span>
                          {product.stock < item.quantity && (
                            <span className="text-sm text-red-500">Chỉ còn {product.stock} sản phẩm</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => handleRemoveItem(product._id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-700 mb-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>

                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= product.stock}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right mt-2">
                          <span className="text-sm text-gray-500">Tổng:</span>
                          <span className="text-lg font-bold text-gray-800 ml-2">
                            {formatVND(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng sản phẩm:</span>
                  <span>{cart.totalItems} sản phẩm</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatVND(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-600">{formatVND(cart.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout">
                <Button fullWidth colorScheme="orange" className="mb-3">
                  Thanh toán
                </Button>
              </Link>

              <Link to="/products" className="block text-center text-gray-600 hover:text-orange-600 transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
