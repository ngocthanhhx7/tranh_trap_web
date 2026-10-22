import { operationsBase } from "../../routes/access";
import { useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Bell,
  ClipboardList,
  Headphones,
  LogOut,
  MapPin,
  Shield,
  Star,
  UserRound,
  Mail,
  MessageCircle,
  X,
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
  Address,
  Notice,
  Order,
  Review,
  Ticket,
  User,
} from "../../services/shop";
import {
  ButtonLink,
  Empty,
  ErrorBox,
  Tag,
  LoadMore,
} from "../../components/common/UI";
import { OrderDetails } from "../public/CommercePages";
export function AccountLayout() {
  const { user, loading, logout } = useStore();
  const navigate = useNavigate();
  if (loading) return <div className="container page">Đang tải tài khoản…</div>;
  if (!user) return <Navigate to="/dang-nhap" replace />;
  return (
    <div className="container page account-layout">
      <aside className="account-sidebar">
        <div className="account-identity">
          <span className="icon yellow">
            <UserRound />
          </span>
          <div>
            <strong>{user.name}</strong>
            <small className="muted" style={{ display: "block" }}>
              Trung tâm tài khoản
            </small>
          </div>
        </div>
        {[
          { to: "ho-so", label: "Hồ sơ", icon: UserRound },
          { to: "doi-mat-khau", label: "Đổi mật khẩu", icon: Shield },
          ...(user.role === "customer"
            ? [
                { to: "dia-chi", label: "Địa chỉ", icon: MapPin },
                { to: "email", label: "Email", icon: Mail },
                { to: "thong-bao", label: "Thông báo", icon: Bell },
                { to: "don-hang", label: "Đơn hàng", icon: ClipboardList },
                { to: "danh-gia", label: "Đánh giá", icon: Star },
                { to: "ho-tro", label: "Hỗ trợ & Khiếu nại", icon: Headphones },
              ]
            : []),
        ].map((x) => (
          <NavLink key={x.to} to={`/tai-khoan/${x.to}`}>
            <x.icon size={18} />
            {x.label}
          </NavLink>
        ))}
        {user.role !== "customer" && (
          <Link to="/quan-ly">Dashboard {user.role}</Link>
        )}
        <button
          onClick={() =>
            void logout(() => navigate("/", { replace: true, flushSync: true }))
          }
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </aside>
      <section className="card account-main">
        <Outlet />
      </section>
    </div>
  );
}
export function ProfilePage() {
  const { user, setUser, toast } = useStore();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="panel-heading">
        <h1>Hồ sơ của tôi</h1>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản.</p>
      </div>
      <div className="profile-avatar">
        <img src="/images/mascot.webp" alt="Avatar Sóc Thám Tử" />
        <small>
          {user?.role === "customer"
            ? "Thành viên Tránh Trap"
            : user?.role === "admin"
              ? "Quản trị viên"
              : "Nhân viên"}
        </small>
      </div>
      <form
        className="form-stack profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(e.currentTarget));
          setBusy(true);
          setError(undefined);
          void api<User>("/account/profile", "PATCH", f)
            .then((u) => {
              setUser(u);
              toast("Đã cập nhật hồ sơ.");
            })
            .catch(setError)
            .finally(() => setBusy(false));
        }}
      >
        <label>
          Email
          <input value={user?.email ?? ""} disabled />
        </label>
        <label>
          Họ và tên
          <input name="name" defaultValue={user?.name} required minLength={2} />
        </label>
        <label>
          Số điện thoại
          <input
            name="phone"
            defaultValue={user?.phone ?? ""}
            pattern="(0|\+84)[0-9]{9,10}"
          />
        </label>
        <div className="form-row">
          <label>
            Giới tính
            <select name="gender" defaultValue={user?.gender ?? ""}>
              <option value="">Chưa cung cấp</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label>
            Ngày sinh
            <input
              name="birthday"
              type="date"
              defaultValue={user?.birthday ?? ""}
            />
          </label>
        </div>
        {Boolean(error) && <ErrorBox error={error} />}
        <button
          className="button"
          style={{ justifySelf: "start" }}
          disabled={busy}
        >
          {busy ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </form>
    </>
  );
}
export function PasswordPage({ email = false }: { email?: boolean }) {
  const { toast, setUser } = useStore();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="panel-heading">
        <h1>{email ? "Đổi địa chỉ email" : "Đổi mật khẩu"}</h1>
        <p>Xác thực bằng mật khẩu hiện tại để bảo vệ tài khoản.</p>
      </div>
      <form
        className="form-stack profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = Object.fromEntries(new FormData(form));
          if (!email && f.password !== f.confirmPassword) {
            setError(new Error("Mật khẩu xác nhận chưa khớp."));
            return;
          }
          setError(undefined);
          setBusy(true);
          void api<User & { message: string }>(
            `/account/${email ? "email" : "password"}`,
            "POST",
            f,
          )
            .then((r) => {
              if (email) setUser(r);
              toast(email ? "Đã cập nhật email." : r.message);
              form.reset();
            })
            .catch(setError)
            .finally(() => setBusy(false));
        }}
      >
        <label>
          Mật khẩu hiện tại
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
          />
        </label>
        {email ? (
          <label>
            Email mới
            <input name="email" type="email" required autoComplete="email" />
          </label>
        ) : (
          <>
            <label>
              Mật khẩu mới
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={10}
                maxLength={128}
              />
              <small>Tối thiểu 10 ký tự.</small>
            </label>
            <label>
              Nhập lại mật khẩu mới
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={10}
              />
            </label>
          </>
        )}
        {Boolean(error) && <ErrorBox error={error} />}
        <button className="button" disabled={busy}>
          {busy
            ? "Đang cập nhật…"
            : email
              ? "Lưu email mới"
              : "Lưu mật khẩu mới"}
        </button>
      </form>
    </>
  );
}
export function AddressesPage() {
  const shipping = useShipping();
  const { user, setUser, toast } = useStore();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const addresses = user?.addresses ?? [];
  async function save(items: Address[]) {
    setBusy(true);
    setError(undefined);
    try {
      setUser(
        await api<User>("/account/addresses", "PUT", { addresses: items }),
      );
      toast("Đã cập nhật địa chỉ.");
      setAdding(false);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="panel-heading spread">
        <div>
          <h1>Địa chỉ của tôi</h1>
          <p>Lưu địa chỉ để đặt hàng thuận tiện hơn.</p>
        </div>
        <button className="button small" onClick={() => setAdding(!adding)}>
          + Thêm địa chỉ
        </button>
      </div>
      {Boolean(error) && <ErrorBox error={error} />}{" "}
      {addresses.map((a, i) => (
        <article className="address-card" key={i}>
          <div className="spread">
            <strong>
              {a.name} · {a.phone}
            </strong>
            {a.isDefault && <Tag tone="mint">Mặc định</Tag>}
          </div>
          <p>
            {a.detail}
            {a.province && `, ${a.province}`}
          </p>
          <small>{a.label}</small>
          <div className="actions" style={{ marginTop: 15 }}>
            {!a.isDefault && (
              <button
                disabled={busy}
                className="button small secondary"
                onClick={() =>
                  void save(
                    addresses.map((v, j) => ({ ...v, isDefault: i === j })),
                  )
                }
              >
                Đặt mặc định
              </button>
            )}
            <button
              className="muted"
              disabled={busy}
              onClick={() => void save(addresses.filter((_, j) => j !== i))}
            >
              Xóa địa chỉ
            </button>
          </div>
        </article>
      ))}
      {!addresses.length && !adding && <Empty title="Chưa có địa chỉ đã lưu" />}
      {adding && (
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const a = {
              label: String(f.get("label")),
              name: String(f.get("name")),
              phone: String(f.get("phone")),
              detail: String(f.get("detail")),
              province: String(f.get("province")),
              isDefault: !addresses.length,
            };
            void save([...addresses, a]);
          }}
        >
          <div className="form-row">
            <label>
              Họ tên
              <input
                name="name"
                defaultValue={user?.name}
                required
                minLength={2}
              />
            </label>
            <label>
              Số điện thoại
              <input name="phone" required pattern="(0|\+84)[0-9]{9,10}" />
            </label>
          </div>
          <label>
            Tỉnh / Thành phố
            <select name="province" defaultValue="" required>
              <option value="">Chọn tỉnh / thành phố</option>
              {shipping.data?.provinces.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Địa chỉ cụ thể
            <input
              name="detail"
              placeholder="Số nhà, đường, phường/xã"
              required
              minLength={10}
              maxLength={400}
            />
          </label>
          <label>
            Tên gợi nhớ
            <input
              name="label"
              placeholder="Nhà riêng / Văn phòng"
              maxLength={50}
              required
            />
          </label>
          <button className="button" disabled={busy}>
            Lưu địa chỉ
          </button>
        </form>
      )}
    </>
  );
}
export function OrdersPage() {
  const query = usePagedList<Order>("/account/orders");
  const { toast } = useStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [review, setReview] = useState<Order | null>(null);
  const [error, setError] = useState<unknown>();
  const items = query.data?.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      `${o.code} ${o.product.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="panel-heading">
        <h1>Đơn hàng của tôi</h1>
        <p>Theo dõi, đánh giá và yêu cầu hỗ trợ cho từng đơn hàng.</p>
      </div>
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
        placeholder="Tìm theo mã đơn hoặc tên sản phẩm"
        aria-label="Tìm đơn hàng"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {Boolean(query.error || error) && (
        <ErrorBox error={query.error || error} />
      )}{" "}
      {query.isLoading ? (
        <p>Đang tải đơn hàng…</p>
      ) : !items?.length ? (
        <Empty title="Chưa có đơn hàng phù hợp">
          <ButtonLink to="/san-pham">Khám phá bộ trò chơi</ButtonLink>
        </Empty>
      ) : (
        items.map((o) => (
          <article className="card order-card" key={o._id}>
            <div className="spread">
              <strong>{o.code}</strong>
              <Tag tone="mint">{statuses[o.status]}</Tag>
            </div>
            <div className="cart-line">
              <img src="/images/box.webp" alt="Bộ Tránh Trap" />
              <div>
                <h3>{o.product.name}</h3>
                <small>Số lượng: {o.product.quantity}</small>
                <p style={{ margin: 0 }}>{date(o.createdAt)}</p>
              </div>
            </div>
            <div className="spread">
              <span>
                Thành tiền:{" "}
                <strong className="order-total">{money(o.total)}</strong>
              </span>
              <button
                className="button small secondary"
                onClick={() => setDetail(o)}
              >
                Chi tiết đơn
              </button>
            </div>
            <div className="actions" style={{ marginTop: 20 }}>
              {o.status === "pending" && o.paymentMethod === "cod" && (
                <button
                  className="button small secondary"
                  onClick={() =>
                    void api(`/account/orders/${o._id}/cancel`, "POST")
                      .then(() => {
                        toast("Đã hủy đơn.");
                        void query.refetch();
                      })
                      .catch(setError)
                  }
                >
                  Hủy đơn hàng
                </button>
              )}
              {o.status === "delivered" && (
                <button className="button small" onClick={() => setReview(o)}>
                  Đánh giá
                </button>
              )}
              <Link
                className="button small secondary"
                to={`/tai-khoan/ho-tro?order=${o.code}`}
              >
                Yêu cầu hỗ trợ / Khiếu nại
              </Link>
            </div>
          </article>
        ))
      )}
      {detail && (
        <div className="modal-backdrop">
          <div className="modal">
            <header className="spread">
              <h2>Chi tiết đơn hàng</h2>
              <button
                aria-label="Đóng chi tiết"
                onClick={() => setDetail(null)}
              >
                <X />
              </button>
            </header>
            <OrderDetails order={detail} />
          </div>
        </div>
      )}
      {review && (
        <div className="modal-backdrop">
          <form
            className="modal form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void api("/reviews", "POST", {
                orderId: review._id,
                rating: Number(f.get("rating")),
                text: f.get("text"),
              })
                .then(() => {
                  setReview(null);
                  toast("Cảm ơn bạn đã chia sẻ đánh giá!");
                })
                .catch(setError);
            }}
          >
            <div className="spread">
              <h2>Đánh giá {review.code}</h2>
              <button
                type="button"
                aria-label="Đóng đánh giá"
                onClick={() => setReview(null)}
              >
                <X />
              </button>
            </div>
            <label>
              Điểm đánh giá
              <select name="rating">
                {[5, 4, 3, 2, 1].map((x) => (
                  <option key={x} value={x}>
                    {x} sao
                  </option>
                ))}
              </select>
            </label>
            <label>
              Trải nghiệm của bạn
              <textarea name="text" minLength={10} maxLength={2000} required />
            </label>
            {Boolean(error) && <ErrorBox error={error} />}
            <button className="button">Gửi đánh giá</button>
          </form>
        </div>
      )}
      <LoadMore query={query} />
    </>
  );
}
export function NotificationsPage() {
  const q = usePagedList<Notice>("/account/notifications");
  return (
    <>
      <div className="panel-heading">
        <h1>Thông báo</h1>
        <p>Cập nhật mới về đơn hàng và tài khoản.</p>
      </div>
      {q.error && <ErrorBox error={q.error} />}{" "}
      {q.isLoading ? (
        <p>Đang tải…</p>
      ) : q.data?.length ? (
        q.data.map((n) => (
          <article className={`notice ${n.read ? "read" : ""}`} key={n._id}>
            <div className="spread">
              <strong>{n.title}</strong>
              {!n.read && (
                <button
                  onClick={() =>
                    void api(`/account/notifications/${n._id}`, "PATCH").then(
                      () => q.refetch(),
                    )
                  }
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
            <p>{n.text}</p>
            <small className="muted">{date(n.createdAt)}</small>
          </article>
        ))
      ) : (
        <Empty title="Bạn đã xem hết thông báo" />
      )}
      <LoadMore query={q} />
    </>
  );
}
export function ReviewsPage() {
  const q = usePagedList<Review>("/account/reviews");
  return (
    <>
      <div className="panel-heading">
        <h1>Đánh giá của tôi</h1>
        <p>Những trải nghiệm bạn đã chia sẻ cùng cộng đồng.</p>
      </div>
      {q.error && <ErrorBox error={q.error} />}{" "}
      {q.data?.length ? (
        q.data.map((r) => (
          <article className="address-card" key={r._id}>
            <span style={{ color: "#bd8d20" }}>{"★".repeat(r.rating)}</span>
            <p>{r.text}</p>
          </article>
        ))
      ) : (
        <Empty title="Bạn chưa gửi đánh giá nào">
          <ButtonLink to="/tai-khoan/don-hang">Xem đơn hàng</ButtonLink>
        </Empty>
      )}
      <LoadMore query={q} />
    </>
  );
}
export function SupportPage() {
  const { user, toast } = useStore();
  const q = usePagedList<Ticket>("/account/tickets");
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const params = new URLSearchParams(window.location.search);
  return (
    <>
      <div className="panel-heading">
        <h1>Hỗ trợ & Khiếu nại</h1>
        <p>Đội ngũ Tránh Trap sẵn sàng lắng nghe và đồng hành.</p>
      </div>
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = Object.fromEntries(new FormData(form));
          setBusy(true);
          setError(undefined);
          void api("/tickets", "POST", {
            ...f,
            email: user!.email,
            name: user!.name,
          })
            .then(() => {
              form.reset();
              toast("Yêu cầu đã được tiếp nhận.");
              void q.refetch();
            })
            .catch(setError)
            .finally(() => setBusy(false));
        }}
      >
        <div className="form-row">
          <label>
            Loại yêu cầu
            <select name="type">
              <option value="support">Hỗ trợ khách hàng</option>
              <option value="complaint">Khiếu nại</option>
            </select>
          </label>
          <label>
            Mã đơn (nếu có)
            <input
              name="orderCode"
              defaultValue={params.get("order") ?? ""}
              maxLength={30}
            />
          </label>
        </div>
        <label>
          Chủ đề
          <input name="subject" required minLength={3} maxLength={150} />
        </label>
        <label>
          Nội dung
          <textarea name="text" required minLength={10} maxLength={4000} />
        </label>
        {Boolean(error) && <ErrorBox error={error} />}
        <button
          disabled={busy}
          className="button"
          style={{ justifySelf: "start" }}
        >
          {busy ? "Đang gửi…" : "Gửi yêu cầu hỗ trợ"}
          <Headphones size={17} />
        </button>
      </form>
      <h2 style={{ fontSize: 23, marginTop: 45 }}>Yêu cầu của bạn</h2>
      {q.error && <ErrorBox error={q.error} />}{" "}
      {q.data?.length ? (
        q.data.map((t) => (
          <TicketThread
            ticket={t}
            key={t._id}
            refresh={() => void q.refetch()}
          />
        ))
      ) : (
        <p>Chưa có yêu cầu hỗ trợ.</p>
      )}
      <LoadMore query={q} />
    </>
  );
}
export function TicketThread({
  ticket: t,
  refresh,
  management = false,
}: {
  ticket: Ticket;
  refresh: () => void;
  management?: boolean;
}) {
  const { user } = useStore();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const thread = useInfiniteQuery({
    queryKey: ["ticket-thread", t._id],
    enabled: open,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) =>
      api<Ticket & { nextBefore: number | null }>(
        `/tickets/${t._id}${pageParam !== undefined ? `?before=${pageParam}` : ""}`,
      ),
    getNextPageParam: (page) => page.nextBefore ?? undefined,
  });
  const messages = thread.data
    ? [...thread.data.pages].reverse().flatMap((p) => p.messages)
    : [];
  return (
    <article className="address-card">
      <div className="spread">
        <strong>{t.subject}</strong>
        <Tag tone={t.type === "complaint" ? "coral" : "blue"}>
          {statuses[t.status]}
        </Tag>
      </div>
      <small className="muted">
        {t.name} · {t.email} {t.orderCode && `· ${t.orderCode}`}
      </small>
      <div style={{ marginTop: 15 }}>
        <button
          className="button small secondary"
          onClick={() => setOpen(!open)}
        >
          {open ? "Ẩn hội thoại" : "Xem hội thoại"}
        </button>
      </div>
      {open && (
        <>
          <div className="ticket-thread">
            {thread.hasNextPage && (
              <button
                disabled={thread.isFetchingNextPage}
                onClick={() => void thread.fetchNextPage()}
              >
                Xem tin nhắn trước đó
              </button>
            )}
            {thread.isLoading ? (
              <p>Đang tải hội thoại…</p>
            ) : (
              messages.map((m, i) => (
                <p key={i}>
                  <strong>
                    {m.sender === "customer"
                      ? "Khách hàng"
                      : "Đội ngũ Tránh Trap"}{" "}
                    · {date(m.at)}
                  </strong>
                  {m.text}
                </p>
              ))
            )}
          </div>
          {management && (
            <select
              aria-label="Trạng thái hỗ trợ"
              value={t.status}
              onChange={(e) => {
                setError(undefined);
                void api(
                  `${operationsBase(user?.role)}/tickets/${t._id}`,
                  "PATCH",
                  { status: e.target.value },
                )
                  .then(refresh)
                  .catch(setError);
              }}
            >
              {["open", "processing", "resolved"].map((x) => (
                <option key={x} value={x}>
                  {statuses[x]}
                </option>
              ))}
            </select>
          )}
          <form
            className="actions"
            style={{ marginTop: 15 }}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const text = new FormData(form).get("text");
              setBusy(true);
              setError(undefined);
              void api(`/tickets/${t._id}/messages`, "POST", { text })
                .then(() => {
                  form.reset();
                  refresh();
                  void thread.refetch();
                })
                .catch(setError)
                .finally(() => setBusy(false));
            }}
          >
            <input
              name="text"
              placeholder="Viết phản hồi…"
              aria-label="Nội dung phản hồi"
              minLength={1}
              maxLength={4000}
              required
              style={{ flex: 1, width: "auto" }}
            />
            <button className="button small" disabled={busy}>
              <MessageCircle size={15} />
              Gửi
            </button>
          </form>
        </>
      )}
      {Boolean(error || thread.error) && (
        <ErrorBox error={error || thread.error} />
      )}
    </article>
  );
}
export function AccountRedirect() {
  const { section } = useParams();
  return <Navigate to={`/tai-khoan/${section || "ho-so"}`} replace />;
}
