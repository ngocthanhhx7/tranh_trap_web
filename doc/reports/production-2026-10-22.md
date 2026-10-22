# Triển khai Internet — 22/10/2026

Website: https://tranhtrap.com.vn. www và HTTP chuyển về HTTPS tên miền chính. Server cuối cùng: 3.27.247.136 (Amazon Linux 2023 ARM64). IP 16.176.29.234 ban đầu không còn dùng sau khi chủ dự án thay server/IP. GitHub: https://github.com/ngocthanhhx7/tranh_trap_web, nhánh main.

Release ứng dụng: release-20261022T133700Z. Archive được đối chiếu SHA256 local và EC2: 232906889df7518e2ca29b0b91c97dc8e8225db5ffa1c24123029f7d93a03b43. Các script restart/backup được chuẩn hóa LF sau đóng gói và cài bản cập nhật. Nginx chuyển sang deploy/nginx-https.conf sau khi cấp chứng chỉ. Không đưa secrets, database local hoặc khóa SSH vào archive/GitHub. Quyền khóa SSH trên Windows được thu hẹp về chủ tài khoản để OpenSSH chấp nhận.

Đã cài Nginx host, Docker Node22 API non-root/read-only, Mongo7 volume tranhtrap-mongo-data, swap 1GiB trên máy micro. Mongo không publish port, API chỉ publish 127.0.0.1:4000; cổng web 80/443. Docker/container tự khởi động lại. Runtime env mount read-only từ /opt/tranhtrap/shared/.env, file mode600/ec2-user; khởi tạo từ example, không đọc hay sao chép .env thật local. Các biến hạ tầng được cố định ở script restart. Chưa điền key Gemini/SMTP/PayOS.

HTTPS Let's Encrypt cấp cho apex/www, hết hạn hiện tại 20/01/2027. Timer gia hạn hai lần/ngày đã bật; certbot renew --dry-run thành công. Timer backup hàng ngày đã bật; backup chạy thử thành công, file600/root, thư mục700, giữ7ngày. Backup mới là bản sao cùng máy, chưa có offsite.

Xác minh trước phát hành: typecheck/lint/build, 50 test frontend và13 nhóm API đều đạt. npm audit production0 lỗ hổng đã biết. Xác minh public: Home200; sản phẩm200 (React route), health200/databaseconnected; HTTP301; www301; /.env403; API admin không đăng nhập401. Trình duyệt hiển thị Home và sản phẩm399000đ, ảnh vàfont hoạt động; ảnh production-2026-10-22.png. Docker API health=healthy; Mongo pingok. Bootstrap admin script được kiểm tra cú pháp nhưng chưa chạy tạo tài khoản.

CSDL production mới với catalog seed, không sao chép user/đơn thử local. Chủ dự án tự tạo admin và rà soát tồn kho, thành phần, chính sách trước nhận đơn thực. PayOS/SMTP/Gemini phải kiểm tra thật sau khi điền .env; không tuyên bố tích hợp đã hoạt động. Hướng dẫn tại doc/deployment/ec2-production.md. Không cấp ElasticIP hoặc tài nguyên AWS có phí mới. IP tự cấp có thể đổi khi stop/start; cần giữ DNS cập nhật hoặc dùng ElasticIP theo lựa chọn của chủ dự án.
