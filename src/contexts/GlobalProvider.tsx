import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { GlobalContext, type GlobalState } from "./GlobalContext";
import wishlistService from "../services/wishlistService";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GlobalState>({
    user: null,
    accessToken: null,
    isLogin: false,
    wishlistIds: new Set<string>(),
  });
  useEffect(() => {
    const userStrorage = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    if (userStrorage && accessToken) {
      setState({
        user: JSON.parse(userStrorage),
        accessToken: accessToken,
        isLogin: true,
        wishlistIds: new Set<string>(),
      });
      return;
    }

    // Fallback: if no localStorage but httpOnly cookie exists, fetch current user
    (async () => {
      try {
        const res = await axiosClient.get("/auth/me");
        const user = res.data?.user || res.data?.data?.user;
        if (user) {
          setState({ user, accessToken: null, isLogin: true, wishlistIds: new Set<string>() });
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Load wishlist when user logs in
  useEffect(() => {
    if (state.isLogin) {
      refreshWishlist();
    } else {
      setState((prev) => ({ ...prev, wishlistIds: new Set<string>() }));
    }
  }, [state.isLogin]);

  // Listen for global logout events (dispatched from axios client when refresh fails)
  useEffect(() => {
    const handleAppLogout = () => {
      performLogout();
    };
    window.addEventListener("app:logout", handleAppLogout);
    return () => window.removeEventListener("app:logout", handleAppLogout);
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (state.isLogin) {
      try {
        const productIds = await wishlistService.getWishlist();
        setState((prev) => ({ ...prev, wishlistIds: new Set(productIds) }));
      } catch (error) {
        console.error("Error refreshing wishlist:", error);
        setState((prev) => ({ ...prev, wishlistIds: new Set<string>() }));
      }
    }
  }, [state.isLogin]);

  const performLogout = () => {
    setState({ user: null, accessToken: null, isLogin: false, wishlistIds: new Set<string>() });
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    } catch {
      /* ignore */
    }
  };

  const setGlobal = (partial: Partial<GlobalState>) => {
    setState((prev) => {
      const newState = { ...prev, ...partial };
      if (partial.user !== undefined) {
        try {
          localStorage.setItem("user", JSON.stringify(newState.user));
        } catch {
          /* ignore */
        }
      }
      if (partial.accessToken !== undefined) {
        // Only write accessToken when non-empty, otherwise remove key
        try {
          if (newState.accessToken) localStorage.setItem("accessToken", newState.accessToken);
          else localStorage.removeItem("accessToken");
        } catch {
          /* ignore */
        }
      }
      if (partial.isLogin === false) {
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
        } catch {
          /* ignore */
        }
      }
      return newState;
    });
  };

  const logout = () => {
    performLogout();
  };

  const value = useMemo(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      isLogin: state.isLogin,
      wishlistIds: state.wishlistIds,
      setGlobal,
      logout,
      refreshWishlist,
    }),
    [state.user, state.accessToken, state.isLogin, state.wishlistIds]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
