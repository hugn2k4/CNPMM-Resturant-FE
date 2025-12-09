import { CheckCircle, LocalShipping, Payment, ShoppingBag, Star } from "@mui/icons-material";
import { Chip, Divider, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useGlobal } from "../../hooks/useGlobal";
import orderService from "../../services/orderService";
import reviewApi, { type Review } from "../../api/reviewApi";
import type { Order } from "../../types/models/order";
import { formatVND } from "../../utils/format";

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user } = useGlobal();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    // Fetch user reviews nếu order đã delivered và có user
    if (order?.orderStatus === "delivered" && user?._id) {
      fetchUserReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.orderStatus, user?._id]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const data = await orderService.getOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      showSnackbar("Không thể tải thông tin đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    if (!user?._id) return;

    try {
      const response = await reviewApi.getByUser(user._id, { page: 1, limit: 100 });
      const apiResponse = response.data as { success?: boolean; data?: { reviews?: Review[] }; message?: string };
      const reviews = apiResponse.data?.reviews || (apiResponse as { reviews?: Review[] })?.reviews || [];
      setUserReviews(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const hasReviewedProduct = (productId: string | { _id: string }): boolean => {
    if (typeof productId === "object") {
      return userReviews.some((review) => review.productId === productId._id);
    }
    return userReviews.some((review) => review.productId === productId);
  };

  const handleReviewProduct = (productId: string | { _id: string }) => {
    const id = typeof productId === "object" ? productId._id : productId;
    // Navigate to product page với hash để scroll đến phần reviews
    navigate(`/products/${id}#reviews`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center py-16">
          <Typography variant="h5" className="mb-4">
            Không tìm thấy đơn hàng
          </Typography>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
      pending: "warning",
      confirmed: "info",
      preparing: "info",
      shipping: "info",
      delivered: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      shipping: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="text-green-500 mb-4" style={{ fontSize: "80px" }} />
          <Typography variant="h4" className="font-bold text-gray-800 mb-2">
            Đặt hàng thành công!
          </Typography>
          <Typography className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.
          </Typography>
        </div>

        {/* Order Info */}
        <Paper elevation={2} className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Typography variant="h6" className="font-semibold mb-1">
                Mã đơn hàng: #{order.orderNumber}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </Typography>
            </div>
            <Chip label={getStatusText(order.orderStatus)} color={getStatusColor(order.orderStatus)} />
          </div>

          <Divider className="my-4" />

          {/* Shipping Address */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <LocalShipping className="text-orange-600" />
              <Typography variant="h6" className="font-semibold">
                Thông tin giao hàng
              </Typography>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <Typography className="font-medium mb-1">{order.shippingAddress.fullName}</Typography>
              <Typography variant="body2" className="text-gray-700 mb-1">
                Điện thoại: {order.shippingAddress.phoneNumber}
              </Typography>
              <Typography variant="body2" className="text-gray-700">
                Địa chỉ: {order.shippingAddress.address}
                {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
              </Typography>
              {order.shippingAddress.note && (
                <Typography variant="body2" className="text-gray-600 mt-2 italic">
                  Ghi chú: {order.shippingAddress.note}
                </Typography>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Payment className="text-orange-600" />
              <Typography variant="h6" className="font-semibold">
                Phương thức thanh toán
              </Typography>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <Typography className="font-medium">Thanh toán khi nhận hàng (COD)</Typography>
              <Typography variant="body2" className="text-gray-600">
                Vui lòng chuẩn bị {formatVND(order.finalAmount)} khi nhận hàng
              </Typography>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="text-orange-600" />
              <Typography variant="h6" className="font-semibold">
                Sản phẩm đã đặt
              </Typography>
            </div>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const product = typeof item.productId === "object" ? item.productId : null;
                const productImage = item.image || "/placeholder.jpg";
                const productName = product?.name || item.name || "Sản phẩm";
                const productId = product?._id || (typeof item.productId === "string" ? item.productId : "");
                const isReviewed = productId ? hasReviewedProduct(productId) : false;

                return (
                  <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded">
                    <img src={productImage} alt={productName} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <Typography className="font-medium mb-1">{productName}</Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Số lượng: {item.quantity}
                      </Typography>
                      <Typography className="text-orange-600 font-semibold">{formatVND(item.price)}</Typography>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between">
                      <Typography className="font-semibold mb-2">{formatVND(item.price * item.quantity)}</Typography>
                      {order.orderStatus === "delivered" && productId && (
                        <div className="mt-2">
                          {isReviewed ? (
                            <Chip
                              icon={<Star className="text-yellow-500" />}
                              label="Đã đánh giá"
                              color="success"
                              size="small"
                              className="cursor-default"
                            />
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Star />}
                              onClick={() => handleReviewProduct(productId)}
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                              Đánh giá
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Divider className="my-4" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Typography className="text-gray-600">Tạm tính:</Typography>
              <Typography className="font-medium">{formatVND(order.totalAmount)}</Typography>
            </div>
            <div className="flex justify-between">
              <Typography className="text-gray-600">Phí vận chuyển:</Typography>
              <Typography className="font-medium">{formatVND(order.shippingFee)}</Typography>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between">
              <Typography variant="h6" className="font-bold">
                Tổng cộng:
              </Typography>
              <Typography variant="h6" className="font-bold text-orange-600">
                {formatVND(order.finalAmount)}
              </Typography>
            </div>
          </div>
        </Paper>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outlined" onClick={() => navigate("/my-orders")} className="min-w-[200px]">
            Xem đơn hàng của tôi
          </Button>
          <Button onClick={() => navigate("/")} className="min-w-[200px]">
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </div>
  );
}
