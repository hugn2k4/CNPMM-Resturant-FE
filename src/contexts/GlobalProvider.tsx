import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import wishlistService from "../services/wishlistService";
import type { User } from "../types/models/user";
import axiosClient from "../utils/axiosClient";
import { GlobalContext, type GlobalState } from "./GlobalContext";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GlobalState>({
    user: null,
    accessToken: null,
    isLogin: false,
    isLoading: true,
    wishlistIds: new Set<string>(),
  });
  useEffect(() => {
    const userStrorage = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    console.log("🔄 GlobalProvider init - Loading from localStorage:", {
      hasUser: !!userStrorage,
      hasToken: !!accessToken,
    });
    if (userStrorage && accessToken) {
      const user = JSON.parse(userStrorage);
      console.log("👤 Loaded user:", user);
      setState({
        user,
        accessToken: accessToken,
        isLogin: true,
        isLoading: false,
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
          setState({ user, accessToken: null, isLogin: true, isLoading: false, wishlistIds: new Set<string>() });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  // Load wishlist when user logs in
  useEffect(() => {
    if (state.isLogin) {
      void refreshWishlist();
    } else {
      setState((prev) => ({ ...prev, wishlistIds: new Set<string>() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setState({ user: null, accessToken: null, isLogin: false, isLoading: false, wishlistIds: new Set<string>() });
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    } catch {
      /* ignore */
    }
  };

  const setGlobal = useCallback((partial: Partial<GlobalState>) => {
    setState((prev) => {
      const newState = { ...prev, ...partial };
      if (partial.user !== undefined) {
        console.log("💾 Saving user to localStorage:", newState.user);
        try {
          localStorage.setItem("user", JSON.stringify(newState.user));
          console.log("✅ User saved successfully");
        } catch (e) {
          console.error("❌ Failed to save user:", e);
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
  }, []);

  const logout = useCallback(() => {
    performLogout();
  }, []);

  const setUser = useCallback(
    (user: User | null) => {
      setGlobal({ user });
    },
    [setGlobal]
  );

  const value = useMemo(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      isLogin: state.isLogin,
      isLoading: state.isLoading,
      wishlistIds: state.wishlistIds,
      setGlobal,
      setUser,
      logout,
      refreshWishlist,
    }),
    [
      state.user,
      state.accessToken,
      state.isLogin,
      state.isLoading,
      state.wishlistIds,
      setGlobal,
      setUser,
      logout,
      refreshWishlist,
    ]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
