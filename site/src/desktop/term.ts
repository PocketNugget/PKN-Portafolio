import { openTable } from "../catalog";
import {
  applyCompletion,
  completions,
  HELP,
  histDown,
  histUp,
  parseCommand,
  pushHist,
} from "../shell";
import { t } from "../i18n";
import {
  createSnake,
  createTetris,
  snakeAim,
  snakeRender,
  stepSnake,
  tetrisActive,
  tetrisDown,
  tetrisHard,
  tetrisLeft,
  tetrisRender,
  tetrisRight,
  tetrisRotate,
  tetrisTick,
  type Dir,
  type SnakeState,
  type TetrisState,
} from "./games";

const opens = openTable();
const openNames = Object.keys(opens);

const ARROWS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export interface TermHost {
  openPath: (href: string) => void;
  close: () => void;
}

type Mode = "shell" | "snake" | "tetris";

export class Terminal {
  private readonly pre: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly root: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly board: HTMLElement;
  private readonly status: HTMLElement;
  private lines: string[] = [
    "PocketNugget terminal",
    "help lists commands. snake and tetris run in this window.",
    "",
  ];
  private commandLog: string[] = [];
  private histIndex = -1;
  private draft = "";
  private mode: Mode = "shell";
  private snake: SnakeState | null = null;
  private tetris: TetrisState | null = null;
  private paused = false;
  private held = false;
  private timer = 0;
  private holdWait = 0;
  private holdPulse = 0;
  private gone = false;

  constructor(
    host: HTMLElement,
    private readonly hooks: TermHost,
    start?: "snake" | "tetris",
  ) {
    host.classList.add("term-mount");
    host.innerHTML = `<pre class="dos" tabindex="0"></pre>
      <div class="play-stage" hidden>
        <div class="play-fit"><div class="play-board"></div></div>
        <p class="play-status"></p>
      </div>
      <form class="term-line" autocomplete="off">
        <label for="term-cmd">goben@pkn:~$</label>
        <input id="term-cmd" name="cmd" spellcheck="false" autocapitalize="off" enterkeyhint="go" aria-label="Command" />
      </form>
      <div class="pad">
        <div class="pad-move">
          <button type="button" class="pad-up" data-key="ArrowUp" data-role="up">↑</button>
          <button type="button" class="pad-left" data-key="ArrowLeft">←</button>
          <button type="button" class="pad-down" data-key="ArrowDown">↓</button>
          <button type="button" class="pad-right" data-key="ArrowRight">→</button>
        </div>
        <div class="pad-act">
          <button type="button" data-key=" " data-role="drop">Drop</button>
          <button type="button" data-key="p">Pause</button>
          <button type="button" class="pad-exit" data-key="Escape">Exit</button>
        </div>
      </div>`;
    const pre = host.querySelector("pre");
    const input = host.querySelector("input");
    const form = host.querySelector("form");
    const stage = host.querySelector(".play-stage");
    const board = host.querySelector(".play-board");
    const status = host.querySelector(".play-status");
    if (
      !(pre instanceof HTMLElement) ||
      !(input instanceof HTMLInputElement) ||
      !(form instanceof HTMLFormElement) ||
      !(stage instanceof HTMLElement) ||
      !(board instanceof HTMLElement) ||
      !(status instanceof HTMLElement)
    ) {
      throw new Error("terminal markup missing");
    }
    this.pre = pre;
    this.input = input;
    this.root = host;
    this.stage = stage;
    this.board = board;
    this.status = status;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value;
      input.value = "";
      this.run(value);
    });
    input.addEventListener("keydown", (event) => this.onInputKey(event));
    pre.addEventListener("pointerdown", () => {
      if (!this.inGame() && matchMedia("(pointer: fine)").matches) input.focus();
    });
    const pad = host.querySelector(".pad");
    if (pad instanceof HTMLElement) this.bindPad(pad);
    this.bindSwipe(this.stage);
    this.labelPad();
    this.paint();
    if (start) this.begin(start);
  }

  inGame(): boolean {
    return this.mode !== "shell";
  }

  focusInput(): void {
    if (!this.gone && !this.inGame()) this.input.focus();
  }

  focusBoard(): void {
    if (!this.gone) this.pre.focus();
  }

  pause(): void {
    this.held = true;
    this.stopLoop();
  }

  resume(): void {
    this.held = false;
    if (this.mode === "snake") this.startLoop(140);
    if (this.mode === "tetris") this.startLoop(480);
  }

  destroy(): void {
    this.gone = true;
    this.stopLoop();
    this.stopHold();
  }

  private touchPlay(): boolean {
    return window.matchMedia("(pointer: coarse), (max-width: 700px)").matches;
  }

  private labelPad(): void {
    const turn = this.mode === "tetris";
    this.root.classList.toggle("is-snake", this.mode === "snake");
    this.root.classList.toggle("is-tetris", turn);
    const up = this.root.querySelector("[data-role='up']");
    if (up instanceof HTMLButtonElement) {
      up.textContent = turn ? "↻" : "↑";
      up.setAttribute("aria-label", t(turn ? "Turn" : "Up"));
    }
    const named: Record<string, string> = {
      ArrowLeft: "Left",
      ArrowDown: "Down",
      ArrowRight: "Right",
    };
    const glyphs: Record<string, string> = {
      ArrowLeft: "←",
      ArrowDown: "↓",
      ArrowRight: "→",
    };
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(".pad-move button")) {
      const key = button.dataset.key ?? "";
      const name = named[key];
      if (!name) continue;
      button.textContent = glyphs[key] ?? "";
      button.setAttribute("aria-label", name ? t(name) : "");
    }
    const actions: Record<string, string> = { " ": "Drop", p: "Pause", Escape: "Exit" };
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(".pad-act button")) {
      const name = actions[button.dataset.key ?? ""];
      if (!name) continue;
      button.textContent = t(name);
      button.setAttribute("aria-label", t(name));
    }
  }

  private stopHold(): void {
    if (this.holdWait) window.clearTimeout(this.holdWait);
    if (this.holdPulse) window.clearInterval(this.holdPulse);
    this.holdWait = 0;
    this.holdPulse = 0;
  }

  private bindPad(pad: HTMLElement): void {
    pad.addEventListener("pointerdown", (event) => {
      if (!this.inGame()) return;
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!(button instanceof HTMLButtonElement)) return;
      const key = button.dataset.key ?? "";
      if (!key) return;
      event.preventDefault();
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        /* the pointer can already be gone */
      }
      this.onKey(key, false);
      this.stopHold();
      const repeat =
        this.mode === "tetris" && (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowDown");
      if (!repeat) return;
      this.holdWait = window.setTimeout(() => {
        this.holdWait = 0;
        this.holdPulse = window.setInterval(() => this.onKey(key, true), 80);
      }, 160);
    });
    const end = () => this.stopHold();
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
  }

  private bindSwipe(stage: HTMLElement): void {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    stage.addEventListener("pointerdown", (event) => {
      if (!this.inGame() || !this.touchPlay()) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
    });
    stage.addEventListener("pointerup", (event) => {
      if (!tracking) return;
      tracking = false;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const reach = Math.max(Math.abs(dx), Math.abs(dy));
      if (reach < 24) {
        if (this.mode === "tetris") this.onKey("ArrowUp", false);
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) this.onKey(dx > 0 ? "ArrowRight" : "ArrowLeft", false);
      else this.onKey(dy > 0 ? "ArrowDown" : "ArrowUp", false);
    });
    stage.addEventListener("pointercancel", () => {
      tracking = false;
    });
  }

  onKey(key: string, repeat: boolean): boolean {
    if (this.gone || this.mode === "shell") return false;
    if (key === "Escape") {
      this.endGame();
      return true;
    }
    if (key === "p" || key === "P") {
      this.paused = !this.paused;
      this.paint();
      return true;
    }
    if (this.paused || this.held) return true;
    if (this.snake && !this.snake.dead) {
      const dir = ARROWS[key];
      if (!dir) return false;
      this.snake = snakeAim(this.snake, dir);
      return true;
    }
    if (this.tetris && !this.tetris.over) {
      if (repeat && (key === "ArrowUp" || key === " ")) return true;
      if (key === "ArrowLeft") this.tetris = tetrisLeft(this.tetris);
      else if (key === "ArrowRight") this.tetris = tetrisRight(this.tetris);
      else if (key === "ArrowDown") this.tetris = tetrisDown(this.tetris);
      else if (key === "ArrowUp") this.tetris = tetrisRotate(this.tetris);
      else if (key === " ") this.tetris = tetrisHard(this.tetris);
      else return false;
      this.paint();
      if (this.tetris.over) this.stopLoop();
      return true;
    }
    return key.startsWith("Arrow") || key === " ";
  }

  private onInputKey(event: KeyboardEvent): void {
    if (this.mode !== "shell") return;
    if (event.key === "Tab") {
      event.preventDefault();
      const matches = completions(this.input.value, openNames);
      if (matches.length === 1) {
        this.input.value = applyCompletion(this.input.value, matches);
        return;
      }
      if (matches.length > 1) {
        this.lines.push(matches.slice(0, 14).join("  "));
        this.paint();
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = histUp(this.commandLog, this.histIndex, this.draft, this.input.value);
      this.histIndex = next.index;
      this.draft = next.draft;
      this.input.value = next.value;
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = histDown(this.commandLog, this.histIndex, this.draft);
      this.histIndex = next.index;
      this.draft = next.draft;
      this.input.value = next.value;
    }
  }

  private run(raw: string): void {
    const line = raw.replace(/\s+/g, " ").trim();
    this.lines.push(`goben@pkn:~$ ${line}`);
    if (this.lines.length > 200) this.lines.splice(0, this.lines.length - 200);
    if (!line) {
      this.paint();
      return;
    }
    this.commandLog = pushHist(this.commandLog, line);
    this.histIndex = -1;
    this.draft = "";
    const cmd = (line.split(" ")[0] ?? "").toLowerCase();
    if (cmd === "clear") {
      this.lines = [];
      this.paint();
      return;
    }
    if (cmd === "exit") {
      this.hooks.close();
      return;
    }
    if (cmd === "snake") {
      this.begin("snake");
      return;
    }
    if (cmd === "tetris") {
      this.begin("tetris");
      return;
    }
    if (cmd === "help") {
      for (const item of HELP) this.lines.push(`${item.cmd.padEnd(18)}${item.blurb}`);
      this.paint();
      return;
    }
    const step = parseCommand(line, opens);
    if (step.type === "error") {
      this.lines.push(step.message);
      this.paint();
      return;
    }
    if (step.type === "external") {
      this.lines.push(step.href);
      this.paint();
      location.assign(step.href);
      return;
    }
    if (step.type === "nav") {
      this.lines.push(`opened ${step.echo}`);
      this.paint();
      this.hooks.openPath(step.path);
    }
  }

  private begin(mode: "snake" | "tetris"): void {
    this.mode = mode;
    this.paused = false;
    this.snake = mode === "snake" ? createSnake() : null;
    this.tetris = mode === "tetris" ? createTetris() : null;
    this.root.classList.add("playing");
    this.labelPad();
    this.paint();
    this.pre.focus();
    this.startLoop(mode === "snake" ? 140 : 480);
  }

  private endGame(): void {
    this.stopLoop();
    this.mode = "shell";
    this.snake = null;
    this.tetris = null;
    this.paused = false;
    this.root.classList.remove("playing");
    this.labelPad();
    this.lines.push("back at the prompt.");
    this.paint();
    if (matchMedia("(pointer: fine)").matches) this.input.focus();
  }

  private tick(): void {
    if (this.paused || this.held || this.gone) return;
    if (this.snake && !this.snake.dead) {
      this.snake = stepSnake(this.snake);
      this.paint();
      if (this.snake.dead) this.stopLoop();
    }
    if (this.tetris && !this.tetris.over) {
      this.tetris = tetrisTick(this.tetris);
      this.paint();
      if (this.tetris.over) this.stopLoop();
    }
  }

  private startLoop(ms: number): void {
    this.stopLoop();
    this.timer = window.setInterval(() => this.tick(), ms);
  }

  private stopLoop(): void {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
  }

  private paint(): void {
    const playing = this.mode !== "shell";
    this.stage.hidden = !playing;
    this.pre.setAttribute("aria-hidden", playing ? "true" : "false");
    if (this.mode === "snake" && this.snake) {
      const extra = this.paused ? "\npaused" : "";
      this.pre.textContent = snakeRender(this.snake) + extra;
      this.drawSnake(this.snake);
    } else if (this.mode === "tetris" && this.tetris) {
      const extra = this.paused ? "\npaused" : "";
      this.pre.textContent = tetrisRender(this.tetris) + extra;
      this.drawTetris(this.tetris);
    } else {
      this.pre.textContent = this.lines.join("\n");
    }
    this.pre.scrollTop = this.pre.scrollHeight;
  }

  private cells(count: number): HTMLElement[] {
    while (this.board.childElementCount < count) {
      const cell = document.createElement("span");
      cell.className = "play-cell";
      this.board.append(cell);
    }
    while (this.board.childElementCount > count) this.board.lastElementChild?.remove();
    return [...this.board.children].filter((node): node is HTMLElement => node instanceof HTMLElement);
  }

  private drawSnake(state: SnakeState): void {
    this.board.className = "play-board snake";
    this.board.style.aspectRatio = `${state.width} / ${state.height}`;
    const head = state.body[0];
    const rest = new Set(state.body.slice(1).map((point) => `${point.x},${point.y}`));
    const tiles = this.cells(state.width * state.height);
    for (let index = 0; index < tiles.length; index += 1) {
      const x = index % state.width;
      const y = Math.floor(index / state.width);
      const tile = tiles[index];
      if (!tile) continue;
      if (head && head.x === x && head.y === y) tile.className = "play-cell head";
      else if (rest.has(`${x},${y}`)) tile.className = "play-cell on";
      else if (state.food.x === x && state.food.y === y) tile.className = "play-cell food";
      else tile.className = "play-cell";
    }
    const hint = state.dead
      ? t("game over. esc leaves")
      : this.touchPlay()
        ? t("buttons move. exit leaves")
        : t("arrows move. esc leaves");
    const hold = this.paused ? `  ${t("paused")}` : "";
    this.status.textContent = `${t("Score")} ${state.score}  ${hint}${hold}`;
  }

  private drawTetris(state: TetrisState): void {
    this.board.className = "play-board tetris";
    this.board.style.aspectRatio = `${state.width} / ${state.height}`;
    const active = new Set(tetrisActive(state).map((cell) => `${cell.x},${cell.y}`));
    const tiles = this.cells(state.width * state.height);
    for (let index = 0; index < tiles.length; index += 1) {
      const x = index % state.width;
      const y = Math.floor(index / state.width);
      const tile = tiles[index];
      if (!tile) continue;
      const falling = active.has(`${x},${y}`);
      if (falling) tile.className = `play-cell k${state.kind}`;
      else if (state.grid[index]) tile.className = "play-cell locked";
      else tile.className = "play-cell";
    }
    const hint = state.over
      ? t("game over. esc leaves")
      : this.touchPlay()
        ? t("buttons move. turn and drop. exit leaves")
        : t("arrows, space drops, esc leaves");
    const hold = this.paused ? `  ${t("paused")}` : "";
    this.status.textContent = `${t("Score")} ${state.score}  ${t("Lines")} ${state.lines}  ${hint}${hold}`;
  }
}
