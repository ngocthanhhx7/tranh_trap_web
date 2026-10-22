# Cơ sở dữ liệu

Môi trường local dùng MongoDB tại `mongodb://127.0.0.1:27017/tranh_trap_web`; đổi URI bằng `MONGODB_URI` trong `server/.env`. Kết nối và model dùng Mongoose.

Khi thêm collection, ghi rõ schema, index, quy tắc xóa/cập nhật và dữ liệu nhạy cảm. Migration hoặc seed đặt trong `server/scripts/migrations` và `server/scripts/seeds`. Không lưu dữ liệu production trong môi trường local.
