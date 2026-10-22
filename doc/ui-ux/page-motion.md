# Hiệu ứng tải và chuyển trang

Dùng chung PageLoader và PageMotion cho trang public, tài khoản, admin và staff. Khi chờ xác thực ban đầu, hiển thị logo cùng vòng xoay và ba chấm theo bảng màu thương hiệu. Khi chuyển pathname, nội dung fade-in 220ms và thanh màu phía trên hoàn tất trong 420ms. Header/footer và thanh điều hướng quản lý giữ nguyên.

Khi React Router hoặc query chưa có dữ liệu đang tải, thanh tiến trình chạy cho tới khi hoàn tất. Refetch dữ liệu nền không hiện trạng thái tải gây gián đoạn. Không thêm timer giữ người dùng chờ, không sửa luồng phân quyền/đăng nhập. Chỉ đổi hash/query không remount nội dung hay chạy lại hiệu ứng chuyển trang.

Hỗ trợ prefers-reduced-motion: tắt vòng xoay/chấm/fade-in và chuyển thanh tải sang tĩnh. PageLoader có role status, aria-live polite; trang trí ẩn khỏi trình đọc màn hình. Không thêm thư viện animation.

Xác minh: 47 test frontend hiện có đạt, typecheck/lint/build đạt. Trình duyệt local xác nhận chuyển Home sang Câu chuyện, thanh màu hiện ở cạnh trên; ảnh doc/reports/page-transition.png.
