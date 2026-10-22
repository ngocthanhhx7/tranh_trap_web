# Tranh Trap Web

Monorepo gồm `client` (React) và `server` (Node.js/Express), dùng MongoDB local trong giai đoạn phát triển.

## Yêu cầu

- Node.js 20 trở lên và npm 10 trở lên
- Docker Desktop để chạy MongoDB local bằng Docker Compose; hoặc MongoDB Community Server tại `mongodb://127.0.0.1:27017`

## Bắt đầu

```bash
npm install
```

Tạo file môi trường từ các file mẫu:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Trên Windows PowerShell có thể dùng `Copy-Item client/.env.example client/.env` và `Copy-Item server/.env.example server/.env`.

Khởi động MongoDB local bằng Docker Compose (nếu không cài MongoDB trực tiếp):

```bash
docker compose up -d mongodb
```

Khởi chạy cả client và server:

```bash
npm run dev
```

- Client: <http://localhost:5173>
- API: <http://localhost:4000/api/v1>
- Kiểm tra API và MongoDB: <http://localhost:4000/api/v1/health>

Các lệnh khác: `npm run dev:client`, `npm run dev:server`, `npm run build`, `npm run typecheck`, `npm run lint`. Tắt MongoDB Compose bằng `docker compose down`; dữ liệu local được giữ trong volume `mongodb_data`.

Nếu gặp `EADDRINUSE`, nghĩa là một instance đang chạy. Có thể dùng instance hiện tại tại các URL ở trên, hoặc tìm và dừng tiến trình theo cổng trong PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 5173,4000 -State Listen
Stop-Process -Id <PID> -Force
```

Muốn đổi cổng frontend, đặt `VITE_PORT`; đích proxy dùng `VITE_API_PROXY_TARGET`. API dùng `PORT`. Cập nhật `CLIENT_ORIGIN` tương ứng.

## Bản thương mại đầu tiên

- Home, sản phẩm 399.000đ, giỏ hàng, checkout guest, tra cứu đơn; trung tâm tài khoản; dashboard staff/admin.
- Phí ship mặc định 25.000đ, cấu hình riêng 34 tỉnh/thành ở `/quan-ly/phi-van-chuyen`.
- Tạo admin đầu tiên: `npm run bootstrap:admin --workspace=server` (nhập tương tác, không có mật khẩu mặc định).
- Điền provider keys vào `.env` server từ mẫu; agent không đọc file thật. Frontend không giữ secrets.
- Kiểm tra: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

Hướng dẫn [cấu hình](doc/deployment/configuration.md), [phạm vi và phần thiếu](doc/requirements/implementation.md), [màu/font](doc/ui-ux/brand.md), [API](doc/api/shop.md), [schema](doc/database/schema.md).

## Cấu trúc

- `client/`: ứng dụng React, routes, giao diện, hooks và lớp gọi API.
- `server/`: REST API Express, cấu hình, routes, middleware và kết nối Mongoose.
- `doc/`: yêu cầu, kiến trúc, API, cơ sở dữ liệu, UI/UX, kiểm thử, triển khai và quy ước làm việc.
- `AGENTS.md`: quy tắc dành cho coding agents.

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết quy trình đóng góp và thư mục `doc/` để đọc tài liệu chi tiết.
