import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../services/shop";
import type { User } from "../services/shop";
interface Store {
  user: User | null;
  loading: boolean;
  authError: Error | null;
  setUser: (u: User | null) => void;
  logout: (onSuccess: () => void | Promise<void>) => Promise<void>;
  quantity: number;
  setQuantity: (n: number) => void;
  addToCart: (n?: number) => void;
  toast: (text: string) => void;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [transitioning, setTransitioning] = useState(false);
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () =>
      api<User>("/auth/me").catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });
  useEffect(() => {
    const expired = () => {
      void queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "me",
      });
      queryClient.setQueryData(["me"], null);
    };
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, [queryClient]);
  const [quantity, setQ] = useState(() => {
    const n = Number(localStorage.getItem("tt_cart"));
    return Number.isFinite(n) ? Math.max(0, Math.min(10, Math.floor(n))) : 0;
  });
  const [message, setMessage] = useState("");
  const setQuantity = (n: number) => {
    const value = Math.max(0, Math.min(10, n));
    setQ(value);
    localStorage.setItem("tt_cart", String(value));
  };
  const toast = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 4500);
  };
  const setUser = (user: User | null) => {
    void queryClient.cancelQueries();
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "me",
    });
    queryClient.setQueryData(["me"], user);
  };
  return (
    <Context.Provider
      value={{
        user: me.data ?? null,
        loading: me.isLoading || transitioning,
        authError: me.error,
        setUser,
        logout: async (onSuccess) => {
          setTransitioning(true);
          try {
            await api("/auth/logout", "POST");
            setUser(null);
            await onSuccess();
          } finally {
            setTransitioning(false);
          }
        },
        quantity,
        setQuantity,
        addToCart: (n = 1) => {
          setQuantity(quantity + n);
          toast("Đã thêm bộ Tránh Trap vào giỏ hàng.");
        },
        toast,
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </Context.Provider>
  );
}
// This hook intentionally shares its provider module.
// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => {
  const value = useContext(Context);
  if (!value) throw new Error("StoreProvider is missing");
  return value;
};
