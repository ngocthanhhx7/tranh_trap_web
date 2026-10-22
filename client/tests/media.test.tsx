import { act, fireEvent, render } from "@testing-library/react";
import { expect, it } from "vitest";
import { MediaProtection } from "../src/app/MediaProtection";

it("protects static and dynamically mounted media without blocking text context menus", async () => {
  const { container, unmount } = render(
    <>
      <MediaProtection />
      <img alt="Logo" />
      <video controls />
      <p>Văn bản</p>
    </>,
  );
  const image = container.querySelector("img")!;
  const video = container.querySelector("video")!;
  expect(fireEvent.contextMenu(image)).toBe(false);
  expect(fireEvent.dragStart(image)).toBe(false);
  expect(fireEvent.contextMenu(video)).toBe(false);
  expect(fireEvent.contextMenu(container.querySelector("p")!)).toBe(true);
  expect(video.getAttribute("controlslist")).toContain("nodownload");
  expect(image.draggable).toBe(false);
  const dynamicVideo = document.createElement("video");
  await act(async () => {
    container.append(dynamicVideo);
  });
  expect(dynamicVideo.getAttribute("controlslist")).toContain("nodownload");
  unmount();
  expect(fireEvent.contextMenu(dynamicVideo)).toBe(true);
});
