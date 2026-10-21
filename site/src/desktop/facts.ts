import { FACTS, NUGGET_LINES, NUGGET_TIPS } from "../catalog";
import { t } from "../i18n";
import type { DeskApp } from "./host";
import { idleApp } from "./host";

export { FACTS, NUGGET_LINES, NUGGET_TIPS };

export const NUGGET_SCARE = "I hope you do not hack me.";

/** Said while the payload runs, then when Reset brings the desk back. */
export const NUGGET_HACKED = [
  "Hey! You hacked me! My tie is changing colors!",
  "Stop! The icons are screaming. You can hit Reset.",
  "I am still here. Please press Reset.",
];
export const NUGGET_RELIEF = "Phew. The desk is clean again. Thank you.";

const TOOLS: { label: string; path: string }[] = [
  { label: "Music", path: "/player" },
  { label: "My Pictures", path: "/pictures" },
  { label: "Certificates", path: "/awards" },
  { label: "Converter", path: "/convert" },
  { label: "Sweep", path: "/sweep" },
  { label: "Tron", path: "/tron" },
  { label: "Nugget", path: "/buddy" },
];

export function mountFacts(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "facts-app";
  const lead = document.createElement("p");
  lead.textContent = t("The same record as the rest of the site, told in short lines.");
  const list = document.createElement("ul");
  list.className = "ls";
  for (const fact of FACTS) {
    const item = document.createElement("li");
    item.textContent = t(fact);
    list.append(item);
  }
  const heading = document.createElement("h2");
  heading.textContent = t("Tools");
  const row = document.createElement("div");
  row.className = "tool-row";
  for (const tool of TOOLS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t(tool.label);
    button.addEventListener("click", () => open(tool.path));
    row.append(button);
  }
  root.append(lead, list, heading, row);
  host.append(root);
  return idleApp;
}
