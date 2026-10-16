export interface HelpLine {
  cmd: string;
  blurb: string;
}

export const HELP: HelpLine[] = [
  { cmd: "help", blurb: "this list" },
  { cmd: "whoami", blurb: "name, school, where I am looking" },
  { cmd: "about", blurb: "the same page as whoami" },
  { cmd: "jobs", blurb: "TBSeK, STEM, T-Systems" },
  { cmd: "projects", blurb: "the work I will actually talk about" },
  { cmd: "open <name>", blurb: "a project, a note, or github, linkedin, email, x" },
  { cmd: "blog", blurb: "posts from the editor" },
  { cmd: "links", blurb: "email, GitHub, LinkedIn, X, Instagram, YouTube" },
  { cmd: "writeups", blurb: "two short notes, plus the writeup repo" },
  { cmd: "radio", blurb: "HackRF, bladeRF, the iMac G4" },
  { cmd: "certs", blurb: "degree, HTB badges, languages, Security+ in progress" },
  { cmd: "contact", blurb: "email, GitHub, LinkedIn, X" },
  { cmd: "colophon", blurb: "why this is a Worker, and what it stores" },
  { cmd: "skills", blurb: "tools from the jobs, and languages" },
  { cmd: "display", blurb: "wallpaper" },
  { cmd: "player", blurb: "webdeck player. youtube, themes, the opening video" },
  { cmd: "pictures", blurb: "photo gallery" },
  { cmd: "awards", blurb: "certificate scans" },
  { cmd: "encode", blurb: "base64, hex, url, hashes, binary KB MB GB" },
  { cmd: "legal", blurb: "licenses, marks, and the music player" },
  { cmd: "dice", blurb: "roll a die" },
  { cmd: "flip", blurb: "flip a coin" },
  { cmd: "math", blurb: "a small calculator" },
  { cmd: "wheel", blurb: "spin a list of names" },
  { cmd: "sweep", blurb: "a grid of mines. flag or open" },
  { cmd: "facts", blurb: "short facts and the other tools" },
  { cmd: "hack", blurb: "drops an aggressive payload on the desk" },
  { cmd: "buddy", blurb: "the nugget assistant" },
  { cmd: "run", blurb: "open a command" },
  { cmd: "find", blurb: "search the profile text" },
  { cmd: "pad", blurb: "a public page for suggestions. they show in the editor" },
  { cmd: "snake", blurb: "dark board, arrows, esc to leave" },
  { cmd: "tetris", blurb: "dark board, arrows, space drops, esc to leave" },
  { cmd: "clear", blurb: "clear the terminal" },
  { cmd: "exit", blurb: "leave a game, or close the terminal" },
];

export const COMMANDS = HELP.map((line) => line.cmd.split(" ")[0]);

export type Step =
  | { type: "nav"; path: string; echo: string }
  | { type: "external"; href: string; echo: string }
  | { type: "error"; message: string; echo: string }
  | { type: "noop" };

const ROUTES: Record<string, string> = {
  help: "/help",
  whoami: "/",
  about: "/",
  clear: "/",
  skills: "/skills",
  display: "/display",
  player: "/player",
  pictures: "/pictures",
  awards: "/awards",
  encode: "/convert",
  facts: "/facts",
  hack: "/hack",
  buddy: "/buddy",
  run: "/run",
  find: "/find",
  pad: "/pad",
  legal: "/legal",
  dice: "/dice",
  flip: "/flip",
  math: "/math",
  wheel: "/wheel",
  sweep: "/sweep",
  jobs: "/jobs",
  projects: "/work",
  blog: "/blog",
  links: "/links",
  writeups: "/notes",
  radio: "/radio",
  certs: "/certs",
  contact: "/contact",
  colophon: "/colophon",
};

export function parseCommand(raw: string, opens: Record<string, string>): Step {
  const line = raw.trim().replace(/\s+/g, " ");
  if (!line) return { type: "noop" };
  const [head, ...rest] = line.split(" ");
  const cmd = head.toLowerCase();
  const arg = rest.join(" ").toLowerCase();
  if (cmd === "open") {
    if (!arg) {
      return {
        type: "error",
        message: "open: need a name. try `help`.",
        echo: line,
      };
    }
    const href = opens[arg];
    if (!href) {
      return {
        type: "error",
        message: `open: ${arg} not found. try \`help\`.`,
        echo: line,
      };
    }
    if (/^(https?:|mailto:)/.test(href)) {
      return { type: "external", href, echo: line };
    }
    return { type: "nav", path: href, echo: line };
  }
  const path = ROUTES[cmd];
  if (!path) {
    return {
      type: "error",
      message: `${cmd}: command not found. try \`help\`.`,
      echo: line,
    };
  }
  return { type: "nav", path, echo: cmd === "clear" ? "whoami" : line };
}

export function completions(line: string, openNames: string[]): string[] {
  const endsWithSpace = /\s$/.test(line);
  const parts = line.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return [...COMMANDS];
  const head = parts[0].toLowerCase();
  if (parts.length === 1 && !endsWithSpace) {
    return COMMANDS.filter((cmd) => cmd.startsWith(head));
  }
  if (head === "open" && (endsWithSpace || parts.length >= 2)) {
    const prefix = parts.length >= 2 && !endsWithSpace ? parts[1].toLowerCase() : "";
    if (parts.length > 2) return [];
    return openNames.filter((name) => name.startsWith(prefix)).sort();
  }
  return [];
}

export function applyCompletion(line: string, matches: string[]): string {
  if (matches.length !== 1) return line;
  const match = matches[0];
  const trimmed = line.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1 && !/\s$/.test(line)) return `${match} `;
  return `open ${match} `;
}

export function pushHist(items: string[], line: string): string[] {
  const text = line.trim();
  if (!text) return items;
  if (items[items.length - 1] === text) return items;
  return [...items, text].slice(-80);
}

export function histUp(
  items: string[],
  index: number,
  draft: string,
  current: string,
): { index: number; draft: string; value: string } {
  if (items.length === 0) return { index, draft, value: current };
  if (index === -1) {
    const next = items.length - 1;
    return { index: next, draft: current, value: items[next] };
  }
  if (index === 0) return { index, draft, value: items[0] };
  const next = index - 1;
  return { index: next, draft, value: items[next] };
}

export function histDown(
  items: string[],
  index: number,
  draft: string,
): { index: number; draft: string; value: string } {
  if (index === -1) return { index, draft, value: draft };
  if (index >= items.length - 1) return { index: -1, draft: "", value: draft };
  const next = index + 1;
  return { index: next, draft, value: items[next] };
}
