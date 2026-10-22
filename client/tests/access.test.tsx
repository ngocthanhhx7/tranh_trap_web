import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "../src/routes/router";
import { StoreProvider } from "../src/app/Store";
import type { Role, User } from "../src/services/shop";
import { RouteErrorBoundary } from "../src/pages/public/ErrorPage";

let currentUser: User | null;
let loginRole: Role;
const requests: string[] = [];
const routers: ReturnType<typeof createMemoryRouter>[] = [];
const clients: QueryClient[] = [];
const member = (role: Role): User => ({
  _id: `${role}-test`,
  name: `Người dùng ${role}`,
  email: `${role}@example.test`,
  role,
  active: true,
  phone: "",
  gender: "",
  birthday: "",
  addresses: [],
});
function mount(path: string, role: Role | null, routes = appRoutes) {
  currentUser = role ? member(role) : null;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  clients.push(client);
  routers.push(router);
  render(
    <QueryClientProvider client={client}>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </QueryClientProvider>,
  );
  return { router, client };
}
beforeEach(() => {
  vi.stubGlobal("scrollTo", vi.fn());
  requests.length = 0;
  loginRole = "customer";
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      requests.push(path);
      const json = (data: unknown, status = 200) =>
        new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      if (path.endsWith("/auth/me"))
        return currentUser
          ? json(currentUser)
          : json({ message: "Phiên đăng nhập chưa có." }, 401);
      if (path.endsWith("/auth/login") || path.endsWith("/auth/register")) {
        currentUser = member(loginRole);
        return json(currentUser);
      }
      if (path.endsWith("/auth/logout")) {
        currentUser = null;
        return json({ message: "Đã đăng xuất." });
      }
      if (path.endsWith("/dashboard"))
        return json({
          orders: [],
          tickets: [],
          orderCounts: {},
          totalOrders: 0,
          openSupportCount: 0,
          openComplaintCount: 0,
          newTicketCount: 0,
          revenue: 0,
          integrations: {},
        });
      if (path.endsWith("/catalog"))
        return json({ product: null, integrations: { payos: false } });
      if (path.includes("limit=")) return json({ items: [], nextCursor: null });
      if (path.endsWith("/shipping"))
        return json({ provinces: [], rates: [], defaultFee: 25000 });
      return json([]);
    }),
  );
});
afterEach(() => {
  for (const router of routers.splice(0)) router.dispose();
  for (const client of clients.splice(0)) client.clear();
  vi.unstubAllGlobals();
});

describe("role routes use the actual app route tree", () => {
  it.each(["/admin", "/staff/don-hang", "/tai-khoan/ho-so"])(
    "guest direct URL %s requires login",
    async (path) => {
      const { router } = mount(path, null);
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/dang-nhap"),
      );
      expect(
        await screen.findByRole("heading", { name: "Chào bạn trở lại!" }),
      ).toBeTruthy();
      expect(requests.some((p) => p.includes("/dashboard"))).toBe(false);
    },
  );
  it.each([
    "/admin",
    "/admin/nguoi-dung",
    "/staff",
    "/staff/don-hang",
    "/quan-ly",
  ])("customer cannot access %s", async (path) => {
    mount(path, "customer");
    expect(
      await screen.findByRole("heading", {
        name: "Bạn không có quyền truy cập",
      }),
    ).toBeTruthy();
    expect(
      requests.some((p) => /\/(dashboard|operations|admin\/users)/.test(p)),
    ).toBe(false);
  });
  it.each([
    ["admin", "/staff"],
    ["admin", "/staff/ho-tro"],
    ["staff", "/admin"],
    ["staff", "/admin/nguoi-dung"],
  ] as const)("%s is forbidden from %s", async (role, path) => {
    mount(path, role);
    expect(
      await screen.findByRole("heading", {
        name: "Bạn không có quyền truy cập",
      }),
    ).toBeTruthy();
    expect(requests.some((p) => p.endsWith("/dashboard"))).toBe(false);
  });
  for (const role of ["admin", "staff"] as const) {
    it.each([
      "/",
      "/san-pham",
      "/gio-hang",
      "/thanh-toan",
      "/lien-he",
      "/tai-khoan/ho-so",
      "/dang-nhap",
    ])(`${role} cannot open customer screen %s`, async (path) => {
      const { router } = mount(path, role);
      await waitFor(() =>
        expect(router.state.location.pathname).toBe(`/${role}`),
      );
      expect(
        await screen.findByText(
          role === "admin" ? "Dashboard quản trị" : "Dashboard nhân viên",
        ),
      ).toBeTruthy();
      expect(requests.some((p) => p.endsWith("/catalog"))).toBe(false);
      expect(requests).toContain(
        `/api/v1/${role === "admin" ? "admin/operations" : "staff"}/dashboard`,
      );
    });
    it(`${role} uses its own account center`, async () => {
      mount(`/${role}/tai-khoan/ho-so`, role);
      expect(
        await screen.findByRole("heading", { name: "Hồ sơ của tôi" }),
      ).toBeTruthy();
      expect(screen.queryByRole("link", { name: "Bộ trò chơi" })).toBeNull();
    });
  }
  it("staff cannot mount an admin feature under its own namespace", async () => {
    mount("/staff/san-pham", "staff");
    expect(
      await screen.findByRole("heading", { name: "Không tìm thấy trang" }),
    ).toBeTruthy();
    expect(requests.some((p) => p.endsWith("/admin/product"))).toBe(false);
  });
});
describe("login and logout destinations", () => {
  it.each(["customer", "staff", "admin"] as const)(
    "%s login ignores a conflicting next URL",
    async (role) => {
      loginRole = role;
      const ui = userEvent.setup();
      const { router } = mount("/dang-nhap?next=/admin/nguoi-dung", null);
      await screen.findByRole("heading", { name: "Chào bạn trở lại!" });
      await ui.type(
        screen.getByRole("textbox", { name: "Email" }),
        `${role}@example.test`,
      );
      await ui.type(
        screen.getByLabelText("Mật khẩu", { exact: true }),
        "TestPassword123!",
      );
      await ui.click(
        screen.getByRole("button", { name: "Đăng nhập", exact: true }),
      );
      await waitFor(() =>
        expect(router.state.location.pathname).toBe(
          role === "customer" ? "/" : `/${role}`,
        ),
      );
      if (role === "customer") {
        const account = await screen.findByRole("link", {
          name: "Mở trung tâm tài khoản",
        });
        expect(
          screen.queryByRole("link", { name: "Đăng nhập", exact: true }),
        ).toBeNull();
        await ui.click(account);
        expect(
          await screen.findByRole("heading", { name: "Hồ sơ của tôi" }),
        ).toBeTruthy();
      }
    },
  );
  it.each(["customer", "staff", "admin"] as const)(
    "%s logout returns Home and clears cached private data",
    async (role) => {
      const ui = userEvent.setup();
      const { router, client } = mount(
        role === "customer" ? "/tai-khoan/ho-so" : `/${role}/tai-khoan/ho-so`,
        role,
      );
      await screen.findByRole("heading", { name: "Hồ sơ của tôi" });
      client.setQueryData(["private-before-logout"], { confidential: true });
      await ui.click(
        screen.getAllByRole("button", { name: "Đăng xuất", exact: true })[0],
      );
      await waitFor(() => expect(router.state.location.pathname).toBe("/"));
      expect(client.getQueryData(["private-before-logout"])).toBeUndefined();
      await router.navigate("/admin");
      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/dang-nhap"),
      );
    },
  );
});
describe("error pages and authentication failures", () => {
  it.each([
    [400, "Yêu cầu chưa hợp lệ"],
    [403, "Bạn không có quyền truy cập"],
    [404, "Không tìm thấy trang"],
    [500, "Có sự cố khi tải trang"],
    [503, "Tạm thời chưa thể kết nối"],
  ] as const)("%s page has correct semantics", async (status, title) => {
    mount(`/loi/${status}`, null);
    expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
  });
  it("an unknown path displays 404", async () => {
    mount("/duong-dan-khong-ton-tai", null);
    expect(
      await screen.findByRole("heading", { name: "Không tìm thấy trang" }),
    ).toBeTruthy();
  });
  it("runtime exceptions display 500 without exposing internal error text", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function BrokenPage() {
      throw new Error("private-error-canary");
      return null;
    }
    mount("/boom", null, [
      {
        path: "/boom",
        element: <BrokenPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ]);
    expect(
      await screen.findByRole("heading", { name: "Có sự cố khi tải trang" }),
    ).toBeTruthy();
    expect(screen.queryByText("private-error-canary")).toBeNull();
    expect(
      screen.queryByRole("heading", { name: "Không tìm thấy trang" }),
    ).toBeNull();
  });
  it("an unavailable auth service fails closed with 503", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("unavailable"));
    mount("/admin", "admin");
    expect(
      await screen.findByRole("heading", { name: "Tạm thời chưa thể kết nối" }),
    ).toBeTruthy();
    expect(screen.queryByText("Dashboard quản trị")).toBeNull();
  });
});

describe("password confirmation", () => {
  it.each([
    ["/dang-ky", "Nhập lại mật khẩu", "Tạo tài khoản"],
    [
      "/dat-lai-mat-khau?token=" + "a".repeat(64),
      "Nhập lại mật khẩu",
      "Lưu mật khẩu mới",
    ],
    ["/tai-khoan/doi-mat-khau", "Nhập lại mật khẩu mới", "Lưu mật khẩu mới"],
  ])("rejects mismatched confirmation at %s", async (path, label, button) => {
    const ui = userEvent.setup();
    mount(path, path.startsWith("/tai-khoan") ? "customer" : null);
    const confirm = await screen.findByLabelText(label);
    const form = confirm.closest("form")!;
    for (const input of Array.from(form.querySelectorAll("input"))) {
      if (input.type === "checkbox") await ui.click(input);
      else
        await ui.type(
          input,
          input.name === "email"
            ? "test@example.test"
            : input.name === "confirmPassword"
              ? "DifferentPassword123!"
              : "TestPassword123!",
        );
    }
    await ui.click(screen.getByRole("button", { name: button, exact: true }));
    expect(
      await screen.findByText("Mật khẩu xác nhận chưa khớp."),
    ).toBeTruthy();
    expect(
      requests.some((p) =>
        /auth\/(register|reset-password)|account\/password/.test(p),
      ),
    ).toBe(false);
  });
});
