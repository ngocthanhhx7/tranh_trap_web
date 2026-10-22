# API

Base URL local: `http://localhost:4000/api/v1`.

| Method | Path      | Mục đích                          |
| ------ | --------- | --------------------------------- |
| GET    | `/health` | Trạng thái API và kết nối MongoDB |

Endpoint health trả `200` khi MongoDB đã kết nối hoặc `503` khi database chưa sẵn sàng. API mới đặt dưới `/api/v1`, validate body/query/params ở biên và trả JSON nhất quán.
