import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Dev from "../Dev";
import RequestForgotPassword from "../pages/Auth/components/RequestForgotPassword";
import SetNewPassword from "../pages/Auth/components/SetNewPassword";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import SignInPage from "../pages/Auth/SignInPage";
import SignUpPage from "../pages/Auth/SignUpPage";
import HomePage from "../pages/Home/HomePage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import PublicRoute from "./PublicRoute";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <HomePage /> },
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
      { path: "dev", element: <Dev /> },
    ],
  },
]);

export default router;
