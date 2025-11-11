import { type ReactNode, useEffect, useState } from "react";
import { GlobalContext, type GlobalState } from "./GlobalContext";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GlobalState>({
    user: null,
    accessToken: null,
    isLogin: false,
  });
  useEffect(() => {
    const userStrorage = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    if (userStrorage && accessToken) {
      setState({
        user: JSON.parse(userStrorage),
        accessToken: accessToken,
        isLogin: true,
      });
    }
  }, []);

  // Listen for global logout events (dispatched from axios client when refresh fails)
  useEffect(() => {
    const handleAppLogout = () => {
      performLogout();
    };
    window.addEventListener("app:logout", handleAppLogout);
    return () => window.removeEventListener("app:logout", handleAppLogout);
  }, []);

  const performLogout = () => {
    setState({ user: null, accessToken: null, isLogin: false });
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
  return <GlobalContext.Provider value={{ ...state, setGlobal, logout }}>{children}</GlobalContext.Provider>;
};
