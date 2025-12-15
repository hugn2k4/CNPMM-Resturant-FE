import {
  Avatar,
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
import { Mail, Phone, User } from "lucide-react";

const AdminCustomers = () => {
  // Mock data
  const customers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0901234567",
      orders: 15,
      spent: "4,500,000đ",
      status: "active",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0912345678",
      orders: 8,
      spent: "2,800,000đ",
      status: "active",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0923456789",
      orders: 23,
      spent: "7,200,000đ",
      status: "vip",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0934567890",
      orders: 3,
      spent: "850,000đ",
      status: "new",
    },
  ];

  const getStatusColor = (status: string): "success" | "info" | "warning" | "default" => {
    const colors = { active: "success", vip: "warning", new: "info" };
    return (colors[status as keyof typeof colors] as "success" | "info" | "warning") || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels = { active: "Hoạt động", vip: "VIP", new: "Mới" };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Quản lý khách hàng
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Liên hệ</TableCell>
                  <TableCell align="center">Đơn hàng</TableCell>
                  <TableCell align="right">Tổng chi tiêu</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover sx={{ cursor: "pointer" }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <User size={20} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{customer.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                          <Mail size={14} />
                          <Typography variant="body2">{customer.email}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Phone size={14} />
                          <Typography variant="body2">{customer.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {customer.orders}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {customer.spent}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(customer.status)}
                        color={getStatusColor(customer.status)}
                        size="small"
                      />
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
          💡 Tích hợp với API thực tế để hiển thị dữ liệu khách hàng
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminCustomers;
