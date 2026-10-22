# Cấu hình và chạy local

Agent không đọc `.env`. Chủ dự án tự tạo/cập nhật file thật từ `client/.env.example` và `server/.env.example`; ứng dụng nạp cấu hình lúc chạy bằng dotenv/Vite. Không chia sẻ secrets trong chat.

| Biến server                                          | Mục đích                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| NODE_ENV                                             | development / test / production                                   |
| PORT                                                 | API, mặc định 4000                                                |
| MONGODB_URI                                          | MongoDB local mặc định mongodb://127.0.0.1:27017/tranh_trap_web   |
| CLIENT_ORIGIN                                        | Origin frontend mặc định http://localhost:5173; mở UI đúng origin |
| SHIPPING_DEFAULT_FEE                                 | 25000; phí riêng tỉnh/thành lưu MongoDB qua dashboard admin       |
| GEMINI_API_KEY / GEMINI_MODEL                        | Key server; chọn model được tài khoản hỗ trợ                      |
| PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY | Kênh PayOS doanh nghiệp                                           |
| SMTP_HOST / SMTP_PORT                                | SMTP, 587 STARTTLS hoặc 465 TLS                                   |
| SMTP_USER / SMTP_PASSWORD / SMTP_FROM                | Người gửi, mật khẩu ứng dụng khi cần                              |

Client dùng `VITE_API_URL=/api/v1`; Vite proxy `/api` theo `VITE_API_PROXY_TARGET` (mặc định http://localhost:4000), cổng frontend theo `VITE_PORT` (5173). Không đặt secrets ở biến VITE. Production cần reverse proxy cùng origin, HTTPS và CLIENT_ORIGIN tương ứng. API URL tuyệt đối cần CORS/cookie đúng host.

## Khởi động

```powershell
npm install
npm run dev
```

Mở http://localhost:5173. MongoDB phải chạy trước. API tự seed sản phẩm lần đầu, không ghi đè catalog đã chỉnh.

## Admin đầu tiên

```powershell
npm run bootstrap:admin --workspace=server
```

Chạy trong terminal tương tác và nhập tên, email, mật khẩu (ẩn lúc nhập). Không có mật khẩu mặc định; script từ chối nếu đã có admin. Đăng nhập ở `/dang-nhap` để mở `/admin`. Tạo staff trong Quản lý tài khoản. Không truyền mật khẩu qua command line.

## Tích hợp

- PayOS callback: HTTPS public tới `/api/v1/payments/webhook`. Localhost không phải URL callback ngoài Internet. Khai báo trong kênh PayOS khi có HTTPS. Kiểm tra giao dịch/đối soát trước mở bán.
- Gemini gọi REST Interactions server với timeout; model cấu hình được. Test mock phản hồi, không gửi sang Gemini.
- SMTP chưa cấu hình thì không gửi mail; đơn vẫn hiện trên UI và MongoDB. Reset mật khẩu báo chưa sẵn sàng. Test bằng hộp thư thử trước dùng khách thật.
- Không log body, cookie, token hoặc key. Trạng thái có cấu hình không đồng nghĩa nhà cung cấp đã hoạt động.

## Kiểm tra

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Test dùng database riêng `tranh_trap_test_<timestamp>` và chỉ dọn database này khi kết thúc; không load `.env`, không gọi dịch vụ ngoài. Xem `doc/requirements/implementation.md` về phạm vi/giới hạn.

## Cấu hình Sóc AI

Thêm vào `server/.env` theo `server/.env.example`, rồi khởi động lại backend:

```dotenv
AI_DAILY_LIMIT=20
AI_CHAT_TONE="Gần gũi, ấm áp, nhí nhảnh vừa phải; xưng Sóc hoặc mình, gọi người dùng là bạn. Viết tiếng Việt tự nhiên, rõ ràng; dùng emoji tiết chế."
```

`AI_DAILY_LIMIT` là số lượt trả lời AI thành công/ngày, số nguyên 1–10000, mặc định 20. Tính theo múi giờ Việt Nam, theo tài khoản hoặc IP guest. Giới hạn kiểm tra phía server và không được hiển thị ở đầu khung chat; chỉ thông báo khi hết lượt, kèm kết nối nhân viên. Gọi AI lỗi không mất lượt; yêu cầu gặp nhân viên luôn có thể thực hiện. Thay giới hạn áp dụng lên counter hiện có của ngày, không tự đặt lại counter. Rate limit API chống spam vẫn hoạt động độc lập với hạn mức AI.

`AI_CHAT_TONE` là mô tả phong cách, tối đa 2000 ký tự. Để cả dòng trong dấu nháy nếu có #; bỏ biến để dùng mặc định. Đây không phải nơi thay quy tắc bảo mật hay dữ liệu giá/chính sách. Sóc vẫn phải bảo vệ mặt ngửa thẻ, không bịa thông tin, không giả làm người thật và nghiêm túc khi người dùng gặp sự cố.

Câu trả lời hỗ trợ Markdown/GFM (đậm, nghiêng, gạch ngang, danh sách lồng nhau, trích dẫn, bảng, khối mã, link, xuống dòng) và `<u>gạch dưới</u>`, emoji Unicode. Renderer phân tích HTML rồi sanitize bằng allowlist; không chạy script, handler, CSS, iframe hay ảnh ngoài. Nội dung người dùng giữ dạng văn bản thuần. Tông câu trả lời thực tế phụ thuộc model và cấu hình Gemini; các kiểm thử dùng API giả lập, không gọi provider thật.
