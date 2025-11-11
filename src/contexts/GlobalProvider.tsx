import { type ReactNode, useEffect, useState } from "react";
import { GlobalContext, type GlobalState } from "./GlobalContext";
import axiosClient from "../utils/axiosClient";

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
      return;
    }

    // Fallback: if no localStorage but httpOnly cookie exists, fetch current user
    (async () => {
      try {
        const res = await axiosClient.get("/auth/me");
        const user = res.data?.user || res.data?.data?.user;
        if (user) {
          setState({ user, accessToken: null, isLogin: true });
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const setGlobal = (partial: Partial<GlobalState>) => {
    setState((prev) => {
      const newState = { ...prev, ...partial };
      if (partial.user !== undefined) localStorage.setItem("user", JSON.stringify(newState.user));
      if (partial.accessToken !== undefined) localStorage.setItem("accessToken", newState.accessToken || "");
      if (partial.isLogin === false) {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
      return newState;
    });
  };

  const logout = () => {
    setState({ user: null, accessToken: null, isLogin: false });
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };
  return <GlobalContext.Provider value={{ ...state, setGlobal, logout }}>{children}</GlobalContext.Provider>;
};
