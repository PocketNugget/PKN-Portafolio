import type { DeskApp } from "./host";

export const PLAYER_PAGE = "/vendor/webdeck-player/index.html";

const DECK_W = 600;
const DECK_H = 250;

export function mountPlayer(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const frame = document.createElement("div");
  frame.className = "deck-frame";
  const iframe = document.createElement("iframe");
  iframe.className = "deck-iframe";
  iframe.src = PLAYER_PAGE;
  iframe.title = "Webdeck Player";
  iframe.setAttribute("scrolling", "no");
  iframe.width = String(DECK_W);
  iframe.height = String(DECK_H);
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
  frame.append(iframe);
  const credit = document.createElement("p");
  credit.className = "meta";
  credit.textContent =
    "Webdeck Player by Chris, MIT. Opening video: modest by default : Permaculture, by MTHRBORD. Playback stays in YouTube's player. This site does not host the file.";
  host.append(frame, credit);

  const fit = () => {
    const width = Math.max(1, frame.clientWidth);
    const scale = Math.min(1, width / DECK_W);
    iframe.style.transform = `scale(${scale})`;
    frame.style.height = `${Math.ceil(DECK_H * scale)}px`;
  };
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
