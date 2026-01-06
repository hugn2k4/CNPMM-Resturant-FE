interface RouteMeta {
  title: string;
  breadcrumb: { label: string; path?: string }[];
  backgroundImage?: string;
}

const ROUTES_META: Record<string, RouteMeta> = {
  "/products": {
    title: "Our Menu",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "Menu " }],
  },
  "/my-orders": {
    title: "My Orders",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "My orders" }],
  },
  "/cart": {
    title: "Shoping Cart",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "Cart" }],
  },
  "/checkout": {
    title: "Checkout",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "Cart", path: "/cart" }, { label: "Checkout" }],
  },
  "/favorites": {
    title: "Favorites",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "Favourites" }],
  },
  "/chef": {
    title: "Our Chef",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "Chef" }],
  },
  "/404": {
    title: "404 Error",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "404" }],
  },
  "/signin": {
    title: "Sign In",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "Sign In" }],
  },
  "/signup": {
    title: "Sign Up",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "Sign Up" }],
  },
  "/forgot-password": {
    title: "Forgot Password",
    breadcrumb: [{ label: "Home", path: "/" }, { label: "SignIn", path: "/signin" }, { label: "Forgot Password" }],
  },
  "/forgot-password/set-new-password": {
    title: "Set New Password",
    breadcrumb: [
      { label: "Home", path: "/" },
      { label: "SignIn", path: "/signin" },
      { label: "Forgot Password", path: "/forgot-password" },
      { label: "Set New Password" },
    ],
  },
};

export default ROUTES_META;
