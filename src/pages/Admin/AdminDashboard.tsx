import { Box, Card, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { MessageCircle, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import chatApi from "../../api/chatApi";
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";
import socketService from "../../services/socketService";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalUsers: 0,
    unreadMessages: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    loadStats();

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

  const loadOrders = async () => {
    try {
      const response = await orderApi.getAllOrders();
      const orders = response.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter((order: { createdAt: string }) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const todayRevenue = todayOrders.reduce((sum: number, order: { total: number }) => sum + order.total, 0);

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
            <Typography color="text.secondary">Chức năng này đang được phát triển...</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
