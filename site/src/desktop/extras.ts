import { bio, jobs, projects } from "../catalog";
import type { DeskApp } from "./host";
import { idleApp } from "./host";
import { parseCommand } from "../shell";
import { openTable } from "../catalog";

export function mountRun(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const form = document.createElement("form");
  form.className = "login";
  const input = document.createElement("input");
  input.setAttribute("aria-label", "Command");
  input.placeholder = "jobs";
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "OK";
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
    if (text.toLowerCase().includes(needle)) found.push({ path, label, text });
  };
  for (const line of bio) push("/", "About", line);
  for (const job of jobs) {
    push("/jobs", job.org, `${job.role}. ${job.summary}`);
    for (const line of job.body) push("/jobs", job.org, line);
  }
  for (const project of projects) {
    push(`/work/${project.slug}`, project.title, project.summary);
    for (const line of project.body) push(`/work/${project.slug}`, project.title, line);
  }
  return found.slice(0, 12);
}

export function mountFind(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const form = document.createElement("form");
  form.className = "login";
  const input = document.createElement("input");
  input.setAttribute("aria-label", "Find");
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "Find";
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
      item.textContent = "No match.";
      list.append(item);
    }
  });
  host.append(form, list);
  return idleApp;
}
