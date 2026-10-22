import { useEffect } from "react";

// Browser-side friction only; never publish confidential media in public assets.
export function MediaProtection() {
  useEffect(() => {
    const preventMediaAction = (event: Event) => {
      if (
        event.target instanceof Element &&
        (event.target.closest("img, video, picture") ||
          getComputedStyle(event.target).backgroundImage.includes("url("))
      ) {
        event.preventDefault();
      }
    };
    const configure = (root: Element) => {
      const images = [...root.querySelectorAll("img")];
      if (root instanceof HTMLImageElement) images.push(root);
      images.forEach((image) => {
        image.draggable = false;
      });
      const videos = [...root.querySelectorAll("video")];
      if (root instanceof HTMLVideoElement) videos.push(root);
      videos.forEach((video) => {
        if (
          video.getAttribute("controlslist") !== "nodownload noremoteplayback"
        ) {
          video.setAttribute("controlslist", "nodownload noremoteplayback");
        }
        video.disablePictureInPicture = true;
      });
    };
    configure(document.body);
    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        for (const node of change.addedNodes) {
          if (node instanceof Element) configure(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("contextmenu", preventMediaAction, true);
    document.addEventListener("dragstart", preventMediaAction, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("contextmenu", preventMediaAction, true);
      document.removeEventListener("dragstart", preventMediaAction, true);
    };
  }, []);
  return null;
}
