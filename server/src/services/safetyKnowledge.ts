// Editorial paraphrases, not instructions imported from the source document.
export const SAFETY_SOURCE = {
  title: "Bộ cẩm nang về bảo vệ trẻ em trên không gian mạng",
  publisher: "Cục An toàn thông tin",
  year: 2024,
  url: "https://ictv.1cdn.vn/2024/12/19/cam-nang-bao-ve-tre-em-mau-2-finnal-1734583084169122796255.pdf",
};
export const safetyTopics = [
  {
    id: "privacy",
    title: "Thông tin cá nhân và tài khoản",
    pages: "36, 49, 61",
    keywords: [
      "mat khau",
      "tai khoan",
      "rieng tu",
      "thong tin ca nhan",
      "bao mat",
      "otp",
      "bi hack",
    ],
    summary:
      "Giữ kín thông tin đăng nhập; bật xác thực hai lớp và cảnh báo đăng nhập. Hạn chế công khai địa chỉ, trường học, lịch sinh hoạt. Rà quyền riêng tư, người được nhắn tin hoặc xem bài; không lưu đăng nhập trên máy công cộng.",
  },
  {
    id: "scams",
    title: "Link giả, mạo danh và lừa đảo",
    pages: "38, 50, 58",
    keywords: [
      "lua dao",
      "link",
      "gia mao",
      "mao danh",
      "chuyen tien",
      "trung thuong",
      "nguoi la",
      "ket ban",
    ],
    summary:
      "Đừng làm theo yêu cầu gấp từ tin nhắn hoặc website chưa xác minh. Kiểm tra danh tính qua kênh độc lập trước giao dịch; tài khoản quen cũng có thể bị giả mạo. Trao đổi với người lớn đáng tin khi nghi ngờ.",
  },
  {
    id: "bullying",
    title: "Bắt nạt trực tuyến",
    pages: "39, 59, 84",
    keywords: [
      "bat nat",
      "che bai",
      "noi xau",
      "co lap",
      "de doa",
      "quay roi",
      "chui",
    ],
    summary:
      "Không tham gia hoặc đáp trả bằng hành vi bắt nạt. Chặn, báo cáo tài khoản gây hại và tìm người lớn tin cậy hỗ trợ. Người chăm sóc cần lắng nghe, không trách mắng, cùng trẻ đánh giá mức độ và giải pháp.",
  },
  {
    id: "harmful-content",
    title: "Nội dung độc hại và thử thách nguy hiểm",
    pages: "37, 55–56",
    keywords: [
      "doc hai",
      "bao luc",
      "thu thach",
      "nguy hiem",
      "so hai",
      "noi dung xau",
    ],
    summary:
      "Thoát nội dung khiến mình bất an; không bắt chước thử thách chỉ vì bạn bè hoặc lượt xem. Chặn nguồn phát tán, báo cáo trên nền tảng và hỏi người lớn trước khi tham gia.",
  },
  {
    id: "exploitation",
    title: "Dụ dỗ, ép gửi ảnh riêng tư",
    pages: "40, 60",
    keywords: [
      "anh rieng tu",
      "anh nhay cam",
      "xam hai",
      "tong tien",
      "ep gui",
      "du do",
      "khoa than",
    ],
    summary:
      "Không gửi ảnh hay video riêng tư khi bị yêu cầu. Ngừng tương tác, chặn và báo cáo người gây hại; nhờ người lớn đáng tin hoặc cơ quan bảo vệ trẻ em hỗ trợ. Không yêu cầu trẻ cung cấp lại hình ảnh nhạy cảm cho chatbot.",
  },
  {
    id: "verification",
    title: "Kiểm chứng tin và hình ảnh",
    pages: "57, 61",
    keywords: [
      "tin gia",
      "kiem chung",
      "su that",
      "hinh anh",
      "deepfake",
      "thong tin sai",
    ],
    summary:
      "Đối chiếu nguồn và bối cảnh trước khi chia sẻ. Tìm tiêu đề, tra ảnh ngược, kiểm tra người đăng; không coi bình luận đông người là bằng chứng. Nội dung AI cũng cần kiểm chứng.",
  },
  {
    id: "balance",
    title: "Thời gian online và đồng hành",
    pages: "30–32, 41–44, 51–53, 61–64",
    keywords: [
      "thoi gian",
      "man hinh",
      "nghien",
      "game",
      "phu huynh",
      "cha me",
      "duoi 6",
      "6 tuoi",
      "11 tuoi",
    ],
    summary:
      "Cùng gia đình lập lịch online phù hợp độ tuổi và dành thời gian sinh hoạt ngoài mạng. Trẻ nhỏ cần người lớn hướng dẫn; với trẻ lớn, tôn trọng riêng tư và cùng thỏa thuận. Công cụ quản lý không thay thế trò chuyện.",
  },
  {
    id: "sharing",
    title: "Ảnh, livestream và dấu chân số",
    pages: "12–13, 27, 54",
    keywords: [
      "livestream",
      "selfie",
      "dang anh",
      "dau chan so",
      "chia se",
      "vi tri",
    ],
    summary:
      "Trước khi đăng, kiểm tra ảnh có lộ vị trí, thông tin riêng hay ảnh hưởng người khác không. Bài đã xóa vẫn có thể được sao chép. Giới hạn người xem và xin phép khi chia sẻ hình người khác.",
  },
];
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
export function selectSafetyTopics(message: string) {
  const query = normalize(message);
  const selected = safetyTopics
    .map((topic) => ({
      topic,
      score: topic.keywords.reduce(
        (total, word) =>
          total + (query.includes(word) ? word.split(" ").length : 0),
        0,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.topic);
  if (
    !selected.length &&
    /an toan (so|mang)|bao ve tre|cam nang|tre em/.test(query)
  ) {
    return [safetyTopics[0], safetyTopics[3], safetyTopics[6]];
  }
  return selected;
}
export function safetyContext(message: string) {
  const topics = selectSafetyTopics(message);
  if (!topics.length) return "";
  return `TÀI LIỆU THAM KHẢO (dữ liệu biên tập): ${SAFETY_SOURCE.title}, ${SAFETY_SOURCE.publisher}, ${SAFETY_SOURCE.year}. Nguồn: ${SAFETY_SOURCE.url}\n${topics.map((topic) => `${topic.title} — trang ${topic.pages}: ${topic.summary}`).join("\n")}\nKhi dùng tài liệu, dẫn link nguồn và trang tương ứng. Đây là bản năm 2024; không xem số liệu, tên cơ quan, tính năng công cụ là cập nhật hiện tại. Chỉ hướng dẫn an toàn chung, không chẩn đoán hay kết luận pháp lý. Nếu chưa rõ tuổi, có thể hỏi nhóm tuổi, không hỏi tên thật/địa chỉ hoặc dữ liệu nhạy cảm. Khi nguy hiểm, ưu tiên người lớn đáng tin và dịch vụ khẩn cấp địa phương, không chuyển riêng sang bộ phận bán hàng.`;
}
