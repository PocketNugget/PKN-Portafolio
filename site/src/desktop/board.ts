import { t } from "../i18n";
import { LEVEL_CAP, parseScoreName, SCORE_CAP, type GameId } from "../scores";

export interface BoardHandle {
  setOffer(score: number, level: number, over: boolean): void;
  destroy(): void;
}

const NAME_KEY = "pkn-player-name";

export function mountBoard(parent: HTMLElement, game: GameId, before: Node | null = null): BoardHandle {
  const box = document.createElement("aside");
  box.className = "top-scores";
  box.tabIndex = 0;
  box.setAttribute("aria-label", t("Top scores"));
  const title = document.createElement("p");
  title.className = "top-title";
  title.textContent = t("Top scores");
  const list = document.createElement("ol");
  const form = document.createElement("form");
  form.className = "top-form";
  form.hidden = true;
  const input = document.createElement("input");
  input.name = "player";
  input.maxLength = 16;
  input.setAttribute("autocomplete", "nickname");
  input.spellcheck = false;
  input.enterKeyHint = "done";
  input.setAttribute("aria-label", t("Name"));
  input.placeholder = t("Name");
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = t("Save score");
  const note = document.createElement("p");
  note.className = "top-note";
  form.append(input, save, note);
  box.append(title, list, form);
  parent.insertBefore(box, before);
  try {
    const saved = sessionStorage.getItem(NAME_KEY);
    if (saved) input.value = saved;
  } catch {
    /* this tab can block storage */
  }

  let current = { score: 0, level: 1 };
  let busy = false;
  let gone = false;

  const paintRows = (rows: { name: string; score: number; level: number }[]) => {
    if (gone) return;
    list.replaceChildren();
    if (rows.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = t("No scores yet.");
      list.append(empty);
      return;
    }
    for (const row of rows) {
      const item = document.createElement("li");
      const who = document.createElement("span");
      who.className = "top-name";
      who.textContent = row.name;
      const pts = document.createElement("span");
      pts.textContent = String(row.score);
      item.append(who, pts);
      list.append(item);
    }
  };

  const refresh = async () => {
    try {
      const res = await fetch(`/api/scores?game=${game}`, { cache: "no-store" });
      if (!res.ok) throw new Error("quiet");
      const body = (await res.json()) as { scores?: { name?: unknown; score?: unknown; level?: unknown }[] };
      const rows = Array.isArray(body.scores) ? body.scores : [];
      const clean = rows
        .map((row) => {
          const name = parseScoreName(row.name);
          const score = typeof row.score === "number" && Number.isInteger(row.score) ? row.score : null;
          const level = typeof row.level === "number" && Number.isInteger(row.level) ? row.level : null;
          if (!name || score === null || level === null) return null;
          return { name, score, level };
        })
        .filter((row): row is { name: string; score: number; level: number } => row !== null)
        .slice(0, 8);
      paintRows(clean);
    } catch {
      if (gone) return;
      list.replaceChildren();
      const empty = document.createElement("li");
      empty.textContent = t("Top scores are quiet right now.");
      list.append(empty);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (busy || form.hidden) return;
    const name = parseScoreName(input.value);
    if (!name) {
      note.textContent = t("Type a name, then save.");
      return;
    }
    busy = true;
    save.disabled = true;
    try {
      sessionStorage.setItem(NAME_KEY, name);
    } catch {
      /* the name still goes to the board */
    }
    const score = Math.min(SCORE_CAP[game], Math.max(1, current.score));
    const level = Math.min(LEVEL_CAP, Math.max(1, current.level));
    void fetch("/api/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ game, name, score, level }),
    })
      .then(async (res) => {
        if (gone) return;
        const body = await res.json().catch(() => null);
        const row = body && typeof body === "object" ? (body as { best?: unknown }) : null;
        if (res.status === 201 && row) {
          note.textContent = t("Saved.");
          await refresh();
        } else if (res.status === 200 && row?.best === false) note.textContent = t("That score stays under your best.");
        else if (res.status === 429) note.textContent = t("Too many score saves. Try later.");
        else note.textContent = t("That score was not saved.");
      })
      .catch(() => {
        if (!gone) note.textContent = t("Top scores are quiet right now.");
      })
      .finally(() => {
        busy = false;
        save.disabled = false;
      });
  });

  void refresh();
  return {
    setOffer(score: number, level: number, over: boolean) {
      current = { score, level };
      const show = over && score > 0;
      if (form.hidden === !show) return;
      form.hidden = !show;
      if (!show) note.textContent = "";
    },
    destroy() {
      gone = true;
      box.remove();
    },
  };
}
