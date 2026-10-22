# Hướng dẫn cho coding agents

- Không được đọc, in, tìm kiếm nội dung hoặc sao chép bất kỳ file `.env` hay `.env.*` chứa cấu hình thực. Chỉ được đọc và chỉnh sửa các file mẫu có hậu tố `.env.example` hoặc tên `.env.example`. Người dùng tự hoàn thiện secrets; không đưa secrets vào mã nguồn, log, báo cáo hoặc hội thoại.

- Giữ `client` là ứng dụng frontend React và `server` là backend Node.js/Express.
- Đọc tài liệu trong `doc/` trước khi thay đổi kiến trúc, API hoặc schema dữ liệu.
- Dùng TypeScript cho mã ứng dụng; bật kiểm tra kiểu và giữ các ranh giới module rõ ràng.
- Không commit `.env`, thông tin đăng nhập hoặc dữ liệu local. Cập nhật `.env.example` khi thêm biến môi trường.
- API đặt dưới `/api/v1`; validate dữ liệu đầu vào ở biên API và không trả lỗi nội bộ cho client.
- Dùng MongoDB local qua URI cấu hình; truy cập dữ liệu thông qua model/service phù hợp.
- Ưu tiên thay đổi nhỏ, đặt tên dễ hiểu và cập nhật tài liệu khi hành vi hoặc cấu hình thay đổi.
