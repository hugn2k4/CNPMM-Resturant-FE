import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../../hooks/useGlobal";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { isLogin } = useGlobal();

  useEffect(() => {
    if (!isLogin) {
      navigate("/signin");
    }
  }, [isLogin, navigate]);

  if (!isLogin) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <ShoppingCartIcon sx={{ fontSize: 40, mr: 2, color: "var(--color-primary)" }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              My Orders
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No orders yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your order history will appear here
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MyOrdersPage;
