import type { DeskApp } from "./host";

export const PLAYER_PAGE = "/vendor/webdeck-player/index.html";

const DECK_W = 600;
const DECK_H = 250;

export function mountPlayer(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const frame = document.createElement("div");
  frame.className = "deck-frame";
  const box = document.createElement("div");
  box.className = "deck-fit";
  const iframe = document.createElement("iframe");
  iframe.className = "deck-iframe";
  iframe.src = PLAYER_PAGE;
  iframe.title = "Webdeck Player";
  iframe.setAttribute("scrolling", "no");
  iframe.width = String(DECK_W);
  iframe.height = String(DECK_H);
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
  box.append(iframe);
  frame.append(box);
  host.append(frame);

  const fit = () => {
    const width = Math.max(1, frame.clientWidth);
    const height = Math.max(1, frame.clientHeight);
    const scale = Math.min(width / DECK_W, height / DECK_H);
    box.style.width = `${Math.floor(DECK_W * scale)}px`;
    box.style.height = `${Math.floor(DECK_H * scale)}px`;
    iframe.style.transform = `scale(${scale})`;
    box.scrollLeft = 0;
    box.scrollTop = 0;
  };
  box.addEventListener("scroll", () => {
    if (box.scrollLeft !== 0) box.scrollLeft = 0;
    if (box.scrollTop !== 0) box.scrollTop = 0;
  });
  const observer = new ResizeObserver(fit);
  observer.observe(frame);
  fit();
  return {
    pause() {},
    resume() {
      fit();
    },
    destroy() {
      observer.disconnect();
    },
  };
}
