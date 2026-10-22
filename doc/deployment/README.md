# Môi trường local và triển khai

## Local

1. Cài Node.js 20+, npm 10+ và Docker Desktop (hoặc MongoDB Community Server).
2. Chạy `npm install`, sao chép hai file `.env.example` thành `.env`.
3. Nếu dùng Docker, bật MongoDB với `docker compose up -d mongodb`; nếu cài MongoDB trực tiếp, bảo đảm service đang chạy.
4. Chạy `npm run dev` ở thư mục gốc.
5. Mở `http://localhost:5173` và kiểm tra `http://localhost:4000/api/v1/health`.

`npm run build` tạo bundle client trong `client/dist` và JavaScript server trong `server/dist`. Cấu hình production, secrets và nơi lưu database cần được quyết định trước khi triển khai.
