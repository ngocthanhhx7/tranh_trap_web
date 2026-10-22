# Rà soát truy vấn, bảo mật và trải nghiệm đăng nhập

Đã sửa: phân quyền ở cả router và API; tách /admin và /staff; admin kế thừa nghiệp vụ trong /admin/operations. Operator đăng nhập vào dashboard riêng, không mở màn customer; customer login về Home và mọi role logout về Home. Kiểm thử đường dẫn trực tiếp và gọi API trái role.

Lỗi giao diện sau login xuất phát từ clear toàn bộ QueryClient làm mất liên kết query me đang được theo dõi. Giữ query me, hủy request đang chạy trước khi cập nhật và xóa cache khác khi đổi người dùng. Khi logout, chờ điều hướng hoàn tất và dùng flushSync của React Router để tránh guard cũ đẩy sang login. Không cần reload để nhận trạng thái mới.

Đăng ký/đổi/đặt lại mật khẩu đều có xác nhận ở frontend và API. Thêm giới hạn byte bcrypt, kiểm tra session/account active, giới hạn tần suất API, bảo vệ nguồn request ghi, phản hồi lỗi an toàn. Có trang 400/401/403/404/409/413/429/500/503 và error boundary runtime500. Không đọc file môi trường thực.

Danh sách riêng đã phân trang cursor, projection/lean và index theo filter/sort; dashboard tổng hợp toàn bộ thay số liệu bị cắt bởi limit. Chat chỉ lấy 30 tin/lượt, append atomic; cập nhật trạng thái đơn có điều kiện chống ghi đè đồng thời.

Bỏ breadcrumb trên trang public và bỏ phần margin đi kèm; vẫn giữ padding trang để nội dung không sát header. Ảnh/video bị chặn contextmenu/drag; video ẩn nút download/remote playback nếu trình duyệt hỗ trợ. Đây chỉ là hạn chế thao tác thông thường: tài nguyên public vẫn có thể được trích xuất. Mặt ngửa lá bài phải tiếp tục giữ ngoài public/build/API.

Kết quả xác minh: 47 test frontend, 13 nhóm integration API đạt; typecheck/lint/build đạt. npm audit trả 0 lỗ hổng đã biết ở cả dependency development và production tại thời điểm chạy. Explain test xác nhận IXSCAN, không COLLSCAN/SORT và tối đa 26 document đọc ở các truy vấn đã kiểm tra; chưa benchmark dữ liệu lớn thực tế.

Giới hạn còn lại: MongoDB standalone chưa bảo đảm giao dịch nhiều collection giữa đơn/tồn kho/thông báo; cần đối soát và transaction hoặc outbox trước vận hành production. Dashboard aggregate vẫn tăng chi phí khi dữ liệu lớn; khi có số đo thực cần cân nhắc bảng tổng hợp. Chưa xác minh dịch vụ PayOS/SMTP/Gemini thật, HTTPS/reverse proxy hay audit xâm nhập đầy đủ. Không khẳng định hệ thống an toàn tuyệt đối.
