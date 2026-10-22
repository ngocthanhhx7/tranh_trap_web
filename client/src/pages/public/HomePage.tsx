import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SectionTitle, Tag } from "../../components/common/UI";
import { useCatalog } from "../../services/shop";
function DesignIcon({ asset }: { asset: number }) {
  return (
    <img
      className="design-icon"
      src={`/images/figma/home-${asset}.svg`}
      alt=""
    />
  );
}
function ButtonLink({
  to,
  children,
  secondary = false,
  icon = 9,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
  icon?: number;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} to={to}>
      {children}
      <DesignIcon asset={icon} />
    </Link>
  );
}
export function HomePage() {
  const { data } = useCatalog();
  const product = data?.product;
  return (
    <>
      <div className="container home-intro">
        <section className="hero">
          <div className="hero-content">
            <Tag>Board game giáo dục</Tag>
            <h1>
              Chơi thông minh
              <br />
              <em>Tránh mọi cái bẫy trên không gian số</em>
            </h1>
            <p>
              Trò chơi nâng cao kỹ năng tự bảo vệ trên môi trường số qua những
              tình huống gần gũi, thú vị.
            </p>
            <ul>
              <li>
                <DesignIcon asset={6} />
                Học qua trò chơi
              </li>
              <li>
                <DesignIcon asset={7} />
                Rèn kỹ năng an toàn số
              </li>
              <li>
                <DesignIcon asset={8} />
                Phù hợp lứa tuổi
              </li>
            </ul>
            <ButtonLink to="/san-pham">Khám phá sản phẩm</ButtonLink>
          </div>
        </section>
        <section className="benefits">
          <div>
            <span className="icon coral">
              <DesignIcon asset={10} />
            </span>
            <div>
              <strong>{product?.players ?? "2–4 người"} chơi</strong>
              <small>Từ trò chơi nhóm bạn & từng gia đình</small>
            </div>
          </div>
          <div>
            <span className="icon yellow">
              <DesignIcon asset={11} />
            </span>
            <div>
              <strong>Khoảng {product?.duration ?? "20–30 phút"}</strong>
              <small>Nhẹ gọn mỗi ván, chắc hơn từng lựa chọn</small>
            </div>
          </div>
          <div>
            <span className="icon mint">
              <DesignIcon asset={12} />
            </span>
            <div>
              <strong>Học từ tình huống</strong>
              <small>Không lý thuyết suông, tương tác thực tế</small>
            </div>
          </div>
        </section>
      </div>
      <section className="section container">
        <SectionTitle
          tag="Giá trị cốt lõi"
          title="Một trò chơi, nhiều cơ hội để cùng hiểu"
          text="Được thiết kế dựa trên các nghiên cứu tâm lý lứa tuổi và các kịch bản lừa đảo số thực tế thường gặp tại Việt Nam."
        />
        <div className="grid three">
          {[
            {
              icon: 13,
              tone: "yellow",
              title: "Nhận diện dấu hiệu",
              text: "Giúp các bạn trẻ rèn luyện phản xạ phát hiện bất thường và các cạm bẫy trực tuyến như mạo danh, link lạ, hay áp lực tâm lý từ người lạ.",
              foot: "Rèn luyện trực giác số",
            },
            {
              icon: 15,
              tone: "blue",
              title: "Cùng nhau thảo luận",
              text: "Cầu nối trò chuyện cởi mở giữa con cái, phụ huynh và thầy cô về các tình huống khó nói trên mạng trong không khí thoải mái, không phán xét.",
              foot: "Gắn kết thế hệ",
            },
            {
              icon: 17,
              tone: "coral",
              title: "Cân nhắc cách xử lý",
              text: "Đưa ra các phương án hành động thông minh, đúng lúc, đúng chỗ để tự bảo vệ bản thân và bạn bè.",
              foot: "Kỹ năng tự vệ chủ động",
            },
          ].map((x, i) => (
            <article className="card value-card" key={x.title}>
              <span className={`icon ${x.tone}`}>
                <DesignIcon asset={x.icon} />
              </span>
              <small className="overline">LỢI ÍCH 0{i + 1}</small>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <div className="card-foot">
                {x.foot}
                <DesignIcon asset={[14, 16, 18][i]} />
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section warm">
        <div className="container product-overview">
          <div className="product-photo card">
            <span className="floating-label handwritten">
              Trọn bộ một cuộc chơi!
            </span>
            <img
              src="/images/figma/home-1.png"
              alt="Hộp Tránh Trap và các mặt sau thẻ bài"
              loading="lazy"
            />
            <div className="mini-stats">
              <div>
                <strong>60+</strong>
                <small>Thẻ tình huống</small>
              </div>
              <div>
                <strong>04</strong>
                <small>Bộ màu thẻ</small>
              </div>
              <div>
                <strong>01</strong>
                <small>Cẩm nang hướng dẫn</small>
              </div>
            </div>
          </div>
          <div>
            <Tag tone="coral">Khám phá chi tiết</Tag>
            <h2>Khám phá bộ Tránh Trap</h2>
            <p>
              Mỗi thành phần được thiết kế để kích thích sự tò mò, thảo luận tự
              nhiên và tạo tiếng cười sảng khoái trên bàn chơi.
            </p>
            <div className="component-list">
              {(
                product?.components.slice(0, 3) ?? [
                  {
                    name: "Thẻ Thanh Tra",
                    description:
                      "Nhập vai người phân tích, nắm giữ manh mối để đưa ra phán đoán.",
                  },
                  {
                    name: "Thẻ Dấu Hiệu",
                    description:
                      "Bóc tách những biểu hiện bất thường trong không gian số.",
                  },
                  {
                    name: "Thẻ Vụ Án",
                    description:
                      "Tái hiện các kịch bản cạm bẫy để cả nhóm cùng tìm giải pháp.",
                  },
                ]
              ).map((x, i) => {
                const icon = [19, 20, 21][i];
                return (
                  <article className="component" key={x.name}>
                    <span
                      className={`icon ${["yellow", "blue", "lavender"][i]}`}
                    >
                      <DesignIcon asset={icon} />
                    </span>
                    <div>
                      <h3>
                        {x.name}{" "}
                        <span
                          className={`tag ${["yellow", "blue", "lavender"][i]}`}
                        >
                          Mặt sau thẻ
                        </span>
                      </h3>
                      <p>{x.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
            <ButtonLink to="/san-pham">Xem bộ trò chơi</ButtonLink>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionTitle
          center
          tag="Chu trình học tập trải nghiệm"
          title="Cách tiếp cận trò chơi"
          text="Biến các bài học an toàn mạng tưởng chừng khô khan thành trải nghiệm gần gũi tự nhiên thông qua 3 bước cốt lõi."
        />
        <div className="grid three steps">
          {[
            {
              title: "Quan sát tình huống",
              text: "Đọc thẻ Vụ Án, xác nhận các chi tiết ngữ cảnh, bắt đầu nhận diện vấn đề trước khi quyết định có “trap” hay không.",
              icon: 23,
            },
            {
              title: "Thảo luận dấu hiệu",
              text: "Các người chơi đối chiếu thẻ Dấu Hiệu, chia sẻ quan điểm cá nhân, lập luận và phản biện để ra quyết định.",
              icon: 24,
            },
            {
              title: "Cân nhắc lựa chọn",
              text: "Bỏ phiếu hành động an toàn nhất, nhìn lại cách lựa chọn và cùng rút ra bài học để đối diện tình huống trên môi trường số.",
              icon: 25,
            },
          ].map((x, i) => (
            <article className="card" key={x.title}>
              <div className="step-head">
                <span className={`icon ${["yellow", "blue", "mint"][i]}`}>
                  {i + 1}
                </span>
                <DesignIcon asset={x.icon} />
              </div>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
        <Link className="video-feature card" to="/huong-dan">
          <div className="video-image">
            <img
              src="/images/figma/home-2.png"
              alt="Bộ Tránh Trap — tìm hiểu cách chơi"
              loading="lazy"
            />
            <span className="play-circle">
              <DesignIcon asset={26} />
            </span>
            <span className="video-caption">Tránh Trap · Luật Cơ Bản</span>
          </div>
          <div>
            <Tag>Tài liệu đang cập nhật bản video HD chính thức</Tag>
            <h2>Xem nhanh cách chơi trong 3 phút</h2>
            <p>
              Nắm vững luật chơi cơ bản, các vòng đấu và cách tính điểm kinh
              nghiệm số một cách trực quan, vui nhộn nhất.
            </p>
            <span className="button secondary">
              Xem chi tiết cách chơi <DesignIcon asset={28} />
            </span>
          </div>
        </Link>
      </section>
      <section className="section warm">
        <div className="container">
          <SectionTitle
            tag="Hệ sinh thái tương tác"
            title="Tiếp tục khám phá trên môi trường số"
            text="Không dừng lại ở bàn cờ vật lý, trải nghiệm số Tránh Trap đưa tình huống an toàn mạng vào các định dạng tương tác độc đáo."
          />
          <div className="grid three">
            {[
              {
                icon: 29,
                title: "Dừng Trap",
                label: "Tương tác tốt",
                tone: "coral",
                text: "Nhận diện dấu hiệu trong các tình huống video mô phỏng tương tác. Bình tĩnh dừng đúng lúc để biết bẫy và nhận phản hồi chi tiết.",
                to: "/dung-trap",
                cta: "Khám phá Dừng Trap",
              },
              {
                icon: 31,
                title: "Thư viện Video AI",
                label: "Thư viện mở",
                tone: "blue",
                text: "Xem các tình huống mô phỏng số đã được nhóm biên soạn và duyệt kỹ lưỡng, minh họa sinh động các chiêu trò lừa đảo tinh vi mới nhất.",
                to: "/thu-vien-video",
                cta: "Xem Thư viện Video",
              },
              {
                icon: 33,
                title: "Cẩm nang an toàn số",
                label: "Kiến thức chuẩn",
                tone: "mint",
                text: "Đọc kiến thức, mẹo bảo mật và hướng dẫn cho cha mẹ và học sinh. Bạn luôn có một người đồng hành để chủ động trước những cạm bẫy.",
                to: "/cam-nang",
                cta: "Đọc Cẩm nang ngay",
              },
            ].map((x) => (
              <article className="card ecosystem" key={x.title}>
                <div className="spread">
                  <span className={`icon ${x.tone}`}>
                    <DesignIcon asset={x.icon} />
                  </span>
                  <Tag tone={x.tone}>{x.label}</Tag>
                </div>
                <h3>{x.title}</h3>
                <p>{x.text}</p>
                <ButtonLink to={x.to} secondary>
                  {x.cta}
                </ButtonLink>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="story-banner">
          <div>
            <Tag tone="white">Hành trình Tránh Trap</Tag>
            <h2>Vì sao chúng tôi bắt đầu Tránh Trap?</h2>
            <p>
              Chúng tôi tin rằng an toàn số không nên bắt đầu bằng những lệnh
              cấm đoán hay những giờ thuyết giảng khô khan. Thanh thiếu niên
              xứng đáng có một công cụ giáo dục thân thiện, táo bạo và không
              giáo điều — nơi các em được quyền sai lầm trong ván cờ thử nghiệm
              để tự tin bước ra thế giới số thực thụ.
            </p>
            <ButtonLink to="/cau-chuyen" secondary>
              Đọc câu chuyện đầy đủ
            </ButtonLink>
            <div className="story-note">
              <strong>
                Khu vực dự kiến: Hình ảnh trải nghiệm và chia sẻ thực tế từ học
                sinh & trường học đang được tổng hợp!
              </strong>
              <small>
                Các hình ảnh học thực nghiệm tại Hà Nội và TP.HCM sẽ được cập
                nhật theo phản hồi cộng đồng sắp tới.
              </small>
            </div>
          </div>
        </div>
        <div className="home-cta">
          <div>
            <Tag tone="blue">Hành động ngay hôm nay</Tag>
            <h2>Cùng bắt đầu một cuộc trò chuyện về an toàn số.</h2>
            <p>
              Trang bị kỹ năng số thông minh cho con em và học sinh của bạn với
              bộ công cụ vừa học vừa chơi độc đáo.
            </p>
          </div>
          <div className="actions">
            <ButtonLink to="/san-pham">
              <DesignIcon asset={37} />
              Đặt mua ngay
            </ButtonLink>
            <ButtonLink to="/dung-trap" secondary>
              Khám phá Dừng Trap
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
