# Phạm vi bản triển khai đầu tiên — 19/10/2026

## Quyết định từ người dùng

- React + TypeScript ở `client`, Express + TypeScript ở `server`, MongoDB local.
- Guest là trạng thái chưa đăng nhập; ba role tài khoản: customer, staff, admin.
- Home là bản bố cục được duyệt. Header/footer Home dùng chung toàn bộ màn customer/guest. Các màn còn lại tham khảo mẫu.
- Giá khởi tạo 399.000đ/bộ. Giá, mô tả, thành phần, số lượng thành phần, độ tuổi, thời lượng, tồn kho có thể chỉnh trong admin.
- Phí giao hàng mặc định 25.000đ/đơn. Phí riêng theo tỉnh/thành được ưu tiên, kể cả cấu hình 0đ. Server chốt giá và phí tại thời điểm đặt đơn; các thay đổi sau đó không sửa đơn cũ.
- Chuẩn bị sẵn 34 tỉnh/thành hiện hành. Địa chỉ cụ thể nhập số nhà, đường, phường/xã.
- Tuyệt đối không đưa mặt ngửa lá bài vào public, bundle hoặc API.
- Agent không đọc nội dung `.env`; các mẫu cấu hình là nơi mô tả biến môi trường.

## Chức năng đã có

- Public: Home, Về Tránh Trap, Câu chuyện, Sản phẩm, Liên hệ, hướng dẫn, chính sách, FAQ, cẩm nang/bài viết, luyện tập 10 tình huống dạng văn bản, thư viện video có trạng thái chưa có nội dung.
- Guest: giỏ hàng lưu trên trình duyệt; đặt đơn COD, PayOS khi cấu hình; xem mã đơn; tra cứu mã đơn + số điện thoại, không trả địa chỉ/email trong API tra cứu public.
- Customer: đăng ký/đăng nhập, quên/đặt lại mật khẩu qua SMTP; hồ sơ, địa chỉ, đổi mật khẩu/email; đơn hàng, chi tiết, hủy đơn COD chưa xác nhận; đánh giá đơn đã nhận, thông báo, ticket hỗ trợ/khiếu nại và trao đổi với nhân viên.
- Staff: dashboard nghiệp vụ, xử lý đơn và vận đơn, tiếp nhận/trả lời/đổi trạng thái hỗ trợ và khiếu nại, trung tâm tài khoản.
- Admin: kế thừa staff; dashboard doanh thu đơn hoàn thành, cấu hình sản phẩm, phí ship theo tỉnh; tạo tài khoản, xem chi tiết không có hash/mật khẩu, khóa/mở, gửi link đặt lại mật khẩu; không có API xóa account.
- Gemini: API phía server, giới hạn 20 câu hỏi/ngày theo ngày Việt Nam, lưu đếm MongoDB; yêu cầu gặp người thật/khiếu nại hoặc hết lượt gợi ý chuyển hỗ trợ. Lỗi API không trừ lượt. Chưa cấu hình thì báo rõ và gợi ý nhân viên.
- PayOS: SDK chính thức, tạo liên kết phía server và xác thực chữ ký webhook, đối chiếu mã và số tiền, không đánh dấu đã trả từ URL return.
- SMTP: email xác nhận đơn và link reset mật khẩu dùng một lần trong 30 phút. Email lỗi không làm mất đơn đã được tạo.

## Nội dung cần chủ dự án hoàn thiện

- Số thẻ mỗi loại và tồn kho seed là **dữ liệu khởi tạo để phát triển**, chưa phải kiểm kê hàng thực tế: 20/20/20, 1 cẩm nang, tồn 100. Cần chỉnh ở admin trước mở bán.
- Video, ảnh trải nghiệm thực tế, luật chơi chi tiết chưa được cung cấp; không dựng video/luật giả. Dừng Trap hiện luyện tập văn bản, chưa phải thử thách phản xạ video trong tài liệu tham khảo.
- Cẩm nang, nội dung giới thiệu và chính sách là nội dung triển khai ban đầu để chủ dự án rà soát. Chưa có các cam kết cụ thể về số ngày giao hàng/đổi trả khi chưa được xác nhận.
- Chưa có CMS video/cẩm nang, phản xạ video/khảo sát và tiếng Anh; đây là đề xuất trong Google Doc tham khảo, chưa nằm trong luồng thương mại đầu tiên.
- Đã đọc design context Home từ kết nối Figma thứ hai và tải ảnh/logo/thumbnail/SVG về local. Các màn khác dùng ảnh tham khảo và bộ nhận diện; chưa tuyên bố khớp từng pixel toàn bộ các mẫu.
- Tích hợp thực PayOS, Gemini, SMTP cần thử sau khi chủ dự án tự hoàn thiện `.env`; không khẳng định đã kiểm tra nhà cung cấp chỉ từ trạng thái có biến cấu hình.
- Yokelvision Việt hóa đầy đủ còn thiếu; xem tài liệu typography.

## Điều kiện trước phát hành

Kiểm tra lại font/giấy phép webfont, nội dung chính sách/liên hệ, tồn kho/thành phần, luật chơi, video; chạy thử SMTP, Gemini và PayOS/webhook qua HTTPS; bổ sung quy trình hoàn tiền và đối soát giao dịch lỗi. Không coi bản local này là một đợt phát hành production đã được duyệt.
