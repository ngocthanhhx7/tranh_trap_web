# Hướng dẫn đóng góp

1. Tạo nhánh `feature/<mo-ta>`, `fix/<mo-ta>` hoặc `docs/<mo-ta>` từ `develop`.
2. Tạo thay đổi tập trung, dùng TypeScript và theo quy ước định dạng trong `.editorconfig`.
3. Chạy `npm run typecheck`, `npm run lint` và `npm run build` phù hợp với thay đổi.
4. Mở pull request vào `develop`, mô tả mục đích, ảnh hưởng và cách kiểm tra.
5. Chỉ đưa vào `main` khi bản phát hành đã được review và sẵn sàng triển khai.

Dùng Conventional Commits, ví dụ: `feat(client): add booking page`, `fix(server): validate request body`, `docs: describe local setup`.

Làm theo mục Bắt đầu trong [README.md](README.md). Không commit file `.env`, build output hoặc dữ liệu MongoDB local.
