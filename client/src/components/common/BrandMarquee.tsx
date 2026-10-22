import { useEffect, useRef, useState } from "react";
import { Pause, Play, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
export function BrandMarquee() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
    tween.current?.paused(paused || document.hidden);
  }, [paused]);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        tween.current = gsap.to(track.current, {
          xPercent: -50,
          duration: 42,
          repeat: -1,
          ease: "none",
        });
        if (pausedRef.current || document.hidden) tween.current.pause();
        const visibility = () => {
          if (document.hidden || pausedRef.current) tween.current?.pause();
          else tween.current?.play();
        };
        document.addEventListener("visibilitychange", visibility);
        return () => {
          document.removeEventListener("visibilitychange", visibility);
          tween.current = null;
        };
      });
      return () => media.revert();
    },
    { scope: root },
  );
  return (
    <div
      ref={root}
      className="brand-marquee"
      onMouseEnter={() => tween.current?.pause()}
      onMouseLeave={() => {
        if (!paused) tween.current?.play();
      }}
    >
      <span className="sr-only">Tỉnh táo online - Biết sai để tránh</span>
      <div className="brand-marquee-viewport" aria-hidden="true">
        <div ref={track} className="brand-marquee-track">
          {[0, 1].map((group) => (
            <div className="brand-marquee-group" key={group}>
              {[0, 1, 2, 3].map((item) => (
                <span key={item}>
                  TỈNH TÁO ONLINE - BIẾT SAI ĐỂ TRÁNH <Sparkles size={15} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <button
        className="marquee-toggle"
        aria-label={paused ? "Tiếp tục chữ chạy" : "Tạm dừng chữ chạy"}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
  );
}
