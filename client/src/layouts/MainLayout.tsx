import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  Facebook,
  Instagram,
  Globe,
} from "lucide-react";
import { useStore } from "../app/Store";
import { ChatWidget } from "../components/common/ChatWidget";
import { PageMotion } from "../components/common/PageMotion";
export function MainLayout() {
  const { user, quantity, logout } = useStore();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/" aria-label="Tránh Trap — Trang chủ">
            <img src="/images/figma/home-4.png" alt="Tránh Trap" />
          </Link>
          <nav
            className={menu ? "main-nav expanded" : "main-nav"}
            aria-label="Điều hướng chính"
          >
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/ve-tranh-trap">Về Tránh Trap</NavLink>
            <NavLink to="/cau-chuyen">Câu chuyện</NavLink>
            <NavLink to="/san-pham">Bộ trò chơi</NavLink>
            <NavLink to="/lien-he">Liên hệ</NavLink>
            <div className="nav-dropdown">
              <button>
                Trải nghiệm số <ChevronDown size={13} />
              </button>
              <div className="dropdown">
                <Link to="/dung-trap">Dừng Trap</Link>
                <Link to="/thu-vien-video">Thư viện Video AI</Link>
                <Link to="/cam-nang">Cẩm nang an toàn số</Link>
              </div>
            </div>
          </nav>
          <div className="header-actions">
            <span className="language" aria-label="Ngôn ngữ tiếng Việt">
              VI
            </span>
            <Link
              className="cart-icon"
              to="/gio-hang"
              aria-label={`Giỏ hàng: ${quantity} sản phẩm`}
            >
              <ShoppingBag size={20} />
              {quantity > 0 && <b>{quantity}</b>}
            </Link>
            <Link className="button small" to="/san-pham">
              Đặt mua ngay
            </Link>
            <div className="account-menu">
              <Link
                className="avatar-button"
                to={user ? "/tai-khoan/ho-so" : "/dang-nhap"}
                aria-label={user ? "Mở trung tâm tài khoản" : "Đăng nhập"}
              >
                <UserRound size={19} />
              </Link>
              {user && (
                <div className="dropdown">
                  <strong>{user.name}</strong>
                  <Link to="/tai-khoan/ho-so">Trung tâm tài khoản</Link>
                  {user.role === "customer" ? (
                    <>
                      <Link to="/tai-khoan/thong-bao">Thông báo</Link>
                      <Link to="/tai-khoan/don-hang">Đơn hàng</Link>
                    </>
                  ) : null}
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
              )}
            </div>
            <button
              className="mobile-menu"
              aria-label="Mở menu"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main>
        <PageMotion />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" to="/">
              <img src="/images/figma/home-3.png" alt="Tránh Trap" />
            </Link>
            <p>
              Trò chơi giáo dục nâng cao kỹ năng tự bảo vệ trên không gian số
              cho trẻ em và thanh thiếu niên Việt Nam.
            </p>
            <span className="tag yellow">An toàn số</span>{" "}
            <span className="tag blue">Giáo dục Gen Z</span>
          </div>
          <div>
            <h4>Khám phá</h4>
            <Link to="/">Trang chủ</Link>
            <Link to="/ve-tranh-trap">Về Tránh Trap</Link>
            <Link to="/san-pham">Bộ trò chơi</Link>
            <Link to="/dung-trap">Thử thách tình huống</Link>
            <Link to="/cam-nang">Cẩm nang an toàn số</Link>
          </div>
          <div>
            <h4>Hỗ trợ & Hướng dẫn</h4>
            <Link to="/huong-dan">Luật chơi chi tiết</Link>
            <Link to="/thu-vien-video">Video hướng dẫn</Link>
            <Link to="/chinh-sach/faq">Câu hỏi thường gặp (FAQ)</Link>
            <Link to="/tra-cuu-don-hang">Tra cứu đơn hàng</Link>
            <Link to="/chinh-sach/giao-hang">Giao hàng & Đổi trả</Link>
            <Link to="/lien-he">Dành cho phụ huynh & Nhà trường</Link>
          </div>
          <div>
            <h4>Kết nối</h4>
            <a href="tel:0358341830">
              <Phone size={14} />
              0358 341 830
            </a>
            <a href="mailto:tranhtrap.boardgame@gmail.com">
              <Mail size={14} />
              tranhtrap.boardgame@gmail.com
            </a>
            <p>
              <MapPin size={14} />
              Hòa Lạc · Hà Nội
            </p>
            <div className="socials">
              <Link to="/lien-he" aria-label="Thông tin Facebook">
                <Facebook size={16} />
              </Link>
              <Link to="/lien-he" aria-label="Thông tin Instagram">
                <Instagram size={16} />
              </Link>
              <Link to="/lien-he" aria-label="Kênh kết nối">
                <Globe size={16} />
              </Link>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Tránh Trap. Mọi quyền được bảo lưu.
          </span>
          <div>
            <Link to="/chinh-sach/bao-mat">Chính sách bảo mật</Link>
            <Link to="/chinh-sach/dieu-khoan">
              Điều khoản sử dụng <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
