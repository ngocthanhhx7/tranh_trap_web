# Cập nhật nhận diện và tương tác

Khẩu hiệu hiển thị ở hero, title trình duyệt và dải chữ header: **Tỉnh táo online - Biết sai để tránh**. Menu Home đổi thành Trang chủ. Dải chữ có hai nhóm giống nhau, mỗi nhóm lặp bốn lần, GSAP dịch ngang tuyến tính liên tục. Có nút tạm dừng, dừng khi hover/tab ẩn, và tắt chuyển động nếu prefers-reduced-motion. Bản sao chỉ để trang trí, trình đọc màn hình đọc khẩu hiệu một lần.

Bảng màu gốc: đỏ #c42d27, xanh dương #749dd2, cam #f3705f, xanh lá #7cc9a8, be #f9f5ef, vàng #ffd652, tím #a194c7. Các nền be đậm cũ đổi sang be chuẩn hoặc sắc độ pha từ màu thương hiệu; footer đỏ, chữ sáng và tiêu đề vàng. Giữ ảnh sản phẩm/Home đã duyệt; không tự chỉnh mặt thẻ.

Icon Home chuyển từ SVG xuất Figma cỡ nhỏ sang Lucide SVG đồng nhất nét bo tròn (package lucide-react có sẵn). Pinterest được xem để tham khảo phong cách, không tải ảnh icon không rõ quyền từ kho tổng hợp. Tham khảo: https://de.pinterest.com/ideas/colorful-educational-icons/957815459701/. Logo Zalo/Facebook/TikTok dùng đúng tài nguyên chủ dự án cung cấp tại client/public/images/bar.

FloatingContactBar có hotline, Zalo, Facebook, TikTok và nút Về đầu trang chỉ khi scrollY >300. Desktop dọc bên trái; mobile chuyển thành hàng dưới để giảm che nội dung, tách với mascot chat; ẩn khi mở chat mobile. Tooltip hỗ trợ hover/focus, link ngoài có noopener/noreferrer. Footer và trang liên hệ dùng cùng config/contacts.ts nên link đồng bộ.

GSAP dùng skill gsap-react và gsap-core: useGSAP có scope/ref và cleanup; chuyển trang fade/translate nhẹ và hero xuất hiện lần lượt; không trì hoãn điều hướng. Tài liệu GSAP: https://gsap.com/resources/React/.

Đã kiểm tra bằng trình duyệt ở desktop và iframe viewport390x680; bản preview tạm đã xóa trước build. Hình kiểm tra trong doc/reports/brand-*-2026-10-23.png. Test mới kiểm tra link, ngưỡng300px và nút pause/resume.

## Xác nhận triển khai

- Đã triển khai tại https://tranhtrap.com.vn/; release `release-20261023T021000Z`, mã nguồn `53cdf30`.
- Typecheck, lint, build và toàn bộ 52 test client + 15 test server đều đạt; npm audit production không có cảnh báo lỗ hổng tại thời điểm kiểm tra.
- HTTPS trả đúng title và bundle mới; health API báo database connected, container API healthy.
- Giữ nguyên file cấu hình thực trên máy chủ (quyền và thời gian sửa không đổi), giữ volume MongoDB; đã chạy backup trước triển khai.
- Ảnh xác nhận trực tiếp trên website: `../reports/brand-public-2026-10-23.png` và `../reports/brand-public-footer-2026-10-23.png`.
- Chatbot dùng các đoạn kiến thức biên soạn từ cẩm nang và trang nguồn trong prompt, không phải fine-tune hay lập chỉ mục toàn bộ PDF. Đã kiểm tra chọn ngữ cảnh và cấu trúc prompt bằng test; chưa gọi Gemini trực tiếp trên production trong đợt xác nhận này.

## Tinh chỉnh thanh liên hệ

Zalo dùng nền trắng, bỏ vòng xanh lồng nhau; Facebook được bo tròn đồng bộ cả ở footer. Hotline rung nhẹ, ba logo mạng xã hội nhấp nhô lệch nhịp bằng GSAP, nút về đầu trang nhấp nhô theo chiều dọc. Tất cả nút có hiệu ứng nâng/phóng nhẹ khi hover hoặc focus và thu nhẹ khi nhấn; tôn trọng prefers-reduced-motion. Typecheck, lint, build client và hai test thanh liên hệ đạt. Triển khai frontend release-20261023T022000Z, giữ API hiện tại; HTTPS trả bundle mới và API health vẫn database connected.

## Thanh liên hệ mobile thu gọn

Ở màn hình tối đa 900px, mặc định chỉ hiện một nút liên hệ 44px ở góc trái dưới và tính safe-area. Nhấn mở các nút theo chiều dọc, giới hạn chiều cao theo viewport; đóng khi chọn kênh, chạm ngoài hoặc Escape. Các liên kết bị ẩn không nằm trong thứ tự Tab. Desktop giữ thanh dọc luôn mở; khi chat mobile mở vẫn ẩn thanh liên hệ. Đã đạt lint, build và 3 test thanh liên hệ, gồm thao tác mở/đóng trên mobile. Frontend release-20261023T024000Z đã được xác nhận qua HTTPS; trình duyệt tự động hiện bị tắt nên chưa chụp lại giao diện mobile trực tiếp.

## Căn giữa nút mạng xã hội ở trang Liên hệ

Sửa riêng .contact-socials: inline-flex căn giữa hai chiều, nút 46px, logo 28px, khoảng cách 12px và xuống dòng khi cần; bổ sung hover, active, focus-visible và reduced-motion. Không thay đổi liên kết. Build từ snapshot HEAD cộng đúng thay đổi CSS để không triển khai các chỉnh sửa cẩm nang chưa hoàn tất trong workspace. Build đạt, frontend release-20261023T025000Z đã được kiểm tra trực tiếp qua trình duyệt trên /lien-he. Ảnh xác nhận: ../reports/contact-page-fix-2026-10-23.png.
