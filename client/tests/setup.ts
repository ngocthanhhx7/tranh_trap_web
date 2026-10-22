import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(cleanup);

Object.defineProperty(window, "scrollTo", { value: () => {}, writable: true });
// jsdom has no media-query engine; animation is disabled in these route tests.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (media: string) => ({
    matches: false,
    media,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return true;
    },
  }),
});
