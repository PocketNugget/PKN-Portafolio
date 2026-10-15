import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-ext-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-ext-500.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-ext-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-ext-500.css";
import "./styles.css";
import { hydrate } from "./client";
import { openTable, validateCatalog } from "./catalog";
import { render } from "./render";
import {
  applyCompletion,
  completions,
  histDown,
  histUp,
  parseCommand,
  pushHist,
} from "./shell";

validateCatalog();

const opens = openTable();
const openNames = Object.keys(opens);
let commandLog: string[] = [];
let histIndex = -1;
let draft = "";

function paint(path: string, notice = "", tone: "err" | "hint" = "err", keep = ""): void {
  const app = document.querySelector("#app");
  if (!app) return;
  app.innerHTML = render(path, notice, tone);
  hydrate(path);
  const input = document.querySelector("#cmd");
  if (input instanceof HTMLInputElement) {
    input.value = keep;
    if (matchMedia("(pointer: fine)").matches && notice) input.focus();
  }
  window.scrollTo(0, 0);
}

function run(raw: string): void {
  const step = parseCommand(raw, opens);
  if (step.type === "noop") return;
  commandLog = pushHist(commandLog, raw);
  histIndex = -1;
  draft = "";
  if (step.type === "error") {
    paint(location.pathname, step.message, "err", raw);
    return;
  }
  if (step.type === "external") {
    location.assign(step.href);
    return;
  }
  if (location.pathname !== step.path) history.pushState({}, "", step.path);
  paint(step.path, "", "err", "");
  const input = document.querySelector("#cmd");
  if (input instanceof HTMLInputElement && matchMedia("(pointer: fine)").matches) {
    input.focus();
  }
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.id !== "shell") return;
  event.preventDefault();
  const input = form.querySelector("input");
  if (input instanceof HTMLInputElement) run(input.value);
});

document.addEventListener("keydown", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== "cmd") return;
  if (event.key === "Tab") {
    event.preventDefault();
    const matches = completions(input.value, openNames);
    if (matches.length === 1) {
      input.value = applyCompletion(input.value, matches);
      return;
    }
    if (matches.length > 1) {
      paint(location.pathname, matches.slice(0, 14).join("  "), "hint", input.value);
    }
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    const next = histUp(commandLog, histIndex, draft, input.value);
    histIndex = next.index;
    draft = next.draft;
    input.value = next.value;
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    const next = histDown(commandLog, histIndex, draft);
    histIndex = next.index;
    draft = next.draft;
    input.value = next.value;
  }
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const anchor = event.target.closest("a");
  if (!anchor) return;
  const href = anchor.getAttribute("href") ?? "";
  if (!href.startsWith("/") || href.startsWith("//")) return;
  if (href.includes(".") && !href.startsWith("/work/") && !href.startsWith("/notes/") && !href.startsWith("/blog/")) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  const cmd = anchor.dataset.cmd;
  if (cmd) {
    run(cmd);
    return;
  }
  const next = new URL(href, location.origin);
  const here = location.pathname + location.search;
  const there = next.pathname + next.search;
  if (here !== there) history.pushState({}, "", there);
  paint(next.pathname);
});

window.addEventListener("popstate", () => paint(location.pathname));
paint(location.pathname);
