# Schema ứng dụng

- `users`: email unique, bcrypt passwordHash select:false, role customer/staff/admin, active, hồ sơ và địa chỉ có province. Không xóa tài khoản; khóa thu hồi phiên.
- `sessions`: SHA256 token ngẫu nhiên, userId, expiresAt có TTL; cookie HttpOnly/SameSite=Lax, Secure khi production. Kiểm tra hết hạn và active ở mỗi request.
- `products`: slug unique; giá, stock, active, mô tả và components là dữ liệu động.
- `shippingrates`: province unique trong danh sách 34 tỉnh/thành, fee nguyên >= 0. Không có record dùng SHIPPING_DEFAULT_FEE (25000). Xóa cấu hình riêng quay về mặc định.
- `orders`: code unique ngẫu nhiên; orderCode unique cho PayOS; userId nullable với guest; snapshot thông tin nhận hàng, tỉnh, sản phẩm, số lượng, đơn giá, phí ship, tổng tiền. Không ghi lại giá đơn cũ khi sửa catalog/rate. Tồn kho trừ bằng điều kiện atomic stock >= quantity; phục hồi khi tạo đơn lỗi/hủy hợp lệ. Mongo standalone chưa có giao dịch nhiều collection: cần thêm cơ chế đối soát inventory/payment trước production.
- `tickets`: loại support/complaint/contact; chủ sở hữu nullable với liên hệ public; trạng thái và messages theo người gửi; kiểm tra quyền sở hữu ở API.
- `notifications`: thông báo theo user, read flag.
- `reviews`: orderId unique; chỉ khách sở hữu đơn delivered được đăng.
- `aiusages`: key user/IP hash + ngày Asia/Ho_Chi_Minh; counter atomic tối đa 20; TTL dọn dữ liệu sau 2 ngày.
- `resettokens`: SHA256 token, userId, expiresAt TTL; kiểm tra hạn và tiêu thụ một lần.

Không lưu password rõ, provider key hoặc mặt ngửa lá bài trong những collection public. Seed sản phẩm chạy idempotent bằng $setOnInsert; không ghi đè cấu hình admin khi restart.

Danh sách dùng cursor `(createdAt DESC, _id DESC)` thay vì lấy toàn bộ hoặc skip sâu. Index ghép theo chủ sở hữu/trạng thái/loại ticket và thứ tự cursor; User/Review/Order/Ticket có index thứ tự toàn cục. Notification và các danh sách customer có index userId + thứ tự. Session thêm index userId phục vụ thu hồi phiên. Truy vấn chỉ đọc dùng lean/projection. Dashboard aggregate số liệu toàn bộ, chỉ lấy 5 bản ghi mới nhất để hiển thị.

Integration test `cursor pagination, ticket slicing and indexed plans stay bounded` kiểm tra MongoDB explain của Order/Ticket/Notification theo chủ sở hữu và User theo thời gian: có IXSCAN, không COLLSCAN/SORT, số document đọc tối đa 26 trong database kiểm thử. Đây không phải benchmark dữ liệu production.
