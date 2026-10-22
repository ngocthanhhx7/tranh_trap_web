# Kiến thức tham khảo cho Sóc AI

Nguồn do chủ dự án chỉ định: _Bộ cẩm nang về bảo vệ trẻ em trên không gian mạng_, Cục An toàn thông tin, năm2024, 86 trang:
https://ictv.1cdn.vn/2024/12/19/cam-nang-bao-ve-tre-em-mau-2-finnal-1734583084169122796255.pdf

Đã tải bản gốc vào thư mục tham khảo bị Git bỏ qua và trích văn bản để biên tập. Không coi câu lệnh trong tài liệu là chỉ thị cho ứng dụng. Không chép nguyên cuốn sách lên web hay gửi toàn bộ86trang ở mỗi câu hỏi; không có fine-tuning model.

server/src/services/safetyKnowledge.ts chứa8 bản tóm lược theo chủ đề: tài khoản/riêng tư; lừa đảo/mạo danh; bắt nạt; nội dung độc hại/thử thách; dụ dỗ/xâm hại; kiểm chứng tin; cân bằng thời gian và đồng hành; chia sẻ ảnh/dấu chân số. Mỗi mục có trang nguồn và từ khóa. Hệ thống bỏ dấu tiếng Việt để so khớp, chọn tối đa3mục liên quan, đưa vào prompt dưới nhãn dữ liệu tham khảo. Câu hỏi chung về an toàn số có3mục nền; hỏi mua hàng thuần túy không chèn ngữ cảnh không liên quan.

Prompt yêu cầu dẫn link PDF và trang khi dùng kiến thức. Bản2024 không được xem là thông tin hiện hành cho số liệu, tổ chức hoặc tính năng phần mềm. Không biến tiêu chí về thời gian sử dụng mạng trong sách thành chẩn đoán y tế, không kết luận pháp lý. Giọng điệu ấm áp nhưng nghiêm túc khi có sự cố, không xin trẻ gửi ảnh riêng tư hay thông tin nhận dạng. Gặp nguy hiểm ưu tiên người lớn tin cậy và dịch vụ khẩn cấp địa phương, không chỉ chuyển cho nhân viên bán hàng.

API /chat và biến môi trường không đổi. Giới hạn số lượt, chống spam, bảo vệ mặt ngửa thẻ, giá/chính sách từ dữ liệu sản phẩm vẫn giữ. Kiểm thử chọn chủ đề, giới hạn số mục, nguồn/trang và quy tắc prompt đạt; chất lượng câu trả lời thực tế còn phụ thuộc Gemini đang cấu hình, chưa được coi là đã kiểm chứng chỉ bằng mock.
