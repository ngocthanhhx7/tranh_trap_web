import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { FloatingContactBar } from "../src/components/common/FloatingContactBar";
import { BrandMarquee } from "../src/components/common/BrandMarquee";
import { contacts } from "../src/config/contacts";

it("uses the supplied social links and shows Back to Top only past 300px", () => {
  Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  render(<FloatingContactBar />);
  expect(
    screen.getByRole("link", { name: "Liên hệ Zalo" }).getAttribute("href"),
  ).toBe(contacts.zalo);
  expect(
    screen.getByRole("link", { name: "Liên hệ Facebook" }).getAttribute("href"),
  ).toBe(contacts.facebook);
  expect(
    screen.getByRole("link", { name: "Liên hệ TikTok" }).getAttribute("href"),
  ).toBe(contacts.tiktok);
  expect(screen.queryByRole("button", { name: "Về đầu trang" })).toBeNull();
  window.scrollY = 300;
  fireEvent.scroll(window);
  expect(screen.queryByRole("button", { name: "Về đầu trang" })).toBeNull();
  window.scrollY = 301;
  fireEvent.scroll(window);
  expect(screen.getByRole("button", { name: "Về đầu trang" })).toBeTruthy();
  window.scrollY = 0;
  fireEvent.scroll(window);
  expect(screen.queryByRole("button", { name: "Về đầu trang" })).toBeNull();
});

it("can pause/resume the repeated marquee without making a screen reader read all copies", () => {
  const { container } = render(<BrandMarquee />);
  expect(container.querySelectorAll(".brand-marquee-group > span").length).toBe(
    8,
  );
  expect(
    container
      .querySelector(".brand-marquee-viewport")
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Tạm dừng chữ chạy" }));
  expect(
    screen
      .getByRole("button", { name: "Tiếp tục chữ chạy" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục chữ chạy" }));
  expect(
    screen
      .getByRole("button", { name: "Tạm dừng chữ chạy" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
});
