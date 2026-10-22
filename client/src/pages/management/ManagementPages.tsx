import { roleHome, operationsBase } from "../../routes/access";
import { useState } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Box,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Truck,
  Users,
  UserRound,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useStore } from "../../app/Store";
import {
  api,
  date,
  money,
  statuses,
  useShipping,
  usePagedList,
} from "../../services/shop";
import type {
  Dashboard,
  Order,
  Product,
  User,
  Ticket,
} from "../../services/shop";
import { Empty, ErrorBox, Tag, LoadMore } from "../../components/common/UI";
import { TicketThread } from "../account/AccountPages";
import { PageMotion, PageLoader } from "../../components/common/PageMotion";
export function ManagementLayout() {
  const { user, loading, logout } = useStore();
  const navigate = useNavigate();
  const base = roleHome(user?.role);
  if (loading) return <PageLoader message="Đang kiểm tra tài khoản…" />;
  if (!user) return <Navigate to="/dang-nhap" replace />;
  if (user.role === "customer") return <Navigate to="/" replace />;
  return (
    <div className="management">
      <aside className="management-nav">
        <Link className="brand" to={base}>
          <img src="/images/logo.webp" alt="Tránh Trap" />
        </Link>
        <small>
          {user.role === "admin"
            ? "QUẢN TRỊ DOANH NGHIỆP"
            : "KHÔNG GIAN LÀM VIỆC"}
        </small>
        {[
          { to: "", label: "Tổng quan", icon: LayoutDashboard },
          { to: "/don-hang", label: "Xử lý đơn hàng", icon: ClipboardList },
          { to: "/ho-tro", label: "Hỗ trợ khách hàng", icon: Headphones },
          { to: "/khieu-nai", label: "Khiếu nại", icon: ShieldCheck },
          ...(user.role === "admin"
            ? [
                { to: "/san-pham", label: "Sản phẩm", icon: Box },
                { to: "/nguoi-dung", label: "Quản lý tài khoản", icon: Users },
                { to: "/phi-van-chuyen", label: "Phí vận chuyển", icon: Truck },
                { to: "/thong-bao", label: "Thông báo", icon: Bell },
              ]
            : []),
        ].map((x) => (
          <NavLink key={x.to} end={!x.to} to={`${base}${x.to}`}>
            <x.icon size={18} />
            {x.label}
          </NavLink>
        ))}
        <Link className="nav-bottom" to={`${base}/tai-khoan/ho-so`}>
          <UserRound size={18} />
          Trung tâm tài khoản
        </Link>
        <button
          onClick={() =>
            void logout(() => navigate("/", { replace: true, flushSync: true }))
          }
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </aside>
      <div className="management-content">
        <header>
          <div className="actions">
            <LayoutDashboard size={19} />
            <strong>
              {user.role === "admin"
                ? "Dashboard quản trị"
                : "Dashboard nhân viên"}
            </strong>
          </div>
          <div className="actions">
            <div className="account-menu">
              <Link
                className="icon yellow"
                style={{ width: 35, height: 35, borderRadius: "50%" }}
                to={`${base}/tai-khoan/ho-so`}
                aria-label="Trung tâm tài khoản"
              >
                <UserRound size={18} />
              </Link>
              <div className="dropdown">
                <Link to={`${base}/tai-khoan/ho-so`}>Trung tâm tài khoản</Link>
                <button
                  onClick={() =>
                    void logout(() =>
                      navigate("/", { replace: true, flushSync: true }),
                    )
                  }
                >
                  Đăng xuất
                </button>
              </div>
            </div>
            <strong>{user.name}</strong>
          </div>
        </header>
        <main className="management-body">
          <PageMotion />
        </main>
      </div>
    </div>
  );
}
const useDashboard = () => {
  const { user } = useStore();
  const path = operationsBase(user?.role);
  return useQuery({
    queryKey: ["dashboard", path],
    queryFn: () => api<Dashboard>(`${path}/dashboard`),
  });
};
export function DashboardPage() {
  const { user } = useStore();
  const q = useDashboard();
  const d = q.data;
  const admin = user?.role === "admin";
  const counts = [
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ].map((s) => ({
    status: s,
    count: d?.orderCounts[s] ?? 0,
  }));
  return (
    <>
      <Tag tone="blue">
        {admin ? "Góc nhìn kinh doanh" : "Hôm nay cùng Tránh Trap"}
      </Tag>
      <h1 style={{ marginTop: 15 }}>Xin chào, {user?.name} 👋</h1>
      <p>
        {admin
          ? "Theo dõi hoạt động kinh doanh và cùng đội ngũ chăm sóc khách hàng."
          : "Bắt đầu từ những đơn hàng cần xác nhận và các yêu cầu đang chờ bạn."}
      </p>
      {q.error && <ErrorBox error={q.error} />}
      <div className="stat-grid">
        {[
          {
            title: admin ? "Doanh thu đơn hoàn thành" : "Đơn chờ xác nhận",
            value: admin ? money(d?.revenue ?? 0) : counts[0].count,
            icon: admin ? Box : ClipboardList,
            tone: "yellow",
          },
          {
            title: admin ? "Tổng đơn hàng" : "Đang giao hàng",
            value: admin ? (d?.totalOrders ?? 0) : counts[2].count,
            icon: Truck,
            tone: "blue",
          },
          {
            title: "Yêu cầu chưa giải quyết",
            value: d?.openSupportCount ?? 0,
            icon: Headphones,
            tone: "mint",
          },
          {
            title: "Khiếu nại đang mở",
            value: d?.openComplaintCount ?? 0,
            icon: ShieldCheck,
            tone: "coral",
          },
        ].map((x) => (
          <div className="stat-card" key={x.title}>
            <span className={`icon ${x.tone}`}>
              <x.icon size={21} />
            </span>
            <strong>{q.isLoading ? "…" : x.value}</strong>
            <small>{x.title}</small>
          </div>
        ))}
      </div>
      <div className="grid two">
        <section className="card">
          <div className="spread">
            <h3>Tiến trình xử lý đơn</h3>
            <Tag tone="blue">Toàn bộ đơn hàng</Tag>
          </div>
          <div className="bar-chart">
            {counts.map((x) => (
              <div className="chart-column" key={x.status}>
                <strong>{x.count}</strong>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(2, (x.count / Math.max(1, ...counts.map((y) => y.count))) * 125)}px`,
                  }}
                />
                <small>{statuses[x.status]}</small>
              </div>
            ))}
          </div>
          <Link
            className="button small secondary"
            to={`${roleHome(user?.role)}/don-hang`}
          >
            Xem các đơn hàng
          </Link>
        </section>
        <section className="card">
          <h3>{admin ? "Kết nối hệ thống" : "Việc cần ưu tiên"}</h3>
          {admin ? (
            Object.entries(d?.integrations ?? {}).map(([key, v]) => (
              <div className="summary-row" key={key}>
                <strong>{key.toUpperCase()}</strong>
                <Tag tone={v ? "mint" : "coral"}>
                  {v ? "Đã có cấu hình" : "Chưa cấu hình"}
                </Tag>
              </div>
            ))
          ) : (
            <>
              <p>Có {counts[0].count} đơn hàng đang chờ xác nhận.</p>
              <p>Có {d?.newTicketCount ?? 0} yêu cầu mới cần tiếp nhận.</p>
              <Link
                className="button small"
                to={`${roleHome(user?.role)}/ho-tro`}
              >
                Đến trung tâm hỗ trợ
              </Link>
            </>
          )}
          {admin && (
            <p style={{ fontSize: 12, marginTop: 25 }}>
              Trạng thái này cho biết đã có cấu hình. Kết nối thực tế cần được
              kiểm tra khi sử dụng dịch vụ.
            </p>
          )}
        </section>
      </div>
      <div className="card" style={{ marginTop: 25 }}>
        <h3>Đơn hàng mới</h3>
        <OrdersTable orders={d?.orders.slice(0, 5) ?? []} />
      </div>
    </>
  );
}
function OrdersTable({
  orders,
  onEdit,
}: {
  orders: Order[];
  onEdit?: (o: Order) => void;
}) {
  const { user } = useStore();
  return orders.length ? (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>MÃ ĐƠN / THỜI GIAN</th>
            <th>KHÁCH HÀNG</th>
            <th>TỔNG TIỀN</th>
            <th>TRẠNG THÁI</th>
            <th>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>
                <strong>{o.code}</strong>
                <small className="muted" style={{ display: "block" }}>
                  {date(o.createdAt)}
                </small>
              </td>
              <td>
                {o.customer.name}
                <small className="muted" style={{ display: "block" }}>
                  {o.customer.province}
                </small>
              </td>
              <td>
                <strong>{money(o.total)}</strong>
                <small className="muted" style={{ display: "block" }}>
                  {statuses[o.paymentStatus]}
                </small>
              </td>
              <td>
                <Tag
                  tone={
                    o.status === "cancelled"
                      ? "coral"
                      : o.status === "delivered"
                        ? "mint"
                        : "blue"
                  }
                >
                  {statuses[o.status]}
                </Tag>
              </td>
              <td>
                {onEdit ? (
                  <button onClick={() => onEdit(o)}>Xem & xử lý →</button>
                ) : (
                  <Link to={`${roleHome(user?.role)}/don-hang`}>
                    Xem chi tiết
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty title="Chưa có đơn hàng" />
  );
}
export function ManagementOrdersPage() {
  const { user } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const q = usePagedList<Order>(
    `${operationsBase(user?.role)}/orders${filter === "all" ? "" : `?status=${filter}`}`,
  );
  const [selected, setSelected] = useState<Order | null>(null);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const items =
    q.data?.filter(
      (o) =>
        (filter === "all" || filter === o.status) &&
        `${o.code} ${o.customer.name} ${o.customer.phone}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    ) ?? [];
  return (
    <>
      <h1>Xử lý đơn hàng</h1>
      <p>Xác nhận đơn, cập nhật giao nhận và thông tin vận chuyển.</p>
      <div className="filters">
        {[
          "all",
          "pending",
          "confirmed",
          "shipping",
          "delivered",
          "cancelled",
        ].map((x) => (
          <button
            key={x}
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
          >
            {x === "all" ? "Tất cả" : statuses[x]}
          </button>
        ))}
      </div>
      <input
        className="search"
        placeholder="Tìm trong các đơn đã tải: mã đơn, tên, số điện thoại"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {Boolean(error || q.error) && <ErrorBox error={error || q.error} />}
      <section className="card">
        <OrdersTable
          orders={items}
          onEdit={(o) => {
            setError(undefined);
            void api<Order>(`${operationsBase(user?.role)}/orders/${o._id}`)
              .then(setSelected)
              .catch(setError);
          }}
        />
      </section>
      {selected && (
        <div className="modal-backdrop">
          <form
            className="modal form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              setError(undefined);
              void api(
                `${operationsBase(user?.role)}/orders/${selected._id}`,
                "PATCH",
                f,
              )
                .then(() => {
                  setSelected(null);
                  void q.refetch();
                })
                .catch(setError)
                .finally(() => setBusy(false));
            }}
          >
            <header className="spread">
              <h2>{selected.code}</h2>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setSelected(null)}
              >
                <X />
              </button>
            </header>
            <p>
              <strong>{selected.customer.name}</strong> ·{" "}
              {selected.customer.phone}
              <br />
              {selected.customer.email}
              <br />
              {selected.customer.address}, {selected.customer.province}
            </p>
            <div className="summary-row">
              <strong>
                {selected.product.name} × {selected.product.quantity}
              </strong>
              <strong>{money(selected.total)}</strong>
            </div>
            <small>
              Phí giao hàng: {money(selected.shippingFee)} ·{" "}
              {statuses[selected.paymentStatus]} ·{" "}
              {selected.paymentMethod.toUpperCase()}
            </small>
            <label>
              Trạng thái đơn
              <select name="status" defaultValue={selected.status}>
                {Object.keys(statuses)
                  .filter((x) =>
                    [
                      "pending",
                      "confirmed",
                      "shipping",
                      "delivered",
                      "cancelled",
                    ].includes(x),
                  )
                  .map((x) => (
                    <option key={x} value={x}>
                      {statuses[x]}
                    </option>
                  ))}
              </select>
            </label>
            <div className="form-row">
              <label>
                Đơn vị vận chuyển
                <input
                  name="carrier"
                  defaultValue={selected.carrier ?? ""}
                  maxLength={100}
                  placeholder="GHN / GHTK / Viettel Post…"
                />
              </label>
              <label>
                Mã vận đơn
                <input
                  name="trackingNumber"
                  defaultValue={selected.trackingNumber ?? ""}
                  maxLength={100}
                />
              </label>
            </div>
            {Boolean(error) && <ErrorBox error={error} />}
            <button className="button" disabled={busy}>
              {busy ? "Đang lưu…" : "Lưu cập nhật"}
            </button>
            <ul className="timeline">
              {selected.history.map((h, i) => (
                <li key={i}>
                  {h.note}
                  <small>{date(h.at)}</small>
                </li>
              ))}
            </ul>
          </form>
        </div>
      )}
      <LoadMore query={q} />
    </>
  );
}
export function ManagementTicketsPage({
  complaints = false,
}: {
  complaints?: boolean;
}) {
  const { user } = useStore();
  const [filter, setFilter] = useState("all");
  const q = usePagedList<Ticket>(
    `${operationsBase(user?.role)}/tickets?group=${complaints ? "complaint" : "support"}${filter === "all" ? "" : `&status=${filter}`}`,
  );
  const items = q.data?.filter(
    (t) =>
      (complaints ? t.type === "complaint" : t.type !== "complaint") &&
      (filter === "all" || t.status === filter),
  );
  return (
    <>
      <h1>{complaints ? "Xử lý khiếu nại" : "Trung tâm hỗ trợ khách hàng"}</h1>
      <p>Tiếp nhận, phản hồi và theo dõi tiến trình từng yêu cầu.</p>
      <div className="filters">
        {["all", "open", "processing", "resolved"].map((x) => (
          <button
            key={x}
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
          >
            {x === "all" ? "Tất cả" : statuses[x]}
          </button>
        ))}
      </div>
      {q.error && <ErrorBox error={q.error} />}
      <div className="card">
        {items?.length ? (
          items.map((t) => (
            <TicketThread
              key={t._id}
              ticket={t}
              management
              refresh={() => void q.refetch()}
            />
          ))
        ) : (
          <Empty title="Chưa có yêu cầu cần xử lý" />
        )}
      </div>
      <LoadMore query={q} />
    </>
  );
}
export function AdminProductPage() {
  const q = useQuery({
    queryKey: ["admin-product"],
    queryFn: () => api<Product>("/admin/product"),
  });
  const { toast } = useStore();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  if (q.isLoading) return <p>Đang tải sản phẩm…</p>;
  if (q.error || !q.data) return <ErrorBox error={q.error} />;
  return (
    <>
      <h1>Quản lý sản phẩm</h1>
      <p>
        Điều chỉnh giá, tồn kho và thành phần bộ trò chơi bất cứ khi nào cần.
      </p>
      <ProductEditor
        key={q.data._id}
        product={q.data}
        busy={busy}
        error={error}
        onSave={async (product) => {
          setBusy(true);
          setError(undefined);
          try {
            await api("/admin/product", "PUT", product);
            toast("Đã lưu thông tin sản phẩm.");
            void q.refetch();
          } catch (e) {
            setError(e);
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
function ProductEditor({
  product: p,
  onSave,
  busy,
  error,
}: {
  product: Product;
  onSave: (p: unknown) => Promise<void>;
  busy: boolean;
  error: unknown;
}) {
  const [components, setComponents] = useState(
    p.components.map(({ name, quantity, description }) => ({
      name,
      quantity,
      description,
    })),
  );
  return (
    <form
      className="card form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget));
        void onSave({
          ...f,
          price: Number(f.price),
          stock: Number(f.stock),
          active: f.active === "on",
          components,
        });
      }}
    >
      <div className="form-row">
        <label>
          Tên sản phẩm
          <input name="name" defaultValue={p.name} required minLength={2} />
        </label>
        <label>
          Giá bán (VND)
          <input
            name="price"
            type="number"
            min={1000}
            max={100000000}
            defaultValue={p.price}
            required
          />
        </label>
      </div>
      <label>
        Mô tả
        <textarea
          name="description"
          defaultValue={p.description}
          minLength={20}
          maxLength={4000}
          required
        />
      </label>
      <div className="form-row">
        <label>
          Tồn kho
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={p.stock}
            required
          />
        </label>
        <label>
          Độ tuổi
          <input name="age" defaultValue={p.age} required />
        </label>
      </div>
      <div className="form-row">
        <label>
          Số người chơi
          <input name="players" defaultValue={p.players} required />
        </label>
        <label>
          Thời gian mỗi ván
          <input name="duration" defaultValue={p.duration} required />
        </label>
      </div>
      <label>
        <input name="active" type="checkbox" defaultChecked={p.active} />
        Mở bán sản phẩm
      </label>
      <div className="spread">
        <h3>Thành phần trong hộp</h3>
        <button
          className="button small secondary"
          type="button"
          onClick={() =>
            setComponents([
              ...components,
              { name: "", quantity: 1, description: "" },
            ])
          }
        >
          <Plus size={16} />
          Thêm thành phần
        </button>
      </div>
      {components.map((c, i) => (
        <div className="address-card form-stack" key={i}>
          <div className="form-row">
            <label>
              Tên thành phần
              <input
                value={c.name}
                required
                minLength={2}
                onChange={(e) =>
                  setComponents(
                    components.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              Số lượng
              <input
                value={c.quantity}
                type="number"
                min={1}
                max={10000}
                onChange={(e) =>
                  setComponents(
                    components.map((x, j) =>
                      j === i ? { ...x, quantity: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
            </label>
          </div>
          <label>
            Mô tả
            <input
              value={c.description}
              maxLength={500}
              onChange={(e) =>
                setComponents(
                  components.map((x, j) =>
                    j === i ? { ...x, description: e.target.value } : x,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            style={{ justifySelf: "start" }}
            disabled={components.length === 1}
            onClick={() => setComponents(components.filter((_, j) => j !== i))}
          >
            <Trash2 size={16} /> Xóa thành phần
          </button>
        </div>
      ))}
      {Boolean(error) && <ErrorBox error={error} />}
      <button
        className="button"
        disabled={busy}
        style={{ justifySelf: "start" }}
      >
        {busy ? "Đang lưu…" : "Lưu thông tin sản phẩm"}
      </button>
    </form>
  );
}
export function ShippingPage() {
  const q = useShipping();
  const [search, setSearch] = useState("");
  const { toast } = useStore();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState("");
  return (
    <>
      <Tag tone="mint">Giao hàng toàn quốc</Tag>
      <h1 style={{ marginTop: 15 }}>Quản lý phí vận chuyển</h1>
      <p>
        Phí mặc định: <strong>{money(q.data?.defaultFee ?? 25000)}</strong>. Cấu
        hình riêng từng tỉnh/thành sẽ được ưu tiên khi khách đặt hàng.
      </p>
      <input
        className="search"
        aria-label="Tìm tỉnh thành"
        placeholder="Tìm tỉnh / thành phố…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {Boolean(error || q.error) && <ErrorBox error={error || q.error} />}
      <div className="card shipping-grid">
        {q.data?.provinces
          .filter((p) =>
            p.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")),
          )
          .map((p) => {
            const rate = q.data.rates.find((r) => r.province === p);
            return (
              <form
                className="shipping-row"
                key={`${p}-${rate?.fee ?? "default"}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  setBusy(p);
                  setError(undefined);
                  const fee = Number(new FormData(e.currentTarget).get("fee"));
                  void api(`/admin/shipping/${encodeURIComponent(p)}`, "PUT", {
                    fee,
                  })
                    .then(() => {
                      toast(`Đã cập nhật phí giao hàng ${p}.`);
                      void q.refetch();
                    })
                    .catch(setError)
                    .finally(() => setBusy(""));
                }}
              >
                <div className="spread">
                  <div>
                    <strong>{p}</strong>
                    <small>
                      {rate ? "Đã cấu hình riêng" : "Đang dùng phí mặc định"}
                    </small>
                  </div>
                  <div className="actions">
                    <input
                      name="fee"
                      aria-label={`Phí vận chuyển ${p}`}
                      type="number"
                      min={0}
                      max={1000000}
                      defaultValue={rate?.fee ?? q.data.defaultFee}
                      required
                    />
                    <button className="button small" disabled={busy === p}>
                      Lưu
                    </button>
                  </div>
                </div>
                {rate && (
                  <button
                    className="muted"
                    type="button"
                    style={{ fontSize: 11, marginTop: 10 }}
                    onClick={() =>
                      void api(
                        `/admin/shipping/${encodeURIComponent(p)}`,
                        "DELETE",
                      )
                        .then(() => q.refetch())
                        .catch(setError)
                    }
                  >
                    Khôi phục phí mặc định
                  </button>
                )}
              </form>
            );
          })}
      </div>
    </>
  );
}
export function AdminUsersPage() {
  const q = usePagedList<User>("/admin/users");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<User | null>(null);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const { toast } = useStore();
  return (
    <>
      <div className="spread">
        <div>
          <h1>Quản lý tài khoản</h1>
          <p>
            Tạo tài khoản, hỗ trợ khôi phục và kiểm soát trạng thái hoạt động.
          </p>
        </div>
        <button className="button" onClick={() => setCreating(true)}>
          <Plus size={18} />
          Tạo tài khoản
        </button>
      </div>
      <input
        className="search"
        value={search}
        placeholder="Tìm trong các tài khoản đã tải: tên hoặc email…"
        onChange={(e) => setSearch(e.target.value)}
      />
      {Boolean(error || q.error) && <ErrorBox error={error || q.error} />}
      <div className="card table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>HỌ TÊN / EMAIL</th>
              <th>VAI TRÒ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {q.data
              ?.filter((u) =>
                `${u.name} ${u.email}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((u) => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.name}</strong>
                    <small className="muted" style={{ display: "block" }}>
                      {u.email}
                    </small>
                  </td>
                  <td>{u.role}</td>
                  <td>
                    <Tag tone={u.active ? "mint" : "coral"}>
                      {u.active ? "Hoạt động" : "Đã khóa"}
                    </Tag>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        void api<User>(`/admin/users/${u._id}`)
                          .then(setDetail)
                          .catch(setError)
                      }
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() =>
                        void api(`/admin/users/${u._id}`, "PATCH", {
                          active: !u.active,
                        })
                          .then(() => q.refetch())
                          .catch(setError)
                      }
                    >
                      {u.active ? "Khóa" : "Mở khóa"}
                    </button>
                    <button
                      onClick={() =>
                        void api<{ message: string }>(
                          `/admin/users/${u._id}/reset-password`,
                          "POST",
                        )
                          .then((r) => toast(r.message))
                          .catch(setError)
                      }
                    >
                      Gửi đặt lại mật khẩu
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {creating && (
        <div className="modal-backdrop">
          <form
            className="modal form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const body = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              setError(undefined);
              void api("/admin/users", "POST", body)
                .then(() => {
                  setCreating(false);
                  toast("Đã tạo tài khoản.");
                  void q.refetch();
                })
                .catch(setError)
                .finally(() => setBusy(false));
            }}
          >
            <header className="spread">
              <h2>Tạo tài khoản</h2>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setCreating(false)}
              >
                <X />
              </button>
            </header>
            <label>
              Họ tên
              <input name="name" required minLength={2} />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Mật khẩu ban đầu
              <input
                name="password"
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Vai trò
              <select name="role">
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {Boolean(error) && <ErrorBox error={error} />}
            <button disabled={busy} className="button">
              Tạo tài khoản
            </button>
          </form>
        </div>
      )}
      {detail && (
        <div className="modal-backdrop">
          <div className="modal">
            <header className="spread">
              <h2>Thông tin tài khoản</h2>
              <button aria-label="Đóng" onClick={() => setDetail(null)}>
                <X />
              </button>
            </header>
            <p>
              Họ tên: <strong>{detail.name}</strong>
              <br />
              Email: {detail.email}
              <br />
              Điện thoại: {detail.phone || "Chưa cung cấp"}
              <br />
              Vai trò: {detail.role}
              <br />
              Ngày sinh: {detail.birthday || "Chưa cung cấp"}
              <br />
              Trạng thái: {detail.active ? "Hoạt động" : "Đã khóa"}
            </p>
            <h3>Địa chỉ đã lưu</h3>
            {detail.addresses.map((a, i) => (
              <p key={i}>
                {a.name} · {a.phone}
                <br />
                {a.detail}
              </p>
            ))}
          </div>
        </div>
      )}
      <LoadMore query={q} />
    </>
  );
}
export function AdminNotificationsPage() {
  const { user } = useStore();
  const q = useDashboard();
  return (
    <>
      <h1>Thông báo vận hành</h1>
      <p>Các công việc đang cần đội ngũ xử lý.</p>
      {q.error && <ErrorBox error={q.error} />}
      <div className="card">
        {q.data?.orders
          .filter((o) => o.status === "pending")
          .map((o) => (
            <div className="notice" key={o._id}>
              <strong>Đơn mới {o.code}</strong>
              <p>
                {o.customer.name} · {money(o.total)}
              </p>
              <Link to={`${roleHome(user?.role)}/don-hang`}>Xử lý đơn →</Link>
            </div>
          ))}
        {q.data?.tickets
          .filter((t) => t.status === "open")
          .map((t) => (
            <div className="notice" key={t._id}>
              <strong>Yêu cầu mới: {t.subject}</strong>
              <p>{t.name}</p>
              <Link
                to={
                  t.type === "complaint" ? "/admin/khieu-nai" : "/admin/ho-tro"
                }
              >
                Tiếp nhận →
              </Link>
            </div>
          ))}
        {!q.data?.orders.some((o) => o.status === "pending") &&
          !q.data?.tickets.some((t) => t.status === "open") && (
            <Empty title="Chưa có thông báo mới" />
          )}
      </div>
    </>
  );
}

export function ManagementAccountLayout() {
  const { user } = useStore();
  const base = roleHome(user?.role);
  return (
    <section className="card">
      <nav className="filters" aria-label="Trung tâm tài khoản">
        <NavLink
          className="button secondary small"
          to={`${base}/tai-khoan/ho-so`}
        >
          Hồ sơ
        </NavLink>
        <NavLink
          className="button secondary small"
          to={`${base}/tai-khoan/doi-mat-khau`}
        >
          Đổi mật khẩu
        </NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
