import { useIsFetching } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigation } from "react-router-dom";

export function PageLoader({
  message = "Đang chuẩn bị trải nghiệm…",
}: {
  message?: string;
}) {
  return (
    <main className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-emblem" aria-hidden="true">
        <span className="page-loader-orbit" />
        <img src="/images/figma/home-4.png" alt="" draggable={false} />
      </div>
      <p>{message}</p>
      <span className="page-loader-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </main>
  );
}

export function PageMotion() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  // Background refetches should not interrupt the page the user is reading.
  const pending = useIsFetching({
    predicate: (query) => query.state.status === "pending",
  });
  const busy = navigation.state !== "idle" || pending > 0;
  return (
    <>
      <div
        key={`progress:${pathname}`}
        className={`page-progress${busy ? " is-loading" : ""}`}
        aria-hidden="true"
      >
        <span />
      </div>
      <div key={pathname} className="page-enter">
        <Outlet />
      </div>
    </>
  );
}
