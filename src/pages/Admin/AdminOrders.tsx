import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CheckCircle, Clock, Package, XCircle } from "lucide-react";

const AdminOrders = () => {
  // Mock data
  const orders = [
    { id: "ORD001", customer: "Nguyễn Văn A", total: "450,000đ", status: "pending", time: "10 phút trước" },
    { id: "ORD002", customer: "Trần Thị B", total: "320,000đ", status: "processing", time: "25 phút trước" },
    { id: "ORD003", customer: "Lê Văn C", total: "580,000đ", status: "completed", time: "1 giờ trước" },
    { id: "ORD004", customer: "Phạm Thị D", total: "200,000đ", status: "cancelled", time: "2 giờ trước" },
  ];

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock size={16} />,
      processing: <Package size={16} />,
      completed: <CheckCircle size={16} />,
      cancelled: <XCircle size={16} />,
    };
    return icons[status as keyof typeof icons] || null;
  };

  const getStatusLabel = (status: string) => {
    const labels = { pending: "Chờ xác nhận", processing: "Đang xử lý", completed: "Hoàn thành", cancelled: "Đã huỷ" };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string): "warning" | "info" | "success" | "error" | "default" => {
    const colors = { pending: "warning", processing: "info", completed: "success", cancelled: "error" };
    return (colors[status as keyof typeof colors] as "warning" | "info" | "success" | "error") || "default";
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Quản lý đơn hàng
      </Typography>
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thời gian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover sx={{ cursor: "pointer" }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {order.total}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {order.time}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          💡 Tích hợp với API thực tế để hiển thị dữ liệu đơn hàng
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminOrders;
