# Cập nhật nhận diện và tương tác

Khẩu hiệu hiển thị ở hero, title trình duyệt và dải chữ header: **Tỉnh táo online - Biết sai để tránh**. Menu Home đổi thành Trang chủ. Dải chữ có hai nhóm giống nhau, mỗi nhóm lặp bốn lần, GSAP dịch ngang tuyến tính liên tục. Có nút tạm dừng, dừng khi hover/tab ẩn, và tắt chuyển động nếu prefers-reduced-motion. Bản sao chỉ để trang trí, trình đọc màn hình đọc khẩu hiệu một lần.

Bảng màu gốc: đỏ #c42d27, xanh dương #749dd2, cam #f3705f, xanh lá #7cc9a8, be #f9f5ef, vàng #ffd652, tím #a194c7. Các nền be đậm cũ đổi sang be chuẩn hoặc sắc độ pha từ màu thương hiệu; footer đỏ, chữ sáng và tiêu đề vàng. Giữ ảnh sản phẩm/Home đã duyệt; không tự chỉnh mặt thẻ.

Icon Home chuyển từ SVG xuất Figma cỡ nhỏ sang Lucide SVG đồng nhất nét bo tròn (package lucide-react có sẵn). Pinterest được xem để tham khảo phong cách, không tải ảnh icon không rõ quyền từ kho tổng hợp. Tham khảo: https://de.pinterest.com/ideas/colorful-educational-icons/957815459701/. Logo Zalo/Facebook/TikTok dùng đúng tài nguyên chủ dự án cung cấp tại client/public/images/bar.

FloatingContactBar có hotline, Zalo, Facebook, TikTok và nút Về đầu trang chỉ khi scrollY >300. Desktop dọc bên trái; mobile chuyển thành hàng dưới để giảm che nội dung, tách với mascot chat; ẩn khi mở chat mobile. Tooltip hỗ trợ hover/focus, link ngoài có noopener/noreferrer. Footer và trang liên hệ dùng cùng config/contacts.ts nên link đồng bộ.

GSAP dùng skill gsap-react và gsap-core: useGSAP có scope/ref và cleanup; chuyển trang fade/translate nhẹ và hero xuất hiện lần lượt; không trì hoãn điều hướng. Tài liệu GSAP: https://gsap.com/resources/React/.

Đã kiểm tra bằng trình duyệt ở desktop và iframe viewport390x680; bản preview tạm đã xóa trước build. Hình kiểm tra trong doc/reports/brand-*-2026-10-23.png. Test mới kiểm tra link, ngưỡng300px và nút pause/resume.
