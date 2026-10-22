# Quản lý mã nguồn

## Nhánh

- `main`: phiên bản phát hành ổn định.
- `develop`: nhánh tích hợp.
- `feature/*`, `fix/*`, `docs/*`: nhánh công việc, tạo từ `develop` và mở PR trở lại `develop`.
- Bản sửa khẩn cấp có thể tạo `hotfix/*` từ `main` rồi đồng bộ lại `develop`.

## Commit và review

Dùng Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `chore`). Mỗi PR nên có mục tiêu rõ, mô tả thay đổi, cách kiểm tra, ảnh chụp UI khi có thay đổi giao diện và ghi chú migration nếu đổi schema.
