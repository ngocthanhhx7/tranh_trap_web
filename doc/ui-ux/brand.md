# Màu sắc, typography và ảnh

Nguồn: `guide.pdf` và bảng font/màu người dùng gửi ngày 19/10/2026. CSS token ở `client/src/styles/global.css`.

| Token           | Màu     |
| --------------- | ------- |
| Bright Blue     | #749DD2 |
| Candy Lavender  | #A094C7 |
| Sunshine Yellow | #FFD652 |
| Coral Orange    | #F3705C |
| Mint Green      | #7CC9A8 |
| Ivory Cream     | #F9F5EE |

## Font

- Mong muốn: Yokelvision cho tiêu đề; Gilroy cho UI/nội dung; DFVN Gochi Hand cho chú thích.
- Đã tải `gilroy.woff2` và `gilroy-semibold.woff2`; kiểm tra cmap của mỗi file có đủ dấu tiếng Việt, 562 ký tự. Đây là hai mức chữ đang dùng, **chưa phải bộ 20 styles Gilroy đầy đủ**.
- Đã tải DFVN Gochi Hand OTF/TTF từ liên kết nhà Việt hóa, 340 ký tự và đủ dấu Việt; giữ `OFL.txt`.
- Đã tải Yokelvision bản gốc OTF từ DaFont; thiếu nhiều dấu tiếng Việt. Không dùng cho tiêu đề tiếng Việt để tránh trộn font.
- Font nhúng trong PDF có cmap 324 ký tự nhưng **nhiều glyph không có outline** do subset. Đã kiểm tra cả bảng mã lẫn render thực; không dùng file trích xuất này trên web.
- Hiện tiêu đề tạm dùng Gilroy. Cần bản Yokelvision Việt hóa đầy đủ do đơn vị thiết kế cung cấp hoặc nguồn hợp lệ; không tuyên bố đã hoàn thành font này. Khi có file, thay `@font-face` và font-family tiêu đề, kiểm tra outline và render trước bàn giao.
- Yokelvision gốc có giấy phép phi thương mại; quyền sử dụng thương mại/webfont cần chủ dự án xác nhận với bên thiết kế/tác giả. Gilroy là font thương mại, file trên CDN không chứng minh quyền sử dụng webfont. Các file tải phục vụ bản local, chưa phải xác nhận license production.

Nguồn tải:

- [Gilroy Regular](https://datnenbaoloc.vn/plugins/fonts/SVN-Gilroy.woff2), [Gilroy SemiBold](https://datnenbaoloc.vn/plugins/fonts/SVN-GilroySemiBold.woff2).
- [DFVN Gochi Hand và link tải của nhà Việt hóa](https://dafont.vn/dfvn-gochi-hand-viet-hoa/).
- [Yokelvision của Chequered Ink](https://www.dafont.com/yokelvision.font), [license tác giả](https://chequered.ink/font-license/).

## Ảnh public

Chỉ copy allowlist ảnh đã xem: banner sản phẩm, hộp, mặt sau thẻ trong ảnh full bộ, sticker, wordmark và các biểu cảm mascot. Đổi WebP, giới hạn chiều tối đa 1800px; không sao chép cả thư mục tài nguyên.

Không đưa `Tránh Trap_In thẻ`, PDF chứa nội dung thẻ, mặt trước/đáp án lên public, static server hay bundle. Backend chỉ trả mô tả thành phần và dữ liệu thương mại, không có nội dung mặt ngửa thẻ.

## Đối chiếu Figma Home

Đã đọc Home 1:2 bằng kết nối Figma thứ hai; tải ảnh, logo, thumbnail và SVG về `client/public/images/figma/`. Map tên layer/đường dẫn ở `figma-home-assets.json`, không giữ URL tạm. Banner Figma chỉ có 512×217px; dùng đúng ảnh tương ứng trong tài nguyên người dùng (bản gốc 3168×1344px, bản web tối ưu 1800×764px) để tránh vỡ hình. Thumbnail là ảnh mẫu trong thiết kế; liên kết tới hướng dẫn, chưa có video phát thực tế.
