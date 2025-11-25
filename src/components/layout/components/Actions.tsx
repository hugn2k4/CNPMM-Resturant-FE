import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../../../hooks/useGlobal";
import { useSnackbar } from "../../../hooks/useSnackbar";
import LoginRequiredDialog from "../../common/LoginRequiredDialog";
import cartService from "../../../services/cartService";

function Actions() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { isLogin, user, logout } = useGlobal();
  const { showSnackbar } = useSnackbar();

  // Fetch cart item count when user is logged in
  useEffect(() => {
    if (isLogin) {
      const fetchCartCount = async () => {
        try {
          const count = await cartService.getCartItemCount();
          setCartItemCount(count);
        } catch (error) {
          console.error("Error fetching cart count:", error);
        }
      };
      fetchCartCount();

      // Refresh cart count every 30 seconds
      const interval = setInterval(fetchCartCount, 30000);
      return () => clearInterval(interval);
    } else {
      setCartItemCount(0);
    }
  }, [isLogin]);

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    navigate("/signin");
    handleMenuClose();
  };

  const handleSignUp = () => {
    navigate("/signup");
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleMyOrders = () => {
    navigate("/my-orders");
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    showSnackbar("Logout successful", "success");
    handleMenuClose();
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  const handleCartClick = () => {
    if (!isLogin) {
      setShowLoginDialog(true);
      return;
    }
    navigate("/cart");
  };

  const iconButtonSx = {
    color: "white",
    "&:hover": {
      color: "var(--color-primary)",
      // bgcolor: "rgba(255, 255, 255, 0.1)",
    },
    "&:not(:hover)": {
      color: "white",
    },
    transition: "all 0.2s ease",
    p: { xs: 1, md: 1.5 },
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title="Search" arrow>
        <IconButton aria-label="Search products" sx={iconButtonSx}>
          <SearchIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
        </IconButton>
      </Tooltip>

      {isLogin ? (
        <Tooltip title={user?.fullName || "Account"} arrow>
          <Box
            onClick={handleAccountClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Avatar
              src={user?.image || user?.avatar}
              alt={user?.fullName || "User"}
              sx={{
                width: { xs: 32, md: 36 },
                height: { xs: 32, md: 36 },
                bgcolor: "var(--color-primary)",
              }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                display: { xs: "none", sm: "block" },
                fontWeight: 500,
              }}
            >
              {user?.fullName || "User"}
            </Typography>
          </Box>
        </Tooltip>
      ) : (
        <Tooltip title="Account" arrow>
          <IconButton aria-label="Account" onClick={handleAccountClick} sx={iconButtonSx}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
          </IconButton>
        </Tooltip>
      )}

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          mt: 1,
          "& .MuiPaper-root": {
            minWidth: 200,
            borderRadius: 1,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        {isLogin
          ? [
              <MenuItem key="profile" onClick={handleProfile}>
                <ListItemIcon>
                  <AccountCircleOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>,
              <MenuItem key="orders" onClick={handleMyOrders}>
                <ListItemIcon>
                  <ShoppingCartOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>My Orders</ListItemText>
              </MenuItem>,
              <Divider key="divider" />,
              <MenuItem key="logout" onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>,
            ]
          : [
              <MenuItem key="login" onClick={handleLogin}>
                <ListItemIcon>
                  <LoginIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Login</ListItemText>
              </MenuItem>,
              <MenuItem key="signup" onClick={handleSignUp}>
                <ListItemIcon>
                  <PersonAddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sign up</ListItemText>
              </MenuItem>,
            ]}
      </Menu>

      <Tooltip title="Cart" arrow>
        <Box sx={{ position: "relative" }}>
          <IconButton aria-label="View cart" sx={iconButtonSx} onClick={handleCartClick}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
          </IconButton>
          {isLogin && cartItemCount > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "var(--color-primary)",
                color: "white",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </Box>
          )}
        </Box>
      </Tooltip>

      {/* Login Required Dialog for Cart */}
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        message="You need to login to view your cart. Please sign in or create a new account."
        returnUrl="/cart"
      />
    </Box>
  );
}

export default Actions;
