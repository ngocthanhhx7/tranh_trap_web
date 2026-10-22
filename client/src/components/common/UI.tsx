import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus } from "lucide-react";
export function ButtonLink({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} to={to}>
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
export function Tag({
  children,
  tone = "yellow",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`tag ${tone}`}>
      <span className="dot" />
      {children}
    </span>
  );
}
export function SectionTitle({
  tag,
  title,
  text,
  center = false,
}: {
  tag: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={`section-title ${center ? "center" : ""}`}>
      <div>
        <Tag>{tag}</Tag>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  );
}
export function Quantity({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="quantity">
      <button
        aria-label="Giảm số lượng"
        type="button"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button
        aria-label="Tăng số lượng"
        type="button"
        disabled={value >= 10}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export function ErrorBox({ error }: { error: unknown }) {
  return (
    <p role="alert" className="error-box">
      {error instanceof Error
        ? error.message
        : "Không thể tải dữ liệu. Vui lòng thử lại."}
    </p>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <img src="/images/curious.webp" alt="Sóc Thám Tử" />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function LoadMore({
  query,
}: {
  query: {
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
    fetchNextPage: () => Promise<unknown>;
  };
}) {
  return query.hasNextPage ? (
    <div className="load-more">
      <button
        className="button secondary"
        disabled={query.isFetchingNextPage}
        onClick={() => void query.fetchNextPage()}
      >
        {query.isFetchingNextPage ? "Đang tải thêm…" : "Xem thêm"}
      </button>
    </div>
  ) : null;
}
