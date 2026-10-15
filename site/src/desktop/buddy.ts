import { FACTS } from "./facts";
import type { DeskApp } from "./host";

export function mountBuddy(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "buddy-app";
  const pic = document.createElement("img");
  pic.className = "buddy-pic";
  pic.src = "/buddy/nugget.png";
  pic.alt = "Nugget assistant";
  const say = document.createElement("p");
  say.className = "buddy-say";
  const row = document.createElement("div");
  row.className = "field-row";
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "Next tip";
  row.append(next);
  root.append(pic, say, row);
  host.append(root);

  let index = 0;
  let timer = 0;

  function talk(): void {
    const fact = FACTS[index] ?? "";
    say.textContent = fact;
    pic.classList.add("talk");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => pic.classList.remove("talk"), 1400);
  }

  next.addEventListener("click", () => {
    index = (index + 1) % FACTS.length;
    talk();
  });
  talk();

  return {
    pause() {
      pic.classList.remove("talk");
    },
    resume() {},
    destroy() {
      window.clearTimeout(timer);
      pic.classList.remove("talk");
    },
  };
}
