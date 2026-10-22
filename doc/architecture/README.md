# Kiến trúc

- `client`: SPA React + TypeScript, build bằng Vite, điều hướng qua React Router và quản lý server state bằng TanStack Query.
- `server`: REST API Express + TypeScript, kiểm tra cấu hình bằng Zod, bảo vệ header bằng Helmet và ghi log HTTP bằng Pino.
- MongoDB: cơ sở dữ liệu tài liệu local, truy cập qua Mongoose.

Luồng request: Browser → client → `/api/v1` → Express routes/controllers/services → Mongoose → MongoDB.

Client gọi API qua `client/src/services/api`; server phụ trách xác thực dữ liệu, nghiệp vụ và truy cập dữ liệu. Cấu hình theo môi trường nằm trong `.env`, với biến được liệt kê ở `.env.example`.
