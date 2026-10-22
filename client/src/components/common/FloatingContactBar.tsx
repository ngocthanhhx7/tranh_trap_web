import { useEffect, useRef, useState } from "react";
import { ArrowUp, Phone, ContactRound, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { contacts, socialLinks } from "../../config/contacts";

gsap.registerPlugin(useGSAP);
export function FloatingContactBar() {
  const root = useRef<HTMLElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 900px)").matches,
  );
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const onChange = () => {
      setMobile(media.matches);
      setExpanded(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const onOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
        root.current
          ?.querySelector<HTMLButtonElement>(".contact-toggle")
          ?.focus();
      }
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded]);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(root.current, {
          autoAlpha: 0,
          x: -12,
          duration: 0.4,
          delay: 0.25,
          clearProps: "all",
        });
        gsap.to(".contact-phone svg", {
          rotation: 12,
          duration: 0.14,
          repeat: -1,
          yoyo: true,
          repeatDelay: 1.8,
          ease: "sine.inOut",
        });
        gsap.to(".contact-social .contact-icon", {
          y: -3,
          duration: 1.35,
          stagger: 0.22,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      return () => media.revert();
    },
    { scope: root },
  );
  return (
    <nav ref={root} className="floating-contact-bar" aria-label="Liên hệ nhanh">
      <div
        id="quick-contact-options"
        className="contact-options"
        hidden={mobile && !expanded}
        onClick={() => setExpanded(false)}
      >
        <a
          className="contact-round contact-phone"
          href={`tel:${contacts.phone}`}
          aria-label={`Gọi hotline ${contacts.phoneDisplay}`}
        >
          <span className="contact-icon">
            <Phone size={22} />
          </span>
          <span className="contact-tooltip">Gọi {contacts.phoneDisplay}</span>
        </a>
        {socialLinks.map((link) => (
          <a
            key={link.name}
            className={`contact-round contact-social contact-${link.className}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Liên hệ ${link.name}`}
          >
            <span className="contact-icon">
              <img src={link.icon} alt="" />
            </span>
            <span className="contact-tooltip">{link.name}</span>
          </a>
        ))}
        {showTop && (
          <button
            className="contact-round contact-top"
            aria-label="Về đầu trang"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "auto"
                  : "smooth",
              })
            }
          >
            <span className="contact-icon">
              <ArrowUp size={22} />
            </span>
            <span className="contact-tooltip">Về đầu trang</span>
          </button>
        )}
      </div>
      <button
        className="contact-round contact-toggle"
        aria-label={expanded ? "Đóng liên hệ nhanh" : "Mở liên hệ nhanh"}
        aria-expanded={expanded}
        aria-controls="quick-contact-options"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="contact-icon">
          {expanded ? <X size={22} /> : <ContactRound size={22} />}
        </span>
      </button>
    </nav>
  );
}
