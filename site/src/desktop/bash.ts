import { bio, jobs, profiles, projects, skillGroups } from "../catalog";
import { COMMANDS, HELP } from "../shell";

/** Bash-style commands that run on a pretend machine. Nothing here touches a real system or the network. */
export const BASH_COMMANDS = [
  "pwd", "cd", "cat", "head", "echo", "date", "uname", "hostname", "id", "env", "uptime", "df", "free", "ps",
  "history", "which", "alias", "tree", "ping", "curl", "wget", "ssh", "sudo", "su", "rm", "mv", "cp", "touch",
  "mkdir", "chmod", "grep", "wc", "neofetch", "cowsay", "fortune", "man", "ll",
];

export interface BashEnv {
  now: Date;
  history: string[];
  cols: number;
}

const FILES: Record<string, () => string[]> = {
  "about.txt": () => [...bio],
  "contact.txt": () => [profiles.email.label, profiles.github.href, profiles.linkedin.href, profiles.x.href],
  "jobs.txt": () => jobs.map((job) => `${job.date}  ${job.role}, ${job.org}`),
  "projects.txt": () => projects.map((project) => `${project.slug}: ${project.summary}`),
  "skills.txt": () => Object.values(skillGroups).flatMap((group) => (Array.isArray(group) ? group : [])).map(String),
  "motd": () => ["Welcome to pkn. Type ls for the commands, or help for what each one does."],
};
const FILE_NAMES = Object.keys(FILES).sort();

const FORTUNES = [
  "A SOC analyst reads the log before the log reads them.",
  "Docker works on my machine, and that is how it got a Compose file.",
  "The cache is always right, until it is not.",
  "Ship it small. Read the diff twice.",
  "Every radio is a computer that learned to listen.",
  "There is no cloud. Only someone else's homelab.",
  "The nugget sees all. The nugget forgives nothing in prod.",
];

const COW = (text: string): string[] => {
  const bar = "-".repeat(text.length + 2);
  return [` ${bar}`, `< ${text} >`, ` ${bar}`, "   \\   ^__^", "    \\  (oo)\\_______", "       (__)\\       )\\/\\", "           ||----w |", "           ||     ||"];
};

const MAN: Record<string, string> = {
  pwd: "print the current directory.",
  cd: "change directory. This shell stays in /home/goben.",
  cat: "print a file. try: cat about.txt",
  head: "print the first lines of a file. try: head jobs.txt",
  echo: "print its arguments. $USER, $HOME, $SHELL, and $HOST work.",
  date: "print the date and time.",
  uname: "print the system name. try: uname -a",
  hostname: "print the host name.",
  id: "print the user and groups.",
  env: "print the environment.",
  uptime: "how long this pretend machine has been up.",
  df: "disk space on the pretend disk.",
  free: "memory on the pretend machine.",
  ps: "the pretend process list.",
  history: "the commands typed in this window.",
  which: "where a command lives.",
  alias: "the shell aliases.",
  tree: "the files in the home folder, as a tree.",
  ping: "four pretend replies from pocketnugget.xyz.",
  curl: "the network is off in this sandbox.",
  wget: "the network is off in this sandbox.",
  ssh: "no remote shells from here.",
  sudo: "not for this user.",
  su: "not for this user.",
  rm: "this disk is read-only.",
  mv: "this disk is read-only.",
  cp: "this disk is read-only.",
  touch: "this disk is read-only.",
  mkdir: "this disk is read-only.",
  chmod: "this disk is read-only.",
  grep: "find a word in a file. try: grep SOC jobs.txt",
  wc: "count lines, words, and characters. try: wc about.txt",
  neofetch: "the system in one screen.",
  cowsay: "a cow says what you type.",
  fortune: "one line of luck.",
  man: "this page. try: man cat",
  ll: "a long list of the files.",
  ls: "every command, names only. ls -l lists the files.",
};

/** Break text to the width, with a hanging indent on every line after the first. */
export function wrapText(text: string, width: number, indent = 0): string[] {
  const room = Math.max(10, width);
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const pad = out.length === 0 ? 0 : indent;
    if (line && pad + line.length + 1 + word.length > room) {
      out.push(" ".repeat(out.length === 0 ? 0 : indent) + line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  out.push(" ".repeat(out.length === 0 ? 0 : indent) + line);
  return out;
}

/** Names in columns that fit the width. */
export function columns(names: string[], width: number): string[] {
  const cell = Math.max(...names.map((name) => name.length), 1) + 2;
  const per = Math.max(1, Math.floor(width / cell));
  const out: string[] = [];
  for (let i = 0; i < names.length; i += per) {
    out.push(
      names
        .slice(i, i + per)
        .map((name) => name.padEnd(cell))
        .join("")
        .trimEnd(),
    );
  }
  return out;
}

/** Every command: the site ones first, then the bash-style ones. */
export function listing(width: number): string[] {
  const site = [...new Set(COMMANDS)].sort();
  return [
    "site commands",
    ...columns(site, width),
    "",
    "bash-style commands",
    ...columns([...BASH_COMMANDS].sort(), width),
    "",
    ...wrapText("help describes each one. man <cmd> too. ls -l lists the files.", width, 0),
  ];
}

export function helpLines(width: number): string[] {
  const out: string[] = [];
  const roomy = width >= 54;
  for (const item of HELP) {
    if (roomy) {
      const wrapped = wrapText(item.blurb, width - 18, 0);
      out.push(`${item.cmd.padEnd(18)}${wrapped[0] ?? ""}`);
      for (const more of wrapped.slice(1)) out.push(`${" ".repeat(18)}${more}`);
    } else {
      out.push(item.cmd);
      out.push(...wrapText(item.blurb, width - 2, 0).map((row) => `  ${row}`));
    }
  }
  return out;
}

function stamp(now: Date): string {
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][now.getMonth()];
  const two = (n: number) => String(n).padStart(2, "0");
  return `${day} ${month} ${String(now.getDate()).padStart(2, " ")} ${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())} ${now.getFullYear()}`;
}

function fileLines(name: string): string[] | null {
  const key = name.replace(/^(\.\/|~\/|\/home\/goben\/)/, "");
  const make = FILES[key];
  return make ? make() : null;
}

function longList(): string[] {
  return [
    `total ${FILE_NAMES.length}`,
    ...FILE_NAMES.map((name) => {
      const size = String(fileLines(name)?.join("\n").length ?? 0).padStart(5);
      return `-r--r--r-- 1 goben goben ${size} Jan  1 00:00 ${name}`;
    }),
  ];
}

function readOnly(cmd: string, args: string[]): string[] {
  return [`${cmd}: cannot modify '${args[0] ?? ""}': read-only file system`.replace(" ''", "")];
}

/** The lines a bash-style command prints, or null when the word is not one of them. */
export function bash(line: string, env: BashEnv): string[] | null {
  const parts = line.trim().split(/\s+/).filter(Boolean);
  const cmd = (parts[0] ?? "").toLowerCase();
  const args = parts.slice(1);
  const flags = args.filter((arg) => arg.startsWith("-"));
  const rest = args.filter((arg) => !arg.startsWith("-"));
  const width = env.cols;

  switch (cmd) {
    case "ls":
      if (flags.some((flag) => /l/.test(flag))) return longList();
      if (flags.some((flag) => /a/.test(flag))) return columns([".", "..", ...FILE_NAMES], width);
      if (rest.length > 0) {
        const file = rest[0] ?? "";
        return FILES[file.replace(/^(\.\/|~\/)/, "")] ? [file] : [`ls: cannot access '${file}': No such file or directory`];
      }
      return listing(width);
    case "ll":
      return longList();
    case "pwd":
      return ["/home/goben"];
    case "cd":
      return rest.length === 0 || ["~", "/home/goben", ".", "/home/goben/"].includes(rest[0] ?? "")
        ? []
        : [`cd: ${rest[0]}: No such file or directory`];
    case "cat": {
      if (rest.length === 0) return ["cat: need a file. try: cat about.txt"];
      const out: string[] = [];
      for (const name of rest) {
        const body = fileLines(name);
        if (!body) out.push(`cat: ${name}: No such file or directory`);
        else for (const row of body) out.push(...wrapText(row, width, 0));
      }
      return out;
    }
    case "head": {
      const name = rest[0];
      if (!name) return ["head: need a file. try: head jobs.txt"];
      const body = fileLines(name);
      return body ? body.slice(0, 3).flatMap((row) => wrapText(row, width, 0)) : [`head: ${name}: No such file or directory`];
    }
    case "wc": {
      const name = rest[0];
      const body = name ? fileLines(name) : null;
      if (!name || !body) return [name ? `wc: ${name}: No such file or directory` : "wc: need a file. try: wc about.txt"];
      const text = body.join("\n");
      return [`${body.length} ${text.split(/\s+/).filter(Boolean).length} ${text.length + 1} ${name}`];
    }
    case "grep": {
      const [word, name] = rest;
      if (!word || !name) return ["grep: usage: grep <word> <file>"];
      const body = fileLines(name);
      if (!body) return [`grep: ${name}: No such file or directory`];
      return body.filter((row) => row.toLowerCase().includes(word.toLowerCase())).flatMap((row) => wrapText(row, width, 0));
    }
    case "echo": {
      const text = args
        .join(" ")
        .replace(/\$USER\b/g, "goben")
        .replace(/\$HOME\b/g, "/home/goben")
        .replace(/\$SHELL\b/g, "/bin/bash")
        .replace(/\$HOST\b/g, "pkn");
      return wrapText(text || " ", width, 0);
    }
    case "date":
      return [stamp(env.now)];
    case "uname":
      return flags.length > 0
        ? ["Linux pkn 6.1.0-nugget #1 SMP PREEMPT x86_64 GNU/Linux"]
        : ["Linux"];
    case "hostname":
      return ["pkn"];
    case "id":
      return ["uid=1000(goben) gid=1000(goben) groups=1000(goben),27(sudo-but-not-really)"];
    case "env":
      return ["USER=goben", "HOME=/home/goben", "SHELL=/bin/bash", "HOST=pkn", "LANG=en_US.UTF-8", "TERM=nugget-256color"];
    case "uptime":
      return [` ${stamp(env.now).slice(11, 19)} up 1337 days, 4:20, 1 user, load average: 0.00, 0.01, 0.05`];
    case "df":
      return [
        "Filesystem      Size  Used Avail Use% Mounted on",
        "/dev/nugget1     98G   42G   52G  45% /",
        "tmpfs           2.0G     0  2.0G   0% /tmp",
      ];
    case "free":
      return [
        "              total        used        free",
        "Mem:        8192000     2048000     6144000",
        "Swap:       2097152           0     2097152",
      ];
    case "ps":
      return ["  PID TTY          TIME CMD", "    1 pts/0    00:00:00 bash", "   42 pts/0    00:00:01 nugget.exe", "   99 pts/0    00:00:00 ps"];
    case "history":
      return env.history.map((item, index) => `${String(index + 1).padStart(4)}  ${item}`);
    case "which": {
      const name = rest[0] ?? "";
      if (!name) return ["which: need a command"];
      return COMMANDS.includes(name) || BASH_COMMANDS.includes(name) || name === "ls"
        ? [`/usr/local/bin/${name}`]
        : [`which: no ${name} in (/usr/local/bin:/usr/bin)`];
    }
    case "alias":
      return ["alias ll='ls -l'"];
    case "tree":
      return [
        "/home/goben",
        ...FILE_NAMES.map((name, index) => `${index === FILE_NAMES.length - 1 ? "└──" : "├──"} ${name}`),
        "",
        `0 directories, ${FILE_NAMES.length} files`,
      ];
    case "ping":
      return [
        "PING pocketnugget.xyz (127.0.0.1): 56 data bytes",
        "64 bytes from 127.0.0.1: seq=0 ttl=64 time=0.042 ms",
        "64 bytes from 127.0.0.1: seq=1 ttl=64 time=0.038 ms",
        "64 bytes from 127.0.0.1: seq=2 ttl=64 time=0.040 ms",
        "64 bytes from 127.0.0.1: seq=3 ttl=64 time=0.041 ms",
        "--- pocketnugget.xyz ping statistics ---",
        "4 packets transmitted, 4 received, 0% packet loss",
      ];
    case "curl":
    case "wget":
      return [`${cmd}: network is off in this sandbox. Nothing leaves this window.`];
    case "ssh":
      return ["ssh: no remote shells from here. The nugget keeps the keys."];
    case "sudo":
    case "su":
      return ["goben is not in the sudoers file. This incident will be reported to the nugget."];
    case "rm":
      return /r/.test(flags.join("")) && /f/.test(flags.join(""))
        ? ["rm: nice try. The disk is read-only, and the nugget is watching."]
        : readOnly("rm", rest);
    case "mv":
    case "cp":
    case "touch":
    case "mkdir":
    case "chmod":
      return readOnly(cmd, rest);
    case "neofetch":
      return [
        "   ___      goben@pkn",
        "  /   \\     ---------",
        " | o o |    OS: PocketNugget 98",
        " |  ~  |    Kernel: 6.1.0-nugget",
        "  \\___/     Shell: bash (pretend)",
        "            Role: SOC/MDR analyst",
        "            Also: research, DevOps, software",
      ];
    case "cowsay":
      return COW(rest.join(" ") || "moo. i mean, hire goben.");
    case "fortune":
      return wrapText(FORTUNES[env.now.getSeconds() % FORTUNES.length] ?? "", width, 0);
    case "man": {
      const name = (rest[0] ?? "").toLowerCase();
      if (!name) return ["What manual page do you want? try: man cat"];
      const site = HELP.find((item) => item.cmd.split(" ")[0] === name);
      const text = site?.blurb ?? MAN[name];
      if (!text) return [`No manual entry for ${name}`];
      return [`${name.toUpperCase()}(1)`, ...wrapText(text, width - 7, 0).map((row) => `   ${row}`)];
    }
    default:
      return null;
  }
}
