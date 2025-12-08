import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Dev from "../Dev";
import RequestForgotPassword from "../pages/Auth/components/RequestForgotPassword";
import SetNewPassword from "../pages/Auth/components/SetNewPassword";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import SignInPage from "../pages/Auth/SignInPage";
import SignUpPage from "../pages/Auth/SignUpPage";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import HomePage from "../pages/Home/HomePage";
import LoyaltyPointsPage from "../pages/LoyaltyPoints";
import MyOrdersPage from "../pages/MyOrders/MyOrdersPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import OrderSuccessPage from "../pages/OrderSuccess/OrderSuccessPage";
import ProductDetailPage from "../pages/Product/ProductDetailPage";
import ProductListPage from "../pages/Product/ProductListPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import VouchersPage from "../pages/Vouchers";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "*", element: <NotFoundPage /> },
      {
        element: <PublicRoute />,
        children: [
          { path: "signin", element: <SignInPage /> },
          { path: "signup", element: <SignUpPage /> },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
            children: [
              { path: "", element: <RequestForgotPassword /> },
              { path: "set-new-password", element: <SetNewPassword /> },
            ],
          },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          { path: "profile", element: <ProfilePage /> },
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "order-success/:orderId", element: <OrderSuccessPage /> },
          { path: "my-orders", element: <MyOrdersPage /> },
          { path: "loyalty-points", element: <LoyaltyPointsPage /> },
          { path: "vouchers", element: <VouchersPage /> },
        ],
      },
      { path: "dev", element: <Dev /> },
    ],
  },
]);

export default router;
