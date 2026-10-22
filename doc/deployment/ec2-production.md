# Triển khai EC2 và cấu hình môi trường

Đích: `tranhtrap.com.vn`, EC2 Amazon Linux 2023 ARM64, IP `3.27.247.136`. Mã nguồn: https://github.com/ngocthanhhx7/tranh_trap_web. Không đưa khóa SSH hoặc `.env` lên GitHub. Bản build production không nạp file môi trường local.

## Kết nối và cấu hình

Từ PowerShell trên máy của bạn:

```powershell
ssh -i E:/key/tranhtrap.pem ec2-user@3.27.247.136
```

Sau khi vào server, mở file bằng editor; không gửi nội dung file vào chat:

```bash
nano /opt/tranhtrap/shared/.env
```

Sửa trực tiếp; nhấn `Ctrl+O`, Enter để lưu, rồi `Ctrl+X` để thoát. File chỉ tài khoản EC2 được đọc/ghi (mode 600). Ứng dụng nạp file này qua dotenv; có thể đặt giá trị trong dấu nháy, đặc biệt nếu chứa `#` hoặc khoảng trắng.

Các biến bạn cần điền:

```dotenv
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=YOUR_SUPPORTED_MODEL
AI_DAILY_LIMIT=20
AI_CHAT_TONE="Gần gũi, ấm áp, nhí nhảnh vừa phải; xưng Sóc hoặc mình, dùng emoji tiết chế."

SMTP_HOST=YOUR_SMTP_HOST
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USERNAME
SMTP_PASSWORD="YOUR_SMTP_PASSWORD"
SMTP_FROM="Tránh Trap <YOUR_SENDER_EMAIL>"

PAYOS_CLIENT_ID=YOUR_PAYOS_CLIENT_ID
PAYOS_API_KEY=YOUR_PAYOS_API_KEY
PAYOS_CHECKSUM_KEY=YOUR_PAYOS_CHECKSUM_KEY
SHIPPING_DEFAULT_FEE=25000
```

Thay các giá trị `YOUR_...` bằng thông tin của bạn; để trống tích hợp nào chưa dùng. Gemini: lấy key và model được tài khoản hỗ trợ. SMTP: dùng thông tin SMTP từ nhà cung cấp; cổng 465 dùng TLS, 587 dùng STARTTLS; địa chỉ gửi phải được nhà cung cấp xác thực. PayOS: lấy ba thông tin từ kênh thanh toán của doanh nghiệp; khai báo webhook `https://tranhtrap.com.vn/api/v1/payments/webhook`. Không dùng mật khẩu tài khoản email chính thay mật khẩu ứng dụng nếu nhà cung cấp yêu cầu mật khẩu ứng dụng.

Runtime triển khai cố định các biến hạ tầng bên ngoài file: `NODE_ENV=production`, `PORT=4000`, `TRUST_PROXY_HOPS=1`, `CLIENT_ORIGIN=https://tranhtrap.com.vn`, `MONGODB_URI=mongodb://tranhtrap-mongo:27017/tranh_trap_web`. Không cần chỉnh chúng trong file. Frontend dùng `/api/v1`, không đặt key ở biến `VITE_*`.

Áp dụng sau mỗi lần sửa file:

```bash
sudo /usr/local/sbin/tranhtrap-restart
curl -fsS https://tranhtrap.com.vn/api/v1/health
```

Lệnh khởi động lại sẽ chờ API khỏe; khi cập nhật image mà health check thất bại, thử phục hồi image trước. Thay cấu hình sai trên cùng image cần sửa lại file và chạy lệnh lần nữa.

## Tạo admin đầu tiên

```bash
sudo docker exec -it tranhtrap-api node scripts/seeds/bootstrap-admin.mjs
```

Bạn tự nhập tên, email và mật khẩu trong terminal. Không có tài khoản/mật khẩu mặc định. Đăng nhập tại `https://tranhtrap.com.vn/dang-nhap` sẽ vào `/admin`. Kiểm tra lại tồn kho và thành phần seed trước khi nhận đơn thật.

## Vận hành

- Nginx phục vụ build React, proxy API qua loopback; Docker chỉ publish API trên `127.0.0.1:4000`. MongoDB chỉ ở mạng Docker, không publish 27017.
- Security Group: HTTP 80, HTTPS 443 public; SSH 22 chỉ IP quản trị. Không mở 4000/27017. IP hiện tại là IP public tự cấp; cần Elastic IP hoặc cập nhật DNS nếu stop/start EC2 làm IP đổi.
- Docker tự chạy lại sau reboot, container có restart policy. API có health check và giới hạn RAM/log; EC2 micro có dung lượng nhỏ, cần theo dõi RAM và ổ đĩa.
- Timer `tranhtrap-cert-renew.timer` kiểm tra gia hạn HTTPS hai lần/ngày. Timer `tranhtrap-backup.timer` sao lưu DB hàng ngày lúc khoảng 02:15 giờ Việt Nam, giữ 7 ngày tại `/var/lib/tranhtrap-backups` (chỉ root đọc). Đây là backup cùng máy; cần bổ sung bản sao ngoài máy để chống mất EC2/ổ đĩa.

```bash
sudo docker ps
sudo systemctl status nginx
sudo systemctl list-timers 'tranhtrap-*'
sudo /usr/local/sbin/tranhtrap-backup
```

Không chạy lệnh hiển thị nội dung `.env`, toàn bộ `docker inspect` hoặc environment ra log/chat. Chỉ chia sẻ mã lỗi đã bỏ secrets.

## Phát hành và khôi phục

Chạy kiểm thử/typecheck/lint/build local. Dùng `node deploy/package-release.mjs release-YYYYMMDDTHHMMSSZ` để tạo archive allowlist trong `deploy-artifacts/`; không kèm `.env` thật, khóa, source map, node_modules hay database local. Tải file lên EC2, đối chiếu SHA256 rồi giải nén vào `/opt/tranhtrap/releases/<release>`. Chạy `sudo bash deploy/install-release.sh <release>` từ thư mục release. Giữ ít nhất một release trước để phục hồi; không xóa volume MongoDB.

Frontend có symlink `/var/www/tranhtrap/previous`. Khi cần rollback toàn bộ, chuyển `current` về release trước, chạy `sudo /usr/local/sbin/tranhtrap-restart tranhtrap-api:<release-trước>` và `sudo systemctl reload nginx`. Thay đổi schema cần đánh giá riêng; rollback ứng dụng không tự phục hồi database.

Gemini/SMTP/PayOS cần kiểm thử thật sau khi bạn nhập cấu hình. Trạng thái health API hoặc có biến cấu hình không chứng minh dịch vụ bên ngoài đã hoạt động.

## HTTPS trên máy cài lần đầu

Sau khi DNS apex/www đúng server và AWS mở80/443, cài Certbot trong /opt/certbot rồi chạy:

```bash
sudo /opt/certbot/bin/certbot certonly --nginx --non-interactive --agree-tos --register-unsafely-without-email -d tranhtrap.com.vn -d www.tranhtrap.com.vn
sudo install -m 644 deploy/nginx-https.conf /etc/nginx/conf.d/tranhtrap.conf
sudo nginx -t
sudo systemctl reload nginx
```

Chỉ cài nginx-https.conf khi chứng chỉ đã được cấp. Cài các file deploy/_.service và deploy/_.timer vào /etc/systemd/system, daemon-reload và enable hai timer. Máy hiện tại đã hoàn thành các bước này, không cần chạy cấp mới. File deploy/nginx.conf là cấu hình HTTP lúc khởi tạo; không ghi đè cấu hình HTTPS đang hoạt động bằng file này.
