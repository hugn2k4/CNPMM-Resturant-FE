import { createContext } from "react";
import type { User } from "../types/models/user";

export interface GlobalState {
  user: User | null;
  accessToken: string | null;
  isLogin: boolean;
  wishlistIds: Set<string>;
}
interface GlobalContextProps extends GlobalState {
  setGlobal: (state: Partial<GlobalState>) => void;
  logout: () => void;
  refreshWishlist: () => Promise<void>;
}

export const GlobalContext = createContext<GlobalContextProps | null>(null);
