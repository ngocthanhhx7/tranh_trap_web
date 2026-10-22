import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
export type Role = "customer" | "staff" | "admin";
export interface Address {
  province: string;
  label: string;
  name: string;
  phone: string;
  detail: string;
  isDefault: boolean;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  phone: string;
  gender: string;
  birthday: string;
  addresses: Address[];
}
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  age: string;
  players: string;
  duration: string;
  components: { name: string; quantity: number; description: string }[];
}
export interface Order {
  _id: string;
  code: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  product: { name: string; price: number; quantity: number };
  total: number;
  subtotal: number;
  shippingFee: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    province: string;
  };
  carrier?: string;
  trackingNumber?: string;
  checkoutUrl?: string;
  createdAt: string;
  history: { status: string; note: string; at: string }[];
}
export interface Ticket {
  _id: string;
  type: string;
  subject: string;
  status: string;
  email: string;
  name: string;
  orderCode?: string;
  messages: { sender: string; text: string; at: string }[];
  createdAt: string;
}
export interface Review {
  _id: string;
  orderId: string;
  name: string;
  rating: number;
  text: string;
}
export interface Notice {
  _id: string;
  title: string;
  text: string;
  read: boolean;
  createdAt: string;
}
export interface Shipping {
  provinces: string[];
  rates: { province: string; fee: number }[];
  defaultFee: number;
}
export interface Dashboard {
  orderCounts: Record<string, number>;
  totalOrders: number;
  openSupportCount: number;
  openComplaintCount: number;
  newTicketCount: number;
  orders: Order[];
  tickets: Ticket[];
  revenue?: number;
  integrations?: { gemini: boolean; smtp: boolean; payos: boolean };
}
const base = import.meta.env.VITE_API_URL || "/api/v1";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res
    .json()
    .catch(() => ({
      message: "Phản hồi hệ thống chưa hợp lệ. Vui lòng thử lại.",
    }));
  if (!res.ok) {
    const fields = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";
    if (
      res.status === 401 &&
      !path.startsWith("/auth/") &&
      typeof window !== "undefined"
    )
      window.dispatchEvent(new Event("session-expired"));
    throw new ApiError(
      res.status,
      fields || data.message || "Không thể kết nối hệ thống.",
    );
  }
  return data as T;
}
export const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
export const date = (value: string) => new Date(value).toLocaleString("vi-VN");
export const statuses: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang vận chuyển",
  delivered: "Hoàn thành",
  cancelled: "Đã hủy",
  open: "Chờ tiếp nhận",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};
export const useCatalog = () =>
  useQuery({
    queryKey: ["catalog"],
    queryFn: () =>
      api<{
        product: Product | null;
        integrations: { payos: boolean };
      }>("/catalog"),
  });
export const useShipping = () =>
  useQuery({
    queryKey: ["shipping"],
    queryFn: () => api<Shipping>("/shipping"),
  });
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}
export function usePagedList<T>(path: string) {
  const query = useInfiniteQuery({
    queryKey: ["paged-list", path],
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      api<CursorPage<T>>(
        `${path}${path.includes("?") ? "&" : "?"}limit=25${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`,
      ),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  return {
    data: query.data?.pages.flatMap((p) => p.items),
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
