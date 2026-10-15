import { t } from "../i18n";
import { cleanBlock, cleanLine, NOTE_BODY_MAX, NOTE_LINES, NOTE_NAME_MAX } from "../plain";
import type { DeskApp } from "./host";
import { idleApp } from "./host";

export interface PublicNote {
  id: number;
  name: string;
  body: string;
  created: string;
}

export function readNotes(value: unknown): PublicNote[] {
  if (!value || typeof value !== "object") return [];
  const notes = (value as { notes?: unknown }).notes;
  if (!Array.isArray(notes)) return [];
  const out: PublicNote[] = [];
  for (const item of notes) {
    if (!item || typeof item !== "object") continue;
    const note = item as { id?: unknown; name?: unknown; body?: unknown; created?: unknown };
    if (typeof note.id !== "number" || !Number.isSafeInteger(note.id) || note.id < 1) continue;
    if (typeof note.name !== "string" || typeof note.body !== "string" || typeof note.created !== "string") continue;
    const name = cleanLine(note.name, NOTE_NAME_MAX);
    const body = cleanBlock(note.body, NOTE_BODY_MAX, NOTE_LINES);
    if (!name || !body || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(note.created)) continue;
    out.push({ id: note.id, name, body, created: note.created });
  }
  return out;
}

function line(parent: HTMLElement, className: string, text: string): HTMLElement {
  const node = document.createElement("p");
  node.className = className;
  node.textContent = text;
  parent.append(node);
  return node;
}

export function paintNotes(list: HTMLElement, notes: PublicNote[]): void {
  list.replaceChildren();
  if (notes.length === 0) {
    line(list, "notepad-line", t("No suggestions yet."));
    return;
  }
  for (const note of notes) {
    const row = document.createElement("article");
    row.className = "notepad-line";
    line(row, "notepad-who", `${note.name}  ${note.created.slice(0, 10)}`);
    line(row, "notepad-body", note.body);
    list.append(row);
  }
}

export function mountPad(host: HTMLElement): DeskApp {
  host.replaceChildren();
  host.classList.add("notepad");

  const form = document.createElement("form");
  form.className = "notepad-form";
  const name = document.createElement("input");
  name.maxLength = 40;
  name.required = true;
  name.autocomplete = "name";
  name.placeholder = t("Name");
  name.setAttribute("aria-label", t("Name"));
  const body = document.createElement("textarea");
  body.maxLength = 600;
  body.required = true;
  body.rows = 4;
  body.placeholder = t("Suggestion");
  body.setAttribute("aria-label", t("Suggestion"));
  const trapWrap = document.createElement("div");
  trapWrap.className = "notepad-hp";
  trapWrap.setAttribute("aria-hidden", "true");
  const trap = document.createElement("input");
  trap.tabIndex = -1;
  trap.autocomplete = "off";
  trap.name = "company";
  trapWrap.append(trap);
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = t("leave suggestion");
  const status = document.createElement("p");
  status.className = "err";
  status.setAttribute("role", "status");
  form.append(line(form, "notepad-lead", t("Leave a suggestion. It stays on this page, and I can read it in the editor.")), name, body, trapWrap, button, status);

  const list = document.createElement("div");
  list.className = "notepad-sheet";
  host.append(form, list);

  async function load(): Promise<void> {
    const response = await fetch("/api/comments", { credentials: "same-origin" });
    if (!response.ok) {
      status.textContent = t("The suggestions did not load.");
      return;
    }
    paintNotes(list, readNotes(await response.json()));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      status.textContent = "";
      if (!cleanLine(name.value, NOTE_NAME_MAX) || !cleanBlock(body.value, NOTE_BODY_MAX, NOTE_LINES)) {
        status.textContent = t("The suggestion did not save.");
        return;
      }
      const response = await fetch("/api/comments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.value, body: body.value, company: trap.value }),
      });
      if (response.status === 201) {
        name.value = "";
        body.value = "";
        trap.value = "";
        status.textContent = t("Saved.");
        await load();
        return;
      }
      status.textContent = response.status === 429 ? t("too many suggestions. try later.") : t("The suggestion did not save.");
    })();
  });

  void load();
  return idleApp;
}
