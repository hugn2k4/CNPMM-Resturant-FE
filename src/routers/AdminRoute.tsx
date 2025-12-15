import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { useGlobal } from "../hooks/useGlobal";

const AdminRoute = () => {
  const { user, isLogin, isLoading } = useGlobal();

  // Debug logging
  console.log("🔐 AdminRoute check:", {
    user,
    isLogin,
    isLoading,
    role: user?.role,
    hasUser: !!user,
    isAdmin: user?.role === "admin",
  });

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not logged in or not admin, redirect to home
  if (!user || user.role !== "admin") {
    console.log("❌ AdminRoute: Access denied - redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("✅ AdminRoute: Access granted");
  return <Outlet />;
};

export default AdminRoute;
