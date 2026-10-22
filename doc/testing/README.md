# Kiểm thử

Thư mục test được chia theo cấp độ:

- `client/tests/unit`, `client/tests/integration`, `client/tests/e2e`.
- `server/tests/unit`, `server/tests/integration`, `server/tests/fixtures`.

Hiện dùng Node test runner + tsx + Supertest cho integration API: `npm test`. Cần MongoDB local đang chạy. Test tạo database riêng theo timestamp và dọn đúng database đó; không đọc `.env` và không gọi dịch vụ ngoài.

13 nhóm API (9 nhóm ban đầu và 4 nhóm bổ sung) kiểm tra: catalog/34 tỉnh, phân quyền/giả mạo role, mua guest/giá server/tra cứu, phí riêng kể cả 0đ và snapshot, chuyển trạng thái/vận đơn/đánh giá, quyền ticket và handoff AI, khóa tài khoản/ẩn password hash/không xóa account, hạn mức AI 20 lượt/ngày (mock Gemini), mua đồng thời không vượt tồn kho.

Đã kiểm tra giao diện bằng trình duyệt local: Home desktop và mobile 390px, ảnh không lỗi và không tràn ngang; sản phẩm → giỏ → checkout guest hiển thị 399.000đ + 25.000đ = 424.000đ. Chưa thực hiện thanh toán/email/Gemini thật hoặc kiểm thử UI mọi màn dashboard. Ảnh Home lưu ở `doc/reports/home-preview.png`.

Lệnh kiểm tra khác: `npm run typecheck`, `npm run lint`, `npm run build`. Build cũng biên dịch TypeScript strict ở cả client và server.

Bổ sung 2026-10-19: kiểm thử namespace admin/staff và operator không ghi luồng customer; xác nhận mật khẩu ở API; lỗi JSON/404/CSRF/query không hợp lệ; cursor không trùng bản ghi, cắt lịch sử chat 30 tin, tin nhắn đồng thời không mất, explain xác nhận index.

Frontend dùng Vitest/jsdom + Testing Library, route tree và StoreProvider thực với API giả lập: 47 ca kiểm tra đường dẫn trực tiếp theo role, điều hướng login/logout, header đổi ngay sau login không reload, xóa cache riêng sau logout, các trang lỗi và lỗi runtime, xác nhận mật khẩu, chặn menu/kéo ảnh/video và tài nguyên gắn sau khi chuyển trang. Các kiểm thử này không thay thế kiểm tra trình duyệt thật hoặc tích hợp PayOS/SMTP/Gemini thật.

Cập nhật chat: tổng 50 test frontend. Ba ca bổ sung kiểm tra định dạng phong phú (đậm/nghiêng/gạch dưới/danh sách lồng/bảng/mã/emoji), loại bỏ HTML nguy hiểm và luồng hết lượt/handoff/ẩn mascot. Integration API dùng hạn mức tùy chỉnh 3 lượt để xác nhận AI_DAILY_LIMIT, kiểm tra AI_CHAT_TONE được truyền vào prompt và vẫn giữ quy tắc bảo mật. Không gọi Gemini thật.
