# API thương mại

Tiền tố `/api/v1`. JSON; Zod kiểm tra đầu vào; lỗi không trả stack/internal message; cookie phiên kèm `credentials: include`. Yêu cầu ghi có Origin khác CLIENT_ORIGIN bị từ chối. Webhook PayOS dùng chữ ký riêng, không dùng cookie.

| Phạm vi           | Endpoint                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public            | GET /catalog, /shipping, /reviews                                                                                                                            |
| Auth              | POST /auth/register, /auth/login, /auth/logout, /auth/forgot-password, /auth/reset-password; GET /auth/me                                                    |
| Guest/customer    | POST /orders, /orders/lookup; POST /tickets (guest chỉ contact); POST /chat                                                                                  |
| Account           | PATCH /account/profile; PUT /account/addresses; POST /account/password, /account/email                                                                       |
| Customer          | GET /account/orders, /account/reviews, /account/notifications, /account/tickets; POST /account/orders/:id/cancel, /reviews; PATCH /account/notifications/:id |
| Ticket reply      | POST /tickets/:id/messages — chủ ticket hoặc staff/admin                                                                                                     |
| Staff/admin       | GET /staff/dashboard, /staff/orders, /staff/tickets; PATCH /staff/orders/:id, /staff/tickets/:id (admin dùng /admin/operations thay /staff)                  |
| Admin             | GET/POST /admin/users; PATCH /admin/users/:id; POST /admin/users/:id/reset-password                                                                          |
| Admin catalog     | GET/PUT /admin/product                                                                                                                                       |
| Admin shipping    | PUT/DELETE /admin/shipping/:province — tên tỉnh encoded trong URL                                                                                            |
| Provider callback | POST /payments/webhook — SDK xác minh chữ ký và đối chiếu orderCode/amount                                                                                   |

Luồng đơn: pending → confirmed → shipping → delivered; pending/confirmed → cancelled khi chưa thanh toán. Shipping cần carrier + trackingNumber. Delivered/cancelled không chuyển lùi. Khách tự hủy chỉ đơn COD pending/unpaid. Đơn đã trả cần quy trình hoàn tiền thủ công trước khi hủy; chưa tự động gọi refund.

Tra cứu public cần `{code, phone}`, không trả email/địa chỉ. Không nhận total/price/shippingFee từ client. Form checkout gửi customer gồm `{name,email,phone,address,province}`, quantity, paymentMethod cod/payos, note.

## Phân quyền và phân trang (2026-10-19)

- Staff chỉ gọi namespace `/staff`; admin chỉ gọi `/admin` và `/admin/operations`. Admin vẫn xử lý đơn/hỗ trợ trong namespace của mình. Namespace `/management` cũ trả 404.
- Customer không truy cập API quản lý. Các API danh sách tài khoản/địa chỉ/email/đơn/đánh giá/thông báo/hỗ trợ giới hạn customer; operator chỉ dùng hồ sơ và đổi mật khẩu chung. Operator không tạo đơn/chat/liên hệ qua luồng khách hàng.
- GET danh sách riêng (orders, tickets, reviews, notifications, admin users) trả `{items,nextCursor}`. Query `limit` mặc định 25, tối đa 100; `cursor` lấy từ trang trước. Các danh sách quản lý hỗ trợ bộ lọc trạng thái; tickets thêm `group=support|complaint`.
- GET `/tickets/:id` xác minh chủ sở hữu hoặc operator và trả tối đa 30 tin nhắn gần nhất; `nextBefore` dùng cho query `before` để tải tin cũ. POST tin nhắn dùng `$push` atomic.
- Đăng ký, đổi mật khẩu và đặt lại mật khẩu bắt buộc `confirmPassword` trùng `password`; server kiểm tra trước khi ghi dữ liệu. Mật khẩu tối thiểu 10 ký tự, tối đa 72 byte UTF-8 để tránh bcrypt cắt ngầm.
- GET `/admin/users/:id` trả chi tiết an toàn; danh sách user chỉ lấy các trường cần hiển thị. Không trả passwordHash.
- API dùng `Cache-Control: no-store`, giới hạn tần suất và từ chối Origin/Sec-Fetch-Site ghi từ nguồn khác. JSON hỏng trả 400, body quá lớn 413, lỗi nội bộ 500 với thông điệp chung.
