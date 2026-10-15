import { bio, jobs, projects } from "../catalog";
import { NUGGET_LINES } from "./facts";
import { t } from "../i18n";
import type { DeskApp } from "./host";
import { idleApp } from "./host";
import { parseCommand } from "../shell";
import { openTable } from "../catalog";

export function mountRun(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const form = document.createElement("form");
  form.className = "login";
  const input = document.createElement("input");
  input.setAttribute("aria-label", t("Command"));
  input.placeholder = "jobs";
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = t("OK");
  const status = document.createElement("p");
  status.className = "err";
  form.append(input, button, status);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const step = parseCommand(input.value, openTable());
    if (step.type === "nav") {
      status.textContent = "";
      open(step.path);
      return;
    }
    if (step.type === "external") {
      window.open(step.href, "_blank", "noopener");
      return;
    }
    status.textContent = step.type === "error" ? step.message : "";
  });
  host.append(form);
  return idleApp;
}

interface Hit {
  path: string;
  label: string;
  text: string;
}

function hits(query: string): Hit[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const found: Hit[] = [];
  const push = (path: string, label: string, text: string) => {
    const shown = t(text);
    if (`${text}\n${shown}`.toLowerCase().includes(needle)) found.push({ path, label: t(label), text: shown });
  };
  for (const line of bio) push("/", "About", line);
  for (const line of NUGGET_LINES) push("/", "Nugget", line);
  for (const job of jobs) {
    for (const line of [job.role, job.summary, job.place, job.date, ...job.body]) push("/jobs", job.org, line);
  }
  for (const project of projects) {
    const lines = [project.title, project.summary, project.date, project.people, ...project.body].filter(Boolean);
    for (const line of lines) push(`/work/${project.slug}`, project.title, line);
  }
  return found.slice(0, 12);
}

export function mountFind(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const form = document.createElement("form");
  form.className = "login";
  const input = document.createElement("input");
  input.setAttribute("aria-label", t("Find"));
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = t("Find");
  form.append(input, button);
  const list = document.createElement("ul");
  list.className = "ls";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    list.replaceChildren();
    for (const hit of hits(input.value)) {
      const item = document.createElement("li");
      const link = document.createElement("button");
      link.type = "button";
      link.textContent = `${hit.label}: ${hit.text.slice(0, 80)}`;
      link.addEventListener("click", () => open(hit.path));
      item.append(link);
      list.append(item);
    }
    if (!list.childElementCount) {
      const item = document.createElement("li");
      item.textContent = t("No match.");
      list.append(item);
    }
  });
  host.append(form, list);
  return idleApp;
}
