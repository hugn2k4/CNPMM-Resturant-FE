import { Box, Card, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { MessageCircle, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import chatApi from "../../api/chatApi";
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";
import summaryApi from "../../api/summaryApi";
import socketService from "../../services/socketService";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalUsers: 0,
    unreadMessages: 0,
    todayRevenue: 0,
  });

  const [revenueSeries, setRevenueSeries] = useState<Array<{ _id: string; totalRevenue: number }>>([]);
  type DeliveredOrder = {
    _id: string;
    orderNumber?: string;
    userId?: { fullName?: string; email?: string } | null;
    deliveredAt?: string | null;
    finalAmount?: number;
  };

  type TopProduct = {
    productId?: string | number | null;
    product?: { name?: string } | null;
    totalQuantity?: number;
  };

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentDelivered, setRecentDelivered] = useState<DeliveredOrder[]>([]);

  useEffect(() => {
    loadStats();
    loadSummary();

    // Connect socket for realtime updates
    const token = localStorage.getItem("accessToken");
    if (token && !socketService.isConnected()) {
      socketService.connect(token);
    }

    // Listen for new messages
    const handleNewMessage = () => {
      void loadUnreadCount();
    };

    socketService.on("chat:new_user_message", handleNewMessage);

    return () => {
      socketService.off("chat:new_user_message", handleNewMessage);
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      await Promise.all([loadOrders(), loadUsers(), loadUnreadCount()]);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const [revRes, topRes, deliveredRes] = await Promise.all([
        summaryApi.getRevenue({ interval: "day" }),
        summaryApi.getTopProducts({ limit: 10 }),
        summaryApi.getDeliveredOrders({ page: 1, limit: 5 }),
      ]);

      setRevenueSeries(revRes.data || []);
      setTopProducts(topRes.data || []);
      setRecentDelivered(deliveredRes.data?.orders || []);
    } catch (error) {
      console.error("Failed to load summary:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderApi.getAllOrders();
      // Backend returns a paginated object: { orders, total, page, ... }
      const orders = response.data?.orders || response.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter((order: { createdAt: string }) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const todayRevenue = todayOrders.reduce(
        (sum: number, order: { finalAmount?: number; totalAmount?: number }) =>
          sum + (order.finalAmount ?? order.totalAmount ?? 0),
        0
      );

      setStats((prev) => ({
        ...prev,
        todayOrders: todayOrders.length,
        todayRevenue,
      }));
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      setStats((prev) => ({
        ...prev,
        totalUsers: response.data?.length || 0,
      }));
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await chatApi.getAdminConversations();
      const conversations = response.data || [];
      const unreadCount = conversations.reduce(
        (sum: number, conv: { unreadCount: number }) => sum + conv.unreadCount,
        0
      );
      setStats((prev) => ({
        ...prev,
        unreadMessages: unreadCount,
      }));
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const statItems = [
    {
      icon: <ShoppingBag size={32} />,
      label: "Đơn hàng hôm nay",
      value: loading ? "..." : stats.todayOrders.toString(),
      color: "#4caf50",
    },
    {
      icon: <Users size={32} />,
      label: "Khách hàng",
      value: loading ? "..." : stats.totalUsers.toString(),
      color: "#2196f3",
    },
    {
      icon: <MessageCircle size={32} />,
      label: "Tin nhắn chưa đọc",
      value: loading ? "..." : stats.unreadMessages.toString(),
      color: "#ff9800",
    },
    {
      icon: <TrendingUp size={32} />,
      label: "Doanh thu hôm nay",
      value: loading ? "..." : formatCurrency(stats.todayRevenue),
      color: "#9c27b0",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Tổng quan hệ thống
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4, width: "100%" }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {statItems.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Hoạt động gần đây
            </Typography>
            <Typography color="text.secondary">Đơn giao gần nhất</Typography>

            {recentDelivered.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Không có đơn hàng đã giao gần đây.
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {recentDelivered.map((o: DeliveredOrder) => (
                  <Box key={o._id} sx={{ mb: 1, p: 1, borderBottom: "1px solid #eee" }}>
                    <Typography sx={{ fontWeight: 600 }}>{o.orderNumber}</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                      {o.userId?.fullName || o.userId?.email} — {new Date(o.deliveredAt || "").toLocaleString()} —{" "}
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        o.finalAmount || 0
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Doanh thu (mỗi ngày)</Typography>
                {revenueSeries.length === 0 ? (
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {revenueSeries.map((r) => (
                      <Box key={r._id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>{r._id}</Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            r.totalRevenue || 0
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Top 10 sản phẩm</Typography>
                {topProducts.length === 0 ? (
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {topProducts.map((p: TopProduct, idx: number) => (
                      <Box
                        key={String(p.productId || idx)}
                        sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}
                      >
                        <Typography>{p.product?.name || "-"}</Typography>
                        <Typography sx={{ fontWeight: 700 }}>{p.totalQuantity || 0} pcs</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
