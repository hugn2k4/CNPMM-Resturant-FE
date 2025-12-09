import { ShoppingBag, Visibility, Star } from "@mui/icons-material";
import { Chip, Divider, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useGlobal } from "../../hooks/useGlobal";
import orderService from "../../services/orderService";
import reviewApi, { type Review } from "../../api/reviewApi";
import type { Order } from "../../types/models/order";
import { formatVND } from "../../utils/format";

type OrderStatus = "all" | "pending" | "confirmed" | "preparing" | "shipping" | "delivered" | "cancelled";

export default function MyOrdersPage() {
  const { showSnackbar } = useSnackbar();
  const { user } = useGlobal();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  useEffect(() => {
    // Fetch user reviews để check đã đánh giá chưa
    if (user?._id) {
      fetchUserReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(activeTab !== "all" && { status: activeTab }),
      };

      const data = await orderService.getMyOrders(params);
      if (data) {
        setOrders(data.orders);
        setHasMore(data.page < data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showSnackbar("Không thể tải danh sách đơn hàng", "error");
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
    navigate(`/products/${id}#reviews`);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      const reason = prompt("Lý do hủy đơn (tùy chọn):");
      const updatedOrder = await orderService.cancelOrder(orderId, reason || undefined);
      if (updatedOrder) {
        showSnackbar("Đã hủy đơn hàng", "success");
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      showSnackbar(apiError.response?.data?.message || "Không thể hủy đơn hàng", "error");
    }
  };

  const handleConfirmReceived = async (orderId: string) => {
    if (!window.confirm("Xác nhận bạn đã nhận được hàng?")) return;

    try {
      const updatedOrder = await orderService.confirmReceived(orderId);
      if (updatedOrder) {
        showSnackbar("Đã xác nhận nhận hàng", "success");
        fetchOrders(); // Refresh list
      }
    } catch (error) {
      console.error("Error confirming received:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      showSnackbar(apiError.response?.data?.message || "Không thể xác nhận nhận hàng", "error");
    }
  };

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

  const canCancelOrder = (order: Order) => {
    return order.orderStatus === "pending" || order.orderStatus === "confirmed";
  };

  const canConfirmReceived = (order: Order) => {
    return order.orderStatus === "shipping";
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Typography variant="h4" className="mb-6 font-bold text-gray-800">
          Đơn hàng của tôi
        </Typography>

        {/* Status Tabs */}
        <Paper elevation={2} className="mb-6">
          <Tabs
            value={activeTab}
            onChange={(_, value) => {
              setActiveTab(value);
              setPage(1);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
              "& .Mui-selected": { color: "#ff9f0d" },
              "& .MuiTabs-indicator": { backgroundColor: "#ff9f0d" },
            }}
          >
            <Tab label="Tất cả" value="all" />
            <Tab label="Chờ xác nhận" value="pending" />
            <Tab label="Đã xác nhận" value="confirmed" />
            <Tab label="Đang chuẩn bị" value="preparing" />
            <Tab label="Đang giao" value="shipping" />
            <Tab label="Đã giao" value="delivered" />
            <Tab label="Đã hủy" value="cancelled" />
          </Tabs>
        </Paper>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Paper elevation={2} className="p-12 text-center">
            <ShoppingBag className="text-gray-300 mb-4" style={{ fontSize: "80px" }} />
            <Typography variant="h6" className="text-gray-600 mb-4">
              Chưa có đơn hàng nào
            </Typography>
            <Link to="/products">
              <Button>Khám phá sản phẩm</Button>
            </Link>
          </Paper>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Paper key={order._id} elevation={2} className="p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Typography variant="h6" className="font-semibold mb-1">
                      Đơn hàng #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </Typography>
                  </div>
                  <Chip label={getStatusText(order.orderStatus)} color={getStatusColor(order.orderStatus)} />
                </div>

                <Divider className="my-4" />

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 2).map((item, index) => {
                    const product = typeof item.productId === "object" ? item.productId : null;
                    const productImage = item.image || "/placeholder.jpg";
                    const productName = product?.name || item.name || "Sản phẩm";
                    const productId = product?._id || (typeof item.productId === "string" ? item.productId : "");
                    const isReviewed = productId ? hasReviewedProduct(productId) : false;

                    return (
                      <div key={index} className="flex gap-4">
                        <img src={productImage} alt={productName} className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <Typography className="font-medium line-clamp-2">{productName}</Typography>
                          <Typography variant="body2" className="text-gray-600">
                            x{item.quantity}
                          </Typography>
                          <Typography className="text-orange-600 font-semibold">{formatVND(item.price)}</Typography>
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
                                  className="text-orange-600 border-orange-600 hover:bg-orange-50 mt-1"
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
                  {order.items.length > 2 && (
                    <Typography variant="body2" className="text-gray-600">
                      Và {order.items.length - 2} sản phẩm khác...
                    </Typography>
                  )}
                </div>

                <Divider className="my-4" />

                {/* Order Footer */}
                <div className="flex justify-between items-center">
                  <div>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Tổng tiền:
                    </Typography>
                    <Typography variant="h6" className="font-bold text-orange-600">
                      {formatVND(order.finalAmount)}
                    </Typography>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/order-success/${order._id}`}>
                      <Button variant="outlined" startIcon={<Visibility />}>
                        Xem chi tiết
                      </Button>
                    </Link>

                    {canCancelOrder(order) && (
                      <Button variant="outlined" color="error" onClick={() => handleCancelOrder(order._id)}>
                        Hủy đơn
                      </Button>
                    )}

                    {canConfirmReceived(order) && (
                      <Button onClick={() => handleConfirmReceived(order._id)}>Đã nhận hàng</Button>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <Typography variant="body2" className="text-gray-700">
                    <strong>Giao đến:</strong> {order.shippingAddress.fullName} - {order.shippingAddress.phoneNumber}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {order.shippingAddress.address}
                    {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                    {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                    {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                  </Typography>
                </div>
              </Paper>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && orders.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="outlined" onClick={() => setPage(page + 1)} disabled={loading}>
              {loading ? "Đang tải..." : "Xem thêm"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
