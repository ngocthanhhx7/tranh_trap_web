import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { useStore } from "../../app/Store";
import { ApiError } from "../../services/shop";
import { roleHome } from "../../routes/access";

const errors: Record<number, { title: string; description: string }> = {
  400: {
    title: "Yêu cầu chưa hợp lệ",
    description:
      "Thông tin hoặc đường dẫn chưa đúng. Hãy kiểm tra lại và thử một lần nữa.",
  },
  401: {
    title: "Bạn cần đăng nhập",
    description:
      "Phiên đăng nhập chưa có hoặc đã hết hạn. Vui lòng đăng nhập để tiếp tục.",
  },
  403: {
    title: "Bạn không có quyền truy cập",
    description:
      "Khu vực này không thuộc quyền truy cập của tài khoản hiện tại.",
  },
  404: {
    title: "Không tìm thấy trang",
    description:
      "Đường dẫn không tồn tại hoặc nội dung đã được chuyển sang nơi khác.",
  },
  409: {
    title: "Thông tin vừa thay đổi",
    description:
      "Dữ liệu đã được cập nhật. Vui lòng tải lại trước khi tiếp tục.",
  },
  413: {
    title: "Nội dung quá lớn",
    description: "Vui lòng giảm dung lượng nội dung và thử lại.",
  },
  429: {
    title: "Bạn thao tác hơi nhanh",
    description: "Hãy chờ một chút trước khi tiếp tục gửi yêu cầu.",
  },
  500: {
    title: "Có sự cố khi tải trang",
    description:
      "Hệ thống chưa xử lý được yêu cầu. Bạn có thể thử lại hoặc trở về màn hình chính.",
  },
  503: {
    title: "Tạm thời chưa thể kết nối",
    description: "Dịch vụ chưa sẵn sàng. Vui lòng thử lại sau ít phút.",
  },
};
export function ErrorPage({ status = 500 }: { status?: number }) {
  const { user } = useStore();
  const info = errors[status] ?? errors[500];
  return (
    <main className="error-page">
      <section className="card error-card">
        <img src="/images/curious.webp" alt="Sóc Thám Tử" />
        <span className="error-code">{status in errors ? status : 500}</span>
        <h1>{info.title}</h1>
        <p>{info.description}</p>
        <div className="actions">
          <Link className="button" to={roleHome(user?.role)}>
            {user?.role === "admin" || user?.role === "staff"
              ? "Về dashboard của bạn"
              : "Về trang chủ"}
          </Link>
          {status === 401 ? (
            <Link className="button secondary" to="/dang-nhap">
              Đăng nhập
            </Link>
          ) : status >= 500 ? (
            <button
              className="button secondary"
              onClick={() => window.location.reload()}
            >
              Thử tải lại
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
export function RouteErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error)
    ? error.status
    : error instanceof ApiError
      ? error.status
      : 500;
  return <ErrorPage status={status} />;
}
