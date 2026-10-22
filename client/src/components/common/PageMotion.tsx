import { useIsFetching } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

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
  const content = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(content.current, {
          opacity: 0.2,
          y: 10,
          duration: 0.38,
          ease: "power2.out",
          clearProps: "all",
        });
        const intro = content.current?.querySelectorAll(
          ".hero-content > *, .public-hero > div > *",
        );
        if (intro?.length)
          gsap.from(intro, {
            opacity: 0,
            y: 15,
            stagger: 0.065,
            duration: 0.5,
            ease: "power2.out",
            clearProps: "all",
          });
      });
      return () => media.revert();
    },
    { scope: content, dependencies: [pathname], revertOnUpdate: true },
  );
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
      <div ref={content} key={pathname} className="page-enter">
        <Outlet />
      </div>
    </>
  );
}
