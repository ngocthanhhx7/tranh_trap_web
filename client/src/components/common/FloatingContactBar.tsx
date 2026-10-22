import { useEffect, useRef, useState } from "react";
import { ArrowUp, Phone } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { contacts, socialLinks } from "../../config/contacts";

gsap.registerPlugin(useGSAP);
export function FloatingContactBar() {
  const root = useRef<HTMLElement>(null);
  const [showTop, setShowTop] = useState(false);
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
      });
      return () => media.revert();
    },
    { scope: root },
  );
  return (
    <nav ref={root} className="floating-contact-bar" aria-label="Liên hệ nhanh">
      <a
        className="contact-round contact-phone"
        href={`tel:${contacts.phone}`}
        aria-label={`Gọi hotline ${contacts.phoneDisplay}`}
      >
        <Phone size={22} />
        <span className="contact-tooltip">Gọi {contacts.phoneDisplay}</span>
      </a>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          className={`contact-round contact-${link.className}`}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Liên hệ ${link.name}`}
        >
          <img src={link.icon} alt="" />
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
          <ArrowUp size={22} />
          <span className="contact-tooltip">Về đầu trang</span>
        </button>
      )}
    </nav>
  );
}
