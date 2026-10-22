import { Product } from "../models/index.js";

export async function ensureCatalog() {
  await Product.updateOne(
    { slug: "bo-tro-choi-tranh-trap" },
    {
      $setOnInsert: {
        slug: "bo-tro-choi-tranh-trap",
        name: "Bộ trò chơi Tránh Trap",
        description:
          "Trò chơi giáo dục giúp cả gia đình nhận diện những cạm bẫy trên không gian số. Quan sát tình huống, cùng nhau thảo luận và lựa chọn cách xử lý an toàn.",
        price: 399000,
        stock: 100,
        active: true,
        age: "11–16 tuổi",
        players: "2–4 người",
        duration: "20–30 phút",
        components: [
          {
            name: "Thẻ Thanh Tra",
            quantity: 20,
            description: "Nhập vai và quan sát tình huống từ nhiều góc nhìn.",
          },
          {
            name: "Thẻ Dấu Hiệu",
            quantity: 20,
            description:
              "Nhận diện thông tin bất thường và các dấu hiệu đáng ngờ.",
          },
          {
            name: "Thẻ Vụ Án",
            quantity: 20,
            description: "Cùng thảo luận các tình huống trong thế giới số.",
          },
          {
            name: "Cẩm nang hướng dẫn",
            quantity: 1,
            description: "Hướng dẫn cách bắt đầu một cuộc trò chuyện.",
          },
        ],
      },
    },
    { upsert: true },
  );
}
