import { useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Flag,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { api } from "../../services/shop";
import {
  ButtonLink,
  Empty,
  ErrorBox,
  SectionTitle,
  Tag,
} from "../../components/common/UI";

export function AboutPage() {
  return (
    <div className="container page">
      <section className="public-hero">
        <div>
          <Tag tone="mint">Về Tránh Trap</Tag>
          <h1>Cùng trẻ xây dựng bản lĩnh trong thế giới số.</h1>
          <p>
            Tránh Trap kết hợp trò chơi trên bàn và trải nghiệm trực tuyến để mở
            ra những cuộc thảo luận gần gũi về an toàn số.
          </p>
          <div className="actions">
            <ButtonLink to="/san-pham">Khám phá bộ trò chơi</ButtonLink>
            <ButtonLink to="/cau-chuyen" secondary>
              Đọc câu chuyện chúng tôi
            </ButtonLink>
          </div>
        </div>
        <img src="/images/mascot.webp" alt="Sóc Thám Tử đồng hành cùng trẻ" />
      </section>
      <section className="section">
        <SectionTitle
          tag="Giải pháp giáo dục"
          title="Một giải pháp giáo dục an toàn số lấy thảo luận đa chiều làm cốt lõi"
          text="Tránh Trap tạo một không gian an toàn để cùng nhận diện vấn đề, thử lựa chọn và học từ trải nghiệm."
        />
        <div className="grid three">
          {[
            {
              icon: UsersRound,
              title: "Chơi cùng nhau",
              text: "Dành cho nhóm bạn, phụ huynh và những người đồng hành cùng trẻ.",
            },
            {
              icon: Lightbulb,
              title: "Chủ động suy nghĩ",
              text: "Khuyến khích đặt câu hỏi, nhìn từ nhiều góc độ và cân nhắc trước khi quyết định.",
            },
            {
              icon: ShieldCheck,
              title: "Cùng hành động",
              text: "Mang bài học từ bàn chơi đến những tương tác hằng ngày trên môi trường số.",
            },
          ].map((x) => (
            <article className="card" key={x.title}>
              <span className="icon blue">
                <x.icon />
              </span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionTitle
          tag="Định hướng cốt lõi"
          title="Điều chúng tôi hướng tới"
        />
        <div className="grid two">
          <article className="card" style={{ background: "#ffe2dc" }}>
            <Tag tone="white">Sứ mệnh</Tag>
            <h2>
              Tạo thêm cơ hội thực hành nhận diện rủi ro và thảo luận cách ứng
              xử trên môi trường số.
            </h2>
          </article>
          <article className="card" style={{ background: "#e2ebf8" }}>
            <Tag tone="white">Tầm nhìn</Tag>
            <h2>
              Để việc học an toàn số trở thành một phần gần gũi trong gia đình
              và nhà trường.
            </h2>
          </article>
        </div>
      </section>
      <section className="section">
        <SectionTitle
          center
          tag="Mô hình học tập"
          title="Học qua trải nghiệm"
          text="Quan sát tình huống, lắng nghe những góc nhìn khác và cùng tìm một lựa chọn an toàn hơn."
        />
        <div className="grid three">
          {["Chơi trên bàn", "Thảo luận lựa chọn", "Khám phá trực tuyến"].map(
            (x, i) => (
              <article className="card" key={x}>
                <Tag tone="blue">0{i + 1}</Tag>
                <h3>{x}</h3>
                <p>
                  {
                    [
                      "Cùng nhập vai trong một cuộc chơi gần gũi.",
                      "Chia sẻ lập luận và học từ bạn đồng hành.",
                      "Tiếp tục với cẩm nang và các trải nghiệm số.",
                    ][i]
                  }
                </p>
              </article>
            ),
          )}
        </div>
      </section>
      <div className="home-cta">
        <div>
          <Tag tone="mint">Cộng đồng đồng hành</Tag>
          <h2>Ai có thể đồng hành cùng Tránh Trap?</h2>
          <p>
            Trẻ và bạn bè, phụ huynh, nhà trường và những người hướng dẫn — mỗi
            cuộc trò chuyện đều có ý nghĩa.
          </p>
        </div>
        <ButtonLink to="/lien-he">Kết nối với chúng tôi</ButtonLink>
      </div>
    </div>
  );
}

const chapters = [
  {
    id: "khoi-dau",
    title: "Một thế giới số rất gần",
    quote:
      "Thế giới mạng mở ra muôn vàn điều kỳ diệu cho trẻ em, nhưng cũng ẩn chứa những góc khuất khó ngờ.",
    text: "Trẻ em tiếp cận không gian số từ rất sớm. Từ việc tham gia lớp học trực tuyến đến trò chuyện với bạn bè sau giờ tan trường, chiếc màn hình mở ra nhiều cơ hội. Cùng với đó là những tình huống khiến cả người lớn đôi khi lúng túng: một đường link lạ, một lời mời quá hấp dẫn hay một yêu cầu phải xử lý thật gấp.",
    image: "curious",
  },
  {
    id: "dat-cau-hoi",
    title: "Học bằng cách đặt câu hỏi",
    quote: "Chúng tôi tin vào sức mạnh của việc cùng dừng lại và đặt câu hỏi.",
    text: "Khi đối diện với một cạm bẫy trực tuyến tinh vi, trẻ cần biết quan sát, tìm dấu hiệu đáng ngờ và hỏi một người đáng tin cậy. Mỗi cuộc thảo luận là một cơ hội để trẻ chia sẻ quan điểm và người lớn hiểu hơn thế giới của trẻ.",
    image: "detective",
  },
  {
    id: "ban-choi",
    title: "Đưa cuộc trò chuyện xuống bàn chơi",
    quote:
      "Rời xa màn hình một chút để cùng quan sát, cân nhắc và trò chuyện với nhau.",
    text: "Tránh Trap đưa những câu hỏi về an toàn số đến bàn chơi. Mỗi lượt chơi khuyến khích người tham gia cùng nhìn lại dấu hiệu, nói ra lập luận và lựa chọn cách xử lý. Bộ trò chơi là điểm bắt đầu cho những cuộc trò chuyện cởi mở.",
    image: "product",
  },
  {
    id: "tiep-noi",
    title: "Hành trình tiếp tục sau bàn chơi",
    quote:
      "Một ván chơi khép lại là lúc kỹ năng mới và nhận thức an toàn bắt đầu lan tỏa vào đời sống.",
    text: "Một câu hỏi mới, một tình huống vừa gặp trên mạng hay một cuộc trò chuyện cùng gia đình có thể tiếp nối từ sau bàn chơi. Cẩm nang và các trải nghiệm số giúp người chơi tìm hiểu thêm, từng bước xây dựng thói quen bình tĩnh quan sát trước khi hành động.",
    image: "happy",
  },
];
export function StoryPage() {
  return (
    <div className="container page">
      <section
        className="public-hero"
        style={{ background: "linear-gradient(110deg,#fff0bf,#edebf4)" }}
      >
        <div>
          <Tag tone="lavender">Câu chuyện Tránh Trap</Tag>
          <h1>Vì một lần dừng lại có thể tạo nên khác biệt.</h1>
          <p>
            Tránh Trap bắt đầu từ một câu hỏi giản dị: làm sao để những cuộc trò
            chuyện về an toàn số trở nên gần gũi và dễ hiểu hơn?
          </p>
          <ButtonLink to="/san-pham">Khám phá cuộc chơi</ButtonLink>
        </div>
        <img
          src="/images/box.webp"
          alt="Hộp trò chơi Tránh Trap"
          style={{ borderRadius: 22 }}
        />
      </section>
      <div className="story-layout">
        <aside className="card story-toc">
          <h4>Mục lục câu chuyện</h4>
          {chapters.map((c, i) => (
            <a href={`#${c.id}`} key={c.id}>
              0{i + 1} · {c.title}
            </a>
          ))}
        </aside>
        <div>
          {chapters.map((c, i) => (
            <section className="story-chapter" id={c.id} key={c.id}>
              <Tag tone="lavender">Chương 0{i + 1}</Tag>
              <h2>{c.title}</h2>
              <blockquote className="quote">“{c.quote}”</blockquote>
              <p>{c.text}</p>
              {c.image === "product" ? (
                <img
                  src="/images/product.webp"
                  alt="Trọn bộ sản phẩm với mặt sau lá bài"
                />
              ) : (
                <div className="mascot-callout">
                  <img src={`/images/${c.image}.webp`} alt="Sóc Thám Tử" />
                  <div>
                    <Tag tone="white">Góc nhìn đồng hành</Tag>
                    <h3>Cùng quan sát, cùng đặt câu hỏi</h3>
                    <p>
                      Bạn luôn có thể dừng lại và hỏi một người đáng tin cậy.
                    </p>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      <div className="home-cta">
        <div>
          <Tag>Mỗi cuộc trò chuyện đều có ý nghĩa</Tag>
          <h2>Cùng Tránh Trap tạo thêm những cuộc trò chuyện hữu ích.</h2>
        </div>
        <ButtonLink to="/lien-he">Kết nối với chúng tôi</ButtonLink>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [success, setSuccess] = useState(false);
  return (
    <div className="container page">
      <section className="public-hero">
        <div>
          <Tag tone="mint">Kết nối với Tránh Trap</Tag>
          <h1>Bạn muốn cùng Tránh Trap bắt đầu điều gì?</h1>
          <p>
            Hỏi về bộ trò chơi, tìm hiểu cách chơi hoặc trao đổi một ý tưởng hợp
            tác. Hãy để lại lời nhắn cho chúng tôi.
          </p>
          <Tag tone="white">Tư vấn chi tiết & tận tâm</Tag>
        </div>
        <img src="/images/mascot.webp" alt="Sóc Thám Tử Trap" />
      </section>
      <div className="contact-grid">
        <aside className="card">
          <h2 style={{ fontSize: 25 }}>Thông tin trực tiếp</h2>
          <p>Kết nối qua các kênh của đội ngũ.</p>
          {[
            {
              icon: Phone,
              label: "ĐIỆN THOẠI",
              value: "0358 341 830",
              href: "tel:0358341830",
            },
            {
              icon: Mail,
              label: "EMAIL",
              value: "tranhtrap.boardgame@gmail.com",
              href: "mailto:tranhtrap.boardgame@gmail.com",
            },
            {
              icon: MapPin,
              label: "KHỞI NGUỒN SÁNG TẠO",
              value: "Hòa Lạc, Hà Nội",
              href: "#loi-nhan",
            },
          ].map((x) => (
            <a className="contact-item" key={x.label} href={x.href}>
              <span className="icon white">
                <x.icon size={21} />
              </span>
              <div>
                <small>{x.label}</small>
                <strong style={{ fontSize: 13, overflowWrap: "anywhere" }}>
                  {x.value}
                </strong>
              </div>
            </a>
          ))}
          <div className="contact-item" style={{ background: "#eeeffb" }}>
            <p style={{ fontSize: 12, margin: 0 }}>
              Kênh Facebook và TikTok chính thức đang được cập nhật. Bạn có thể
              liên hệ trực tiếp qua email hoặc số điện thoại bên trên.
            </p>
          </div>
        </aside>
        <section className="card" id="loi-nhan">
          <h2 style={{ fontSize: 29 }}>Gửi lời nhắn cho chúng tôi</h2>
          <p>Chúng tôi sẽ phản hồi qua email bạn cung cấp.</p>
          {success ? (
            <div className="success-box">
              <CheckCircle2 size={30} />
              <h3>Lời nhắn đã được tiếp nhận</h3>
              <p>Cảm ơn bạn đã kết nối cùng Tránh Trap.</p>
              <button onClick={() => setSuccess(false)}>
                Gửi lời nhắn khác →
              </button>
            </div>
          ) : (
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const f = Object.fromEntries(new FormData(e.currentTarget));
                setBusy(true);
                setError(undefined);
                void api("/tickets", "POST", {
                  ...f,
                  type: "contact",
                  orderCode: "",
                })
                  .then(() => setSuccess(true))
                  .catch(setError)
                  .finally(() => setBusy(false));
              }}
            >
              <label>
                Họ và tên *
                <input
                  name="name"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Ví dụ: Nguyễn Văn An"
                />
              </label>
              <label>
                Email liên hệ *
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                />
              </label>
              <label>
                Chủ đề trao đổi *
                <select name="subject">
                  <option>Mua bộ trò chơi</option>
                  <option>Hướng dẫn cách chơi</option>
                  <option>Hợp tác giáo dục</option>
                  <option>Nội dung khác</option>
                </select>
              </label>
              <label>
                Nội dung lời nhắn *
                <textarea
                  name="text"
                  required
                  minLength={10}
                  maxLength={4000}
                  placeholder="Mô tả câu hỏi hoặc ý tưởng bạn muốn trao đổi…"
                />
              </label>
              <label style={{ fontSize: 12 }}>
                <input type="checkbox" required />
                Tôi đồng ý cho Tránh Trap dùng thông tin để phản hồi theo{" "}
                <Link to="/chinh-sach/bao-mat">Chính sách bảo mật</Link>.
              </label>
              {Boolean(error) && <ErrorBox error={error} />}
              <button
                className="button coral"
                style={{ justifySelf: "start" }}
                disabled={busy}
              >
                {busy ? "Đang gửi…" : "Gửi lời nhắn"}
                <Mail size={17} />
              </button>
            </form>
          )}
        </section>
      </div>
      <section className="section">
        <SectionTitle tag="Bắt đầu từ đây" title="Bạn có thể đang cần" />
        <div className="grid three">
          {[
            {
              to: "/san-pham",
              icon: ShieldCheck,
              title: "Xem bộ trò chơi Tránh Trap",
              text: "Tìm hiểu thông tin sản phẩm và mua ngay trên website.",
            },
            {
              to: "/huong-dan",
              icon: BookOpen,
              title: "Tìm hiểu cách chơi",
              text: "Quan sát tình huống, thảo luận dấu hiệu và cân nhắc lựa chọn.",
            },
            {
              to: "/cam-nang",
              icon: Lightbulb,
              title: "Khám phá Cẩm nang số",
              text: "Bình tĩnh trước các cạm bẫy trực tuyến.",
            },
          ].map((x) => (
            <article className="card" key={x.to}>
              <span className="icon yellow">
                <x.icon />
              </span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <ButtonLink to={x.to} secondary>
                Tìm hiểu thêm
              </ButtonLink>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const policyMenu = [
  ["mua-hang", "Mua hàng & Thanh toán"],
  ["giao-hang", "Chính sách giao hàng"],
  ["doi-tra", "Bảo hành & Đổi trả"],
  ["bao-mat", "Chính sách bảo mật"],
  ["dieu-khoan", "Điều khoản sử dụng"],
  ["faq", "Câu hỏi thường gặp"],
];
const policyContent: Record<
  string,
  { title: string; sections: { title: string; body: string }[] }
> = {
  "mua-hang": {
    title: "Mua hàng & Thanh toán",
    sections: [
      {
        title: "Đặt mua trực tiếp",
        body: "Chọn Bộ trò chơi, điều chỉnh số lượng và thêm vào giỏ hàng. Điền họ tên, email, số điện thoại, tỉnh/thành phố và địa chỉ nhận hàng. Bạn không cần đăng nhập để mua sản phẩm.",
      },
      {
        title: "Giá và tổng thanh toán",
        body: "Giá sản phẩm hiển thị bằng VND. Tổng thanh toán gồm tiền sản phẩm và phí vận chuyển theo tỉnh/thành nhận hàng. Tổng tiền được hiển thị trước khi xác nhận đơn và được lưu cùng đơn hàng.",
      },
      {
        title: "Phương thức thanh toán",
        body: "Bạn có thể thanh toán khi nhận hàng (COD). Thanh toán chuyển khoản/QR qua PayOS được hiển thị khi kênh thanh toán sẵn sàng. Chỉ thanh toán theo liên kết gắn với đơn hàng trên website; không cung cấp mã OTP hoặc mật khẩu ngân hàng cho bất kỳ ai.",
      },
      {
        title: "Xác nhận và theo dõi",
        body: "Sau khi đặt thành công, website cung cấp mã đơn. Lưu mã đơn và dùng số điện thoại nhận hàng để tra cứu. Khách đã đăng nhập có thể xem đơn trong Trung tâm tài khoản.",
      },
    ],
  },
  "giao-hang": {
    title: "Chính sách giao hàng",
    sections: [
      {
        title: "Phạm vi và địa chỉ",
        body: "Tránh Trap tiếp nhận đơn giao hàng tới các tỉnh/thành Việt Nam. Vui lòng cung cấp địa chỉ cụ thể đến số nhà, đường, phường/xã và tỉnh/thành phố, cùng số điện thoại có thể liên lạc.",
      },
      {
        title: "Phí vận chuyển",
        body: "Phí mặc định là 25.000đ/đơn. Nếu tỉnh/thành nhận hàng có mức phí riêng, website tự áp dụng mức phí được cấu hình cho địa phương đó. Phí vận chuyển được hiển thị tại bước đặt hàng và không thay đổi theo các cập nhật cấu hình sau khi đơn đã tạo.",
      },
      {
        title: "Thời gian và theo dõi",
        body: "Nhân viên xác nhận đơn và bàn giao cho đơn vị vận chuyển. Thời gian giao dự kiến phụ thuộc địa chỉ và đơn vị giao nhận; bạn có thể liên hệ để biết thông tin của đơn cụ thể. Khi có mã vận đơn, thông tin sẽ xuất hiện trong trang tra cứu.",
      },
      {
        title: "Kiểm tra khi nhận hàng",
        body: "Vui lòng kiểm tra tình trạng bên ngoài kiện hàng, thông tin người nhận và số lượng. Nếu kiện hàng có dấu hiệu hư hại, ghi nhận hình ảnh và liên hệ Tránh Trap để được hỗ trợ.",
      },
    ],
  },
  "doi-tra": {
    title: "Bảo hành & Đổi trả",
    sections: [
      {
        title: "Khi sản phẩm có vấn đề",
        body: "Nếu bộ trò chơi bị thiếu thành phần, hư hại do sản xuất hoặc giao sai sản phẩm, vui lòng gửi yêu cầu hỗ trợ kèm mã đơn và mô tả cụ thể. Giữ lại sản phẩm, phụ kiện và bao bì trong quá trình xử lý.",
      },
      {
        title: "Gửi yêu cầu",
        body: "Khách có tài khoản có thể tạo yêu cầu tại Hỗ trợ & Khiếu nại và theo dõi phản hồi trực tiếp. Khách mua không đăng nhập vui lòng dùng trang Liên hệ, cung cấp mã đơn và số điện thoại nhận hàng.",
      },
      {
        title: "Quy trình xử lý",
        body: "Đội ngũ kiểm tra thông tin, liên hệ xác minh và trao đổi phương án phù hợp với từng trường hợp. Không tự gửi trả sản phẩm khi chưa thống nhất địa chỉ và cách giao nhận với nhân viên.",
      },
      {
        title: "Thanh toán và hoàn tiền",
        body: "Yêu cầu liên quan đến khoản đã thanh toán được nhân viên xử lý sau khi xác minh. Website không tự động hoàn tiền từ thao tác hủy đơn. Bạn sẽ nhận thông tin cụ thể về phương án và tiến trình xử lý qua kênh hỗ trợ.",
      },
    ],
  },
  "bao-mat": {
    title: "Chính sách bảo mật",
    sections: [
      {
        title: "Thông tin được thu thập",
        body: "Khi bạn tạo tài khoản, đặt hàng hoặc gửi yêu cầu, website nhận những thông tin bạn cung cấp như tên, email, điện thoại và địa chỉ giao hàng.",
      },
      {
        title: "Mục đích sử dụng",
        body: "Thông tin phục vụ xác thực tài khoản, xử lý và giao đơn hàng, gửi cập nhật và hỗ trợ khách hàng. Dữ liệu giao nhận cần thiết được chia sẻ với đơn vị vận chuyển và nhà cung cấp thanh toán để thực hiện đơn hàng.",
      },
      {
        title: "Bảo vệ tài khoản",
        body: "Mật khẩu được lưu dưới dạng băm, không hiển thị cho nhân viên hoặc quản trị viên. Phiên đăng nhập sử dụng cookie HttpOnly. Bạn có thể đổi mật khẩu và chỉnh sửa hồ sơ trong trung tâm tài khoản.",
      },
      {
        title: "Trợ lý AI",
        body: "Câu hỏi gửi cho trợ lý được chuyển tới dịch vụ Gemini để tạo câu trả lời. Không gửi mật khẩu, OTP, thông tin ngân hàng hay dữ liệu nhạy cảm vào khung chat. Khi cần hỗ trợ riêng cho đơn hàng, hãy kết nối nhân viên.",
      },
      {
        title: "Quyền và liên hệ",
        body: "Bạn có thể chỉnh sửa thông tin tài khoản hoặc gửi yêu cầu liên quan đến dữ liệu cá nhân tới tranhtrap.boardgame@gmail.com. Đội ngũ sẽ xác minh yêu cầu trước khi xử lý.",
      },
    ],
  },
  "dieu-khoan": {
    title: "Điều khoản sử dụng",
    sections: [
      {
        title: "Sử dụng website",
        body: "Vui lòng cung cấp thông tin chính xác khi đăng ký, đặt hàng hoặc liên hệ. Không sử dụng website để giả mạo, quấy rối, truy cập trái phép hoặc gây ảnh hưởng đến hoạt động hệ thống.",
      },
      {
        title: "Nội dung giáo dục",
        body: "Tài nguyên an toàn số phục vụ mục đích học tập và thảo luận. Trong tình huống thực tế, hãy dừng tương tác đáng ngờ, xác minh qua kênh chính thức và nhờ người đáng tin cậy hỗ trợ.",
      },
      {
        title: "Nội dung sản phẩm",
        body: "Logo, hình ảnh và nội dung bộ trò chơi thuộc chủ thể quyền tương ứng. Nội dung mặt ngửa lá bài không được công khai trên website. Không sao chép hoặc phát tán nội dung khi chưa có sự cho phép phù hợp.",
      },
      {
        title: "Hỗ trợ và thay đổi",
        body: "Liên hệ Tránh Trap khi gặp khó khăn. Thông tin website có thể được cập nhật; giá và phí ghi nhận trong đơn được giữ để xử lý đơn tương ứng.",
      },
    ],
  },
};
const faqs = [
  [
    "Có cần tài khoản để mua không?",
    "Không. Bạn có thể thêm sản phẩm vào giỏ và đặt mua trực tiếp. Hãy lưu mã đơn để tra cứu cùng số điện thoại nhận hàng.",
  ],
  [
    "Bộ trò chơi có giá bao nhiêu?",
    "Giá hiện tại hiển thị trên trang Bộ trò chơi. Giá bán khởi tạo là 399.000đ/bộ; tổng tiền gồm phí vận chuyển hiển thị ở bước thanh toán.",
  ],
  [
    "Phí giao hàng được tính thế nào?",
    "Phí được xác định theo tỉnh/thành phố nhận hàng. Nếu chưa có cấu hình riêng, mức phí là 25.000đ/đơn.",
  ],
  [
    "Làm sao để theo dõi đơn hàng?",
    "Vào Tra cứu đơn hàng ở footer, nhập mã đơn và số điện thoại nhận hàng. Người mua đăng nhập có thể xem trong mục Đơn hàng.",
  ],
  [
    "Làm thế nào để gặp nhân viên hỗ trợ?",
    "Trong khung chat, chọn Gặp nhân viên hoặc gửi yêu cầu trong Hỗ trợ & Khiếu nại. Bạn cũng có thể dùng trang Liên hệ.",
  ],
  [
    "Tôi có thể xem lá bài trước khi mua không?",
    "Website chỉ hiển thị mặt sau lá bài và thông tin tổng quan để giữ nguyên trải nghiệm khám phá.",
  ],
];
export function PolicyPage() {
  const { slug = "faq" } = useParams();
  const content = policyContent[slug];
  return (
    <div className="container page">
      <div className="page-heading">
        <Tag tone="mint">Hỗ trợ & Hướng dẫn</Tag>
        <h1>
          {slug === "faq"
            ? "Câu hỏi thường gặp"
            : (content?.title ?? "Thông tin hỗ trợ")}
        </h1>
      </div>
      <div className="legal-layout">
        <nav className="card legal-nav">
          {policyMenu.map(([s, t]) => (
            <NavLink key={s} to={`/chinh-sach/${s}`}>
              {t}
            </NavLink>
          ))}
        </nav>
        <article className="card legal-content">
          {slug === "faq" ? (
            <div className="faq">
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          ) : content ? (
            content.sections.map((s) => (
              <section key={s.title}>
                <h2>{s.title}</h2>
                <p>{s.body}</p>
              </section>
            ))
          ) : (
            <Empty title="Chưa có trang chính sách này" />
          )}
          <div className="contact-item">
            <Mail size={20} />
            <p style={{ margin: 0, fontSize: 13 }}>
              Cần giải đáp thêm?{" "}
              <Link to="/lien-he">Kết nối với Tránh Trap →</Link>
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
export function GuidePage() {
  return (
    <div className="container page">
      <section className="public-hero">
        <div>
          <Tag tone="blue">Hướng dẫn trải nghiệm</Tag>
          <h1>Một bàn chơi, nhiều góc nhìn.</h1>
          <p>
            Chuẩn bị một không gian thoải mái và cùng bắt đầu cuộc trò chuyện về
            an toàn số.
          </p>
          <ButtonLink to="/san-pham">Khám phá bộ trò chơi</ButtonLink>
        </div>
        <img
          src="/images/product.webp"
          alt="Bộ Tránh Trap"
          style={{ borderRadius: 25 }}
        />
      </section>
      <div className="grid three">
        {[
          {
            title: "Quan sát tình huống",
            text: "Cùng đọc ngữ cảnh và chú ý những thông tin có thể gây nghi ngờ.",
            icon: Search,
          },
          {
            title: "Thảo luận dấu hiệu",
            text: "Lắng nghe góc nhìn của từng người. Vì sao một chi tiết đáng ngờ? Còn điều gì cần xác minh?",
            icon: Flag,
          },
          {
            title: "Cân nhắc lựa chọn",
            text: "Trao đổi phương án và cùng nhìn lại bài học. Ưu tiên dừng lại, kiểm chứng và hỏi người đáng tin cậy.",
            icon: CheckCircle2,
          },
        ].map((x, i) => (
          <article className="card" key={x.title}>
            <span className="icon yellow">
              <x.icon />
            </span>
            <h3>
              0{i + 1}. {x.title}
            </h3>
            <p>{x.text}</p>
          </article>
        ))}
      </div>
      <section className="section">
        <div className="mascot-callout">
          <img src="/images/detective.webp" alt="Sóc Thám Tử" />
          <div>
            <h2>Mỗi câu hỏi là một bước tự bảo vệ.</h2>
            <p>
              Phần trên giới thiệu cách tiếp cận học qua thảo luận. Luật chi
              tiết về chia thẻ, thứ tự lượt và chấm điểm cần theo cẩm nang chính
              thức đi kèm hộp trò chơi.
            </p>
            <Link to="/lien-he">Liên hệ để được hướng dẫn chi tiết →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const articles = [
  {
    slug: "link-gia-mao",
    category: "Link & Website giả mạo",
    title: "Dừng một nhịp trước khi nhấp vào đường link",
    intro: "Một tin nhắn quen thuộc chưa chắc đã đến từ người quen.",
    sign: "Tên miền có lỗi chính tả, lời thúc giục xác minh ngay, hoặc trang yêu cầu mật khẩu và OTP.",
    action:
      "Không mở link chưa xác minh. Tự truy cập ứng dụng hoặc website chính thức. Nhờ người lớn đáng tin cậy kiểm tra cùng.",
  },
  {
    slug: "qua-tang",
    category: "Quà tặng & Trúng thưởng",
    title: "Quà tặng có thật sự miễn phí?",
    intro:
      "Lời mời nhận quà có thể đi cùng yêu cầu chuyển tiền hoặc gửi mã xác thực.",
    sign: "Bạn không tham gia nhưng được báo trúng thưởng; phải nộp tiền trước để nhận quà.",
    action:
      "Không chuyển phí, không gửi OTP. Xác minh chương trình từ kênh chính thức và trao đổi với gia đình.",
  },
  {
    slug: "mao-danh",
    category: "Mạo danh người quen",
    title: "Khi người quen nhắn mượn tiền gấp",
    intro: "Tài khoản có ảnh và tên quen thuộc cũng có thể bị chiếm quyền.",
    sign: "Từ chối gọi điện, gây áp lực chuyển tiền ngay, đổi sang tài khoản ngân hàng không quen.",
    action:
      "Gọi qua số đã biết để xác minh. Không chỉ tin ảnh đại diện hoặc giọng nói.",
  },
  {
    slug: "otp",
    category: "Bảo vệ tài khoản",
    title: "OTP là chìa khóa riêng của bạn",
    intro: "Giữ mật khẩu và mã OTP cho riêng mình.",
    sign: "Người tự nhận là nhân viên hỗ trợ yêu cầu đọc hoặc gửi mã xác thực.",
    action:
      "Không gửi mã xác thực. Kết thúc cuộc trò chuyện và tự liên hệ kênh hỗ trợ chính thức.",
  },
  {
    slug: "viec-nhe",
    category: "Việc nhẹ lương cao",
    title: "Cẩn thận nhiệm vụ nhận hoa hồng",
    intro:
      "Nhiệm vụ dễ với thu nhập cao có thể dẫn đến yêu cầu nạp tiền tăng dần.",
    sign: "Phải nộp tiền trước, nhận khoản nhỏ rồi bị thúc ép nạp thêm để rút tiền.",
    action:
      "Không nạp thêm để “gỡ” tiền. Lưu bằng chứng và nhờ người đáng tin cậy hỗ trợ.",
  },
  {
    slug: "de-doa",
    category: "Giả danh & Đe dọa",
    title: "Bình tĩnh trước cuộc gọi gây sợ hãi",
    intro: "Sợ hãi và áp lực có thể khiến chúng ta bỏ qua bước xác minh.",
    sign: "Người gọi tự xưng cơ quan chức năng, đe dọa và yêu cầu giữ bí mật hoặc chuyển tiền ngay.",
    action:
      "Dừng cuộc gọi. Không chuyển tiền hay cài ứng dụng lạ. Trao đổi với gia đình và xác minh qua kênh chính thức.",
  },
];
export function HandbookPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const items = articles.filter(
    (a) =>
      (category === "all" || a.category === category) &&
      `${a.title} ${a.intro}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="container page">
      <div className="page-heading">
        <Tag tone="mint">Kiến thức để cùng tự bảo vệ</Tag>
        <h1>Cẩm nang an toàn số</h1>
        <p>Cùng quan sát, bình tĩnh xác minh và lựa chọn cách ứng phó.</p>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Bạn muốn tìm hiểu điều gì?"
        aria-label="Tìm cẩm nang"
      />
      <div className="filters">
        {["all", ...articles.map((a) => a.category)].map((c) => (
          <button
            key={c}
            className={c === category ? "active" : ""}
            onClick={() => setCategory(c)}
          >
            {c === "all" ? "Tất cả" : c}
          </button>
        ))}
      </div>
      <div className="grid three">
        {items.map((a, i) => (
          <article className="card resource-card" key={a.slug}>
            <span className={`icon ${["blue", "yellow", "mint"][i % 3]}`}>
              <BookOpen />
            </span>
            <Tag tone="white">{a.category}</Tag>
            <h3>{a.title}</h3>
            <p>{a.intro}</p>
            <ButtonLink to={`/cam-nang/${a.slug}`} secondary>
              Đọc bài viết
            </ButtonLink>
          </article>
        ))}
      </div>
      {!items.length && <Empty title="Chưa có bài viết phù hợp" />}
    </div>
  );
}
export function ArticlePage() {
  const { slug } = useParams();
  const a = articles.find((x) => x.slug === slug);
  if (!a)
    return (
      <div className="container page">
        <Empty title="Không tìm thấy bài viết" />
      </div>
    );
  return (
    <div className="container page" style={{ maxWidth: 850 }}>
      <article className="card legal-content">
        <Tag tone="blue">{a.category}</Tag>
        <h1 style={{ fontSize: 34, marginTop: 20 }}>{a.title}</h1>
        <p>{a.intro}</p>
        <h2>Dấu hiệu cần chú ý</h2>
        <div className="quote">{a.sign}</div>
        <h2>Bạn có thể làm gì?</h2>
        <p>{a.action}</p>
        <div className="mascot-callout">
          <img src="/images/curious.webp" alt="Sóc Thám Tử" />
          <p style={{ margin: 0 }}>
            Bạn có thể kể lại với người mình tin tưởng khi có điều khiến bạn lo
            lắng.
          </p>
        </div>
        <div className="actions" style={{ marginTop: 30 }}>
          <ButtonLink to="/dung-trap">Thử luyện tập</ButtonLink>
          <ButtonLink to="/lien-he" secondary>
            Gửi câu hỏi
          </ButtonLink>
        </div>
      </article>
    </div>
  );
}
export function VideoLibraryPage() {
  return (
    <div className="container page">
      <div className="page-heading">
        <Tag tone="blue">Trải nghiệm trực quan</Tag>
        <h1>Thư viện Video AI</h1>
        <p>Tình huống mô phỏng để cùng quan sát và trao đổi về an toàn số.</p>
      </div>
      <div className="card">
        <Empty title="Video đang được chuẩn bị">
          <p>Đội ngũ sẽ đăng video sau khi hoàn tất biên tập và kiểm duyệt.</p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <ButtonLink to="/cam-nang">Khám phá cẩm nang</ButtonLink>
            <ButtonLink to="/dung-trap" secondary>
              Luyện tập tình huống
            </ButtonLink>
          </div>
        </Empty>
      </div>
    </div>
  );
}
const scenarios = [
  {
    text: "Tin nhắn báo: “Tài khoản bị khóa sau 5 phút, đăng nhập ngay tại bank-xacminh.example”.",
    risky: true,
    explain:
      "Áp lực thời gian và tên miền lạ là dấu hiệu cần dừng lại. Tự mở ứng dụng chính thức để kiểm tra.",
  },
  {
    text: "Người lạ tự xưng công an yêu cầu chuyển tiền và không kể với gia đình.",
    risky: true,
    explain:
      "Đe dọa, chuyển tiền và giữ bí mật là dấu hiệu đáng ngờ. Dừng cuộc gọi và tìm người tin cậy hỗ trợ.",
  },
  {
    text: "Bạn mở ứng dụng học tập đã cài và trao đổi lịch học qua nhóm lớp quen thuộc.",
    risky: false,
    explain:
      "Chưa có dấu hiệu bất thường trong mô tả. Vẫn cần kiểm tra nếu xuất hiện yêu cầu lạ.",
  },
  {
    text: "Người lạ hứa tặng vật phẩm game nếu bạn gửi mật khẩu và mã OTP.",
    risky: true,
    explain: "Không trao mật khẩu và OTP để nhận quà.",
  },
  {
    text: "Người bạn nhắn mượn tiền gấp, từ chối gọi và đưa tài khoản ngân hàng lạ.",
    risky: true,
    explain:
      "Gọi qua số đã biết để xác minh. Tên và ảnh đại diện không đủ chứng minh danh tính.",
  },
  {
    text: "Bạn dùng số điện thoại đã lưu của mẹ để xác nhận một tin nhắn nhờ chuyển tiền.",
    risky: false,
    explain: "Chủ động xác minh qua kênh đã biết là một lựa chọn an toàn.",
  },
  {
    text: "Trang báo trúng quà dù bạn chưa tham gia, yêu cầu nộp phí trước.",
    risky: true,
    explain:
      "Trúng thưởng không rõ nguồn và trả tiền trước cần được kiểm chứng.",
  },
  {
    text: "Người tuyển cộng tác viên yêu cầu nạp thêm tiền để rút hoa hồng.",
    risky: true,
    explain:
      "Không nạp thêm để mở khóa hoặc gỡ vốn. Lưu bằng chứng và tìm hỗ trợ.",
  },
  {
    text: "Thấy link lạ trong nhóm lớp, bạn hỏi giáo viên qua kênh liên lạc quen thuộc.",
    risky: false,
    explain: "Dừng tương tác và xác minh là thói quen tự bảo vệ.",
  },
  {
    text: "Người tự xưng hỗ trợ yêu cầu cài ứng dụng lạ và chia sẻ màn hình ngân hàng.",
    risky: true,
    explain:
      "Không cài ứng dụng theo yêu cầu chưa xác minh hoặc chia sẻ thông tin tài chính.",
  },
];
export function ChallengePage() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const s = scenarios[index];
  const correct = answer === s.risky;
  return (
    <div className="container page" style={{ maxWidth: 900 }}>
      {!started ? (
        <section className="public-hero">
          <div>
            <Tag tone="coral">Luyện tập tình huống</Tag>
            <h1>Dừng một nhịp. Nhận diện một “trap”.</h1>
            <p>Thử 10 tình huống ngắn và cùng tìm hiểu cách tự bảo vệ.</p>
            <small className="muted">
              Phiên bản văn bản. Thử thách phản xạ video sẽ được bổ sung khi có
              nội dung đã kiểm duyệt.
            </small>
            <div style={{ marginTop: 25 }}>
              <button className="button" onClick={() => setStarted(true)}>
                Bắt đầu luyện tập →
              </button>
            </div>
          </div>
          <img src="/images/detective.webp" alt="Sóc Thám Tử" />
        </section>
      ) : done ? (
        <div className="card" style={{ textAlign: "center" }}>
          <img
            src="/images/happy.webp"
            alt="Sóc Thám Tử"
            style={{ height: 150, margin: "0 auto" }}
          />
          <h1 style={{ fontSize: 32, marginTop: 20 }}>Bạn đã hoàn thành!</h1>
          <p>
            Nhận diện phù hợp {score}/{scenarios.length} tình huống. Mỗi lần
            luyện tập là một cơ hội hiểu thêm.
          </p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <button
              className="button"
              onClick={() => {
                setIndex(0);
                setScore(0);
                setAnswer(null);
                setDone(false);
              }}
            >
              Chơi lại
            </button>
            <ButtonLink to="/cam-nang" secondary>
              Khám phá cẩm nang
            </ButtonLink>
          </div>
          <div className="quote" style={{ marginTop: 30 }}>
            Cùng ba mẹ trao đổi: Điều gì khiến con nghi ngờ? Con sẽ kiểm chứng
            thế nào? Con có thể nhờ ai?
          </div>
        </div>
      ) : (
        <div className="card">
          <Tag tone="blue">
            Tình huống {index + 1} / {scenarios.length}
          </Tag>
          <h2 style={{ fontSize: 28, margin: "35px 0" }}>{s.text}</h2>
          {answer === null ? (
            <div className="actions">
              <button className="button coral" onClick={() => setAnswer(true)}>
                <Flag size={18} />
                Có dấu hiệu đáng ngờ
              </button>
              <button
                className="button secondary"
                onClick={() => setAnswer(false)}
              >
                Chưa thấy dấu hiệu
              </button>
            </div>
          ) : (
            <>
              <div className={correct ? "success-box" : "quote"}>
                <strong>
                  {correct
                    ? "Bạn đã quan sát phù hợp!"
                    : "Cùng nhìn lại một chút nhé."}
                </strong>
                <p style={{ color: "inherit", margin: "12px 0 0" }}>
                  {s.explain}
                </p>
              </div>
              <button
                className="button"
                style={{ marginTop: 25 }}
                onClick={() => {
                  if (correct) setScore(score + 1);
                  if (index === scenarios.length - 1) setDone(true);
                  else {
                    setIndex(index + 1);
                    setAnswer(null);
                  }
                }}
              >
                {index === scenarios.length - 1
                  ? "Xem kết quả"
                  : "Tình huống tiếp theo"}{" "}
                →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
