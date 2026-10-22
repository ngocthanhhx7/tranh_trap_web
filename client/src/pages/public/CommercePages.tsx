import { roleHome } from "../../routes/access";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useStore } from "../../app/Store";
import {
  api,
  date,
  money,
  statuses,
  useCatalog,
  useShipping,
} from "../../services/shop";
import type { Order, Review, User } from "../../services/shop";
import {
  ButtonLink,
  Empty,
  ErrorBox,
  Quantity,
  SectionTitle,
  Tag,
} from "../../components/common/UI";
export function ProductPage() {
  const { data, isLoading, error } = useCatalog();
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState("product");
  const navigate = useNavigate();
  const reviews = useQuery({
    queryKey: ["reviews"],
    queryFn: () => api<Review[]>("/reviews"),
  });
  if (isLoading)
    return <div className="container page">Đang tải bộ trò chơi…</div>;
  if (error)
    return (
      <div className="container page">
        <ErrorBox error={error} />
      </div>
    );
  const p = data?.product;
  if (!p)
    return (
      <div className="container page">
        <Empty title="Bộ trò chơi đang được cập nhật" />
      </div>
    );
  return (
    <div className="container page">
      <section className="product-detail">
        <div className="product-gallery">
          <img
            src={`/images/${photo}.webp`}
            alt="Bộ trò chơi Tránh Trap — chỉ hiển thị mặt sau thẻ"
          />
          <div className="thumbnails">
            {["product", "box", "stickers"].map((x) => (
              <button
                key={x}
                className={photo === x ? "active" : ""}
                onClick={() => setPhoto(x)}
                aria-label={`Xem ảnh ${x}`}
              >
                <img src={`/images/${x}.webp`} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <Tag tone="mint">Hỗ trợ giáo dục an toàn số</Tag>
          <h1>{p.name}</h1>
          <p>{p.description}</p>
          <div className="price">{money(p.price)}</div>
          <div className="benefits">
            <div>
              <UsersIcon />
              <div>
                <strong>{p.players}</strong>
                <small>Số người chơi</small>
              </div>
            </div>
            <div>
              <Clock size={25} />
              <div>
                <strong>{p.duration}</strong>
                <small>Thời lượng</small>
              </div>
            </div>
          </div>
          <p>
            <ShieldCheck size={16} /> Phù hợp {p.age} · Học qua trải nghiệm và
            thảo luận.
          </p>
          <p className="muted">
            {p.stock > 0 ? "Còn hàng · Giao hàng toàn quốc" : "Tạm hết hàng"}
          </p>
          <div className="actions">
            <Quantity value={quantity} onChange={setQuantity} />
            <button
              className="button secondary"
              disabled={!p.stock}
              onClick={() => addToCart(quantity)}
            >
              <ShoppingBag size={18} />
              Thêm vào giỏ
            </button>
          </div>
          <button
            className="button coral full"
            style={{ marginTop: 18 }}
            disabled={!p.stock}
            onClick={() => {
              addToCart(quantity);
              navigate("/thanh-toan");
            }}
          >
            Mua ngay <ArrowRight size={18} />
          </button>
          <p style={{ fontSize: 12, marginTop: 18 }}>
            Không cần tài khoản để mua hàng. Phí giao hàng mặc định 25.000đ, cập
            nhật theo tỉnh/thành nhận hàng.
          </p>
          <Link to="/chinh-sach/doi-tra">
            Xem chính sách giao hàng & đổi trả →
          </Link>
        </div>
      </section>
      <nav className="product-tabs">
        <a href="#thanh-phan">Giới thiệu & Thành phần</a>
        <Link to="/huong-dan">Học & Cách chơi</Link>
        <a href="#danh-gia">Đánh giá</a>
        <Link to="/chinh-sach/faq">Hỗ trợ & Chính sách</Link>
      </nav>
      <section className="section" id="thanh-phan">
        <SectionTitle
          tag="Chi tiết thành phần"
          title="Các thành phần trong bộ trò chơi"
          text="Mỗi bộ thẻ mang một lăng kính: giúp chúng mình nhận biết cạm bẫy từ nhiều góc nhìn."
        />
        <div className="product-components">
          <img
            src="/images/product.webp"
            alt="Các mặt sau của bộ thẻ Tránh Trap"
            loading="lazy"
          />
          <div className="component-list">
            {p.components.map((x) => (
              <article className="component" key={x.name}>
                <span className="icon blue">
                  <Package />
                </span>
                <div>
                  <h3>
                    {x.name} <Tag>{x.quantity}</Tag>
                  </h3>
                  <p>{x.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="danh-gia">
        <SectionTitle
          tag="Trải nghiệm cộng đồng"
          title="Đánh giá từ người mua"
        />
        {reviews.data?.length ? (
          <div className="grid two">
            {reviews.data.map((x) => (
              <article className="card" key={x._id}>
                <strong>{x.name}</strong>
                <p style={{ color: "#dba831" }}>{"★".repeat(x.rating)}</p>
                <p>{x.text}</p>
              </article>
            ))}
          </div>
        ) : (
          <Empty title="Chưa có đánh giá">
            <p>
              Người mua đã nhận hàng có thể chia sẻ trải nghiệm trong mục Đơn
              hàng.
            </p>
          </Empty>
        )}
      </section>
    </div>
  );
}
function UsersIcon() {
  return <Package size={25} />;
}
export function CartPage() {
  const { quantity, setQuantity } = useStore();
  const { data, error } = useCatalog();
  const p = data?.product;
  return (
    <div className="container page">
      <div className="page-heading">
        <Tag>Giỏ hàng của bạn</Tag>
        <h1>Một cuộc chơi đang chờ bạn</h1>
      </div>
      {error ? (
        <ErrorBox error={error} />
      ) : !quantity ? (
        <Empty title="Giỏ hàng chưa có sản phẩm">
          <ButtonLink to="/san-pham">Khám phá bộ trò chơi</ButtonLink>
        </Empty>
      ) : p ? (
        <div className="checkout-grid">
          <div className="card cart-line">
            <img src="/images/box.webp" alt="Bộ Tránh Trap" />
            <div>
              <h3>{p.name}</h3>
              <p>{money(p.price)} / bộ</p>
              <Quantity value={quantity} onChange={setQuantity} />
            </div>
            <button
              aria-label="Xóa khỏi giỏ hàng"
              onClick={() => setQuantity(0)}
            >
              <Trash2 size={20} />
            </button>
          </div>
          <aside className="card summary">
            <h3>Thông tin giỏ hàng</h3>
            <div className="summary-row">
              <span>Tạm tính ({quantity} bộ)</span>
              <strong>{money(p.price * quantity)}</strong>
            </div>
            <p>
              Phí vận chuyển sẽ được tính theo tỉnh/thành tại bước thanh toán.
            </p>
            <ButtonLink to="/thanh-toan">Tiến hành đặt hàng</ButtonLink>
            <p style={{ marginTop: 20, fontSize: 12 }}>
              Bạn có thể đặt mua mà không cần đăng nhập.
            </p>
          </aside>
        </div>
      ) : (
        <p>Đang tải giỏ hàng…</p>
      )}
    </div>
  );
}
export function CheckoutPage() {
  const { quantity, setQuantity, user } = useStore();
  const { data } = useCatalog();
  const shipping = useShipping();
  const navigate = useNavigate();
  const [province, setProvince] = useState("");
  const [payment, setPayment] = useState("cod");
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const p = data?.product;
  const fee =
    shipping.data?.rates.find((x) => x.province === province)?.fee ??
    shipping.data?.defaultFee ??
    25000;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!p || !quantity) return;
    setBusy(true);
    setError(undefined);
    const f = new FormData(e.currentTarget);
    try {
      const r = await api<{ order: Order }>("/orders", "POST", {
        customer: {
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone"),
          address: f.get("address"),
          province,
        },
        quantity,
        paymentMethod: payment,
        note: f.get("note"),
      });
      setOrder(r.order);
      setQuantity(0);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  if (order)
    return (
      <div className="container page">
        <div className="card" style={{ maxWidth: 750, margin: "25px auto" }}>
          <CheckCircle2 className="mint" size={48} />
          <h1 style={{ fontSize: 32, marginTop: 20 }}>
            Cảm ơn bạn đã chọn Tránh Trap!
          </h1>
          <p>
            Đơn hàng đã được lưu. Hãy giữ lại mã đơn để theo dõi hành trình giao
            hàng.
          </p>
          <div className="success-box">
            <strong>Mã đơn: {order.code}</strong>
            <p style={{ margin: "12px 0 0" }}>
              Tổng thanh toán: {money(order.total)}
            </p>
          </div>
          <div className="actions" style={{ marginTop: 25 }}>
            {order.checkoutUrl && (
              <a className="button coral" href={order.checkoutUrl}>
                Thanh toán với PayOS
              </a>
            )}
            <button
              className="button"
              onClick={() => navigate(`/tra-cuu-don-hang?code=${order.code}`)}
            >
              Theo dõi đơn hàng
            </button>
            <ButtonLink to="/" secondary>
              Về trang chủ
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  if (!quantity)
    return (
      <div className="container page">
        <Empty title="Giỏ hàng chưa có sản phẩm">
          <ButtonLink to="/san-pham">Chọn bộ trò chơi</ButtonLink>
        </Empty>
      </div>
    );
  return (
    <div className="container page">
      <div className="page-heading">
        <Tag>Hoàn tất đặt hàng</Tag>
        <h1>Mang Tránh Trap về nhà</h1>
        <p>Thông tin của bạn chỉ được sử dụng để xử lý và giao đơn hàng.</p>
      </div>
      <form onSubmit={(e) => void submit(e)} className="checkout-grid">
        <div className="card form-stack">
          <h3>Thông tin nhận hàng</h3>
          {!user && (
            <p>
              Đặt mua ngay hoặc{" "}
              <Link
                to="/dang-nhap?next=/thanh-toan"
                style={{ color: "#4f83b8" }}
              >
                đăng nhập
              </Link>{" "}
              để theo dõi trong tài khoản.
            </p>
          )}
          {user?.addresses.length ? (
            <label>
              Chọn địa chỉ đã lưu
              <select
                defaultValue=""
                onChange={(e) => {
                  const a = user.addresses[Number(e.target.value)];
                  if (!a) return;
                  setProvince(a.province ?? "");
                  const form = e.currentTarget.form!;
                  (["name", "phone"] as const).forEach((k) => {
                    const el = form.elements.namedItem(k) as HTMLInputElement;
                    el.value = a[k];
                  });
                  (
                    form.elements.namedItem("address") as HTMLInputElement
                  ).value = a.detail;
                }}
              >
                <option value="">Nhập địa chỉ mới</option>
                {user.addresses.map((a, i) => (
                  <option key={i} value={i}>
                    {a.label}: {a.detail}, {a.province}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="form-row">
            <label>
              Họ và tên *
              <input
                name="name"
                autoComplete="name"
                defaultValue={user?.name}
                required
                minLength={2}
                maxLength={100}
              />
            </label>
            <label>
              Số điện thoại *
              <input
                name="phone"
                autoComplete="tel"
                defaultValue={user?.phone}
                required
                pattern="(0|\+84)[0-9]{9,10}"
              />
            </label>
          </div>
          <label>
            Email nhận thông tin *
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={user?.email}
              required
            />
          </label>
          <label>
            Tỉnh / Thành phố *
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
            >
              <option value="">Chọn tỉnh / thành phố</option>
              {shipping.data?.provinces.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          {shipping.error && <ErrorBox error={shipping.error} />}
          <label>
            Địa chỉ cụ thể *
            <input
              name="address"
              autoComplete="street-address"
              placeholder="Số nhà, đường, phường/xã"
              required
              minLength={10}
              maxLength={400}
            />
          </label>
          <label>
            Ghi chú cho đơn hàng
            <textarea
              name="note"
              maxLength={500}
              placeholder="Lưu ý giao hàng (nếu có)"
            />
          </label>
          <h3>Phương thức thanh toán</h3>
          <label>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={payment === "cod"}
              onChange={() => setPayment("cod")}
            />
            Thanh toán khi nhận hàng (COD)
          </label>
          <label>
            <input
              type="radio"
              name="payment"
              value="payos"
              checked={payment === "payos"}
              disabled={!data?.integrations.payos}
              onChange={() => setPayment("payos")}
            />
            Chuyển khoản / QR qua PayOS
          </label>
          {!data?.integrations.payos && (
            <small className="muted">
              Thanh toán PayOS đang được chuẩn bị. Bạn có thể đặt đơn COD.
            </small>
          )}
        </div>
        <aside className="card summary">
          <img src="/images/box.webp" alt="Bộ Tránh Trap" />
          <h3>{p?.name ?? "Bộ trò chơi Tránh Trap"}</h3>
          <div className="summary-row">
            <span>Số lượng</span>
            <strong>{quantity} bộ</strong>
          </div>
          <div className="summary-row">
            <span>Tiền sản phẩm</span>
            <strong>{p ? money(p.price * quantity) : "Đang tải…"}</strong>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển {province && `· ${province}`}</span>
            <strong>{money(fee)}</strong>
          </div>
          <div className="summary-row total">
            <span>Tổng thanh toán</span>
            <span>{p ? money(p.price * quantity + fee) : "…"}</span>
          </div>
          <label style={{ fontSize: 12, marginBottom: 20 }}>
            <input type="checkbox" required />
            Tôi đồng ý với{" "}
            <Link to="/chinh-sach/mua-hang">chính sách mua hàng</Link>.
          </label>
          {Boolean(error) && <ErrorBox error={error} />}
          <button
            disabled={busy || !p || !shipping.data}
            className="button coral full"
          >
            {busy ? "Đang tạo đơn…" : "Xác nhận đặt hàng"}
            <ArrowRight size={17} />
          </button>
          <p style={{ fontSize: 11, marginTop: 18, marginBottom: 0 }}>
            <ShieldCheck size={14} /> Tổng tiền sẽ được server tính lại theo giá
            và phí giao hàng hiện hành khi bạn xác nhận.
          </p>
        </aside>
      </form>
    </div>
  );
}
export function LookupPage() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  return (
    <div className="container page">
      <div className="page-heading">
        <Tag tone="blue">Hành trình của bộ trò chơi</Tag>
        <h1>Tra cứu đơn hàng</h1>
        <p>
          Nhập mã đơn cùng số điện thoại đã dùng khi đặt hàng để kiểm tra tiến
          trình.
        </p>
      </div>
      <div className="checkout-grid">
        <form
          className="card form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setBusy(true);
            setError(undefined);
            setOrder(null);
            void api<Order>("/orders/lookup", "POST", Object.fromEntries(f))
              .then(setOrder)
              .catch(setError)
              .finally(() => setBusy(false));
          }}
        >
          <label>
            Mã đơn hàng
            <input
              name="code"
              defaultValue={params.get("code") ?? ""}
              placeholder="Ví dụ: TT…"
              required
              minLength={5}
            />
          </label>
          <label>
            Số điện thoại nhận hàng
            <input
              name="phone"
              autoComplete="tel"
              required
              pattern="(0|\+84)[0-9]{9,10}"
            />
          </label>
          {Boolean(error) && <ErrorBox error={error} />}
          <button className="button" disabled={busy}>
            {busy ? "Đang tra cứu…" : "Tra cứu đơn hàng"}
            <Truck size={18} />
          </button>
        </form>
        <div>
          {order ? (
            <OrderDetails order={order} />
          ) : (
            <Empty title="Cùng theo dõi hành trình Tránh Trap">
              <p>Mã đơn được hiển thị sau khi bạn đặt hàng thành công.</p>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}
export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="card">
      <div className="spread">
        <strong>{order.code}</strong>
        <Tag tone="mint">{statuses[order.status]}</Tag>
      </div>
      <h3>
        {order.product.name} × {order.product.quantity}
      </h3>
      <p>
        Tổng tiền: <strong>{money(order.total)}</strong>
        <br />
        Phí vận chuyển: {money(order.shippingFee)}
        <br />
        Thanh toán: {statuses[order.paymentStatus]}
      </p>
      {order.carrier && (
        <p>
          Đơn vị vận chuyển: {order.carrier}
          <br />
          Mã vận đơn: {order.trackingNumber}
        </p>
      )}
      <ul className="timeline">
        {order.history.map((x, i) => (
          <li key={i}>
            {x.note}
            <small>{date(x.at)}</small>
          </li>
        ))}
      </ul>
      {order.checkoutUrl &&
        order.paymentStatus === "unpaid" &&
        order.status !== "cancelled" && (
          <a className="button" href={order.checkoutUrl}>
            Tiếp tục thanh toán PayOS
          </a>
        )}
    </div>
  );
}
export function AuthPage({
  mode,
}: {
  mode: "login" | "register" | "forgot" | "reset";
}) {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<unknown>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const titles = {
    login: "Chào bạn trở lại!",
    register: "Cùng gia nhập Tránh Trap",
    forgot: "Quên mật khẩu?",
    reset: "Đặt lại mật khẩu",
  };
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const path = {
      login: "login",
      register: "register",
      forgot: "forgot-password",
      reset: "reset-password",
    }[mode];
    try {
      if (
        (mode === "register" || mode === "reset") &&
        f.password !== f.confirmPassword
      ) {
        throw new Error("Mật khẩu xác nhận chưa khớp.");
      }
      const r = await api<User & { message: string }>(
        `/auth/${path}`,
        "POST",
        mode === "reset" ? { ...f, token: params.get("token") } : f,
      );
      if (mode === "login" || mode === "register") {
        setUser(r);
        navigate(roleHome(r.role), { replace: true });
      } else setMessage(r.message);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="card auth-page">
      <img src="/images/happy.webp" alt="Sóc Thám Tử" />
      <h1>{titles[mode]}</h1>
      <p style={{ textAlign: "center" }}>
        Một tài khoản, nhiều trải nghiệm an toàn số.
      </p>
      {message ? (
        <div className="success-box">
          {message}
          <div style={{ marginTop: 20 }}>
            <Link to="/dang-nhap">Đăng nhập →</Link>
          </div>
        </div>
      ) : (
        <form className="form-stack" onSubmit={(e) => void submit(e)}>
          {mode === "register" && (
            <label>
              Họ và tên
              <input name="name" required minLength={2} autoComplete="name" />
            </label>
          )}
          {mode !== "reset" && (
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
          )}
          {mode !== "forgot" && (
            <label>
              Mật khẩu
              <input
                name="password"
                type="password"
                minLength={mode === "login" ? 1 : 10}
                maxLength={128}
                required
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
              {mode !== "login" && <small>Tối thiểu 10 ký tự.</small>}
            </label>
          )}
          {(mode === "register" || mode === "reset") && (
            <label>
              Nhập lại mật khẩu
              <input
                name="confirmPassword"
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </label>
          )}
          {mode === "register" && (
            <label style={{ fontSize: 12 }}>
              <input type="checkbox" required />
              Tôi đồng ý với{" "}
              <Link to="/chinh-sach/bao-mat">Chính sách bảo mật</Link>.
            </label>
          )}
          {Boolean(error) && <ErrorBox error={error} />}
          <button className="button full" disabled={busy}>
            {busy
              ? "Đang xử lý…"
              : {
                  login: "Đăng nhập",
                  register: "Tạo tài khoản",
                  forgot: "Gửi email khôi phục",
                  reset: "Lưu mật khẩu mới",
                }[mode]}
          </button>
        </form>
      )}
      <div className="auth-links">
        <Link to={mode === "register" ? "/dang-nhap" : "/dang-ky"}>
          {mode === "register"
            ? "Đã có tài khoản? Đăng nhập"
            : "Chưa có tài khoản? Đăng ký"}
        </Link>
        {mode === "login" && <Link to="/quen-mat-khau">Quên mật khẩu</Link>}
      </div>
    </div>
  );
}
