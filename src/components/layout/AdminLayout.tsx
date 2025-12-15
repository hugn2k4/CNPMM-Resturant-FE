import { Box, Button, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { LayoutDashboard, LogOut, Menu as MenuIcon, MessageCircle, Package, ShoppingBag, Users } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useGlobal } from "../../hooks/useGlobal";
import { authService } from "../../services/authService";

const drawerWidth = 260;

const AdminLayout = () => {
  const { user, setUser } = useGlobal() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await authService.logout();
    if (setUser) setUser(null);
    navigate("/signin");
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/admin" },
    { icon: <MessageCircle size={20} />, label: "Chat Hỗ Trợ", path: "/admin/chat" },
    { icon: <ShoppingBag size={20} />, label: "Đơn Hàng", path: "/admin/orders" },
    { icon: <Users size={20} />, label: "Khách Hàng", path: "/admin/customers" },
    { icon: <Package size={20} />, label: "Sản Phẩm", path: "/admin/products" },
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 3,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          🍕 Restaurant Admin
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Quản lý hệ thống
        </Typography>
      </Box>

      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              mb: 0.5,
              bgcolor: location.pathname === item.path ? "primary.main" : "transparent",
              color: location.pathname === item.path ? "white" : "text.primary",
              "&:hover": {
                bgcolor: location.pathname === item.path ? "primary.dark" : "action.hover",
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? "white" : "inherit", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ position: "absolute", bottom: 0, width: "100%", p: 2 }}>
        <Button fullWidth variant="outlined" color="error" startIcon={<LogOut size={18} />} onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Menu Button - Only visible on mobile */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1100,
        }}
      >
        <Button variant="contained" onClick={handleDrawerToggle} sx={{ minWidth: 40, p: 1, boxShadow: 2 }}>
          <MenuIcon size={20} />
        </Button>
      </Box>

      {/* Sidebar for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Sidebar for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px solid #e0e0e0",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
        }}
      >
        {/* Admin Header */}
        <Box
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid #e0e0e0",
            py: 2,
            px: 3,
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 600, ml: { xs: 6, md: 0 } }}>
                {menuItems.find((item) => item.path === location.pathname)?.label || "Admin Dashboard"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 600,
                  }}
                >
                  ADMIN
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Admin Content */}
        <Box sx={{ flex: 1, overflow: "auto", pt: { xs: 2, md: 0 } }}>
          <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 3 } }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
