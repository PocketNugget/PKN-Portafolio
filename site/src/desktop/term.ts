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
  private gone = false;

  constructor(
    host: HTMLElement,
    private readonly hooks: TermHost,
    start?: "snake" | "tetris",
  ) {
    host.classList.add("term-mount");
    host.innerHTML = `<pre class="dos" tabindex="0"></pre>
      <div class="play-stage" hidden>
        <div class="play-board"></div>
        <p class="play-status"></p>
      </div>
      <form class="term-line" autocomplete="off">
        <label for="term-cmd">goben@pkn:~$</label>
        <input id="term-cmd" name="cmd" spellcheck="false" autocapitalize="off" enterkeyhint="go" aria-label="Command" />
      </form>
      <div class="pad">
        <button type="button" data-key="ArrowLeft">Left</button>
        <button type="button" data-key="ArrowRight">Right</button>
        <button type="button" data-key="ArrowUp">Up</button>
        <button type="button" data-key="ArrowDown">Down</button>
        <button type="button" data-key=" ">Drop</button>
        <button type="button" data-key="Escape">Exit</button>
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
    host.querySelector(".pad")?.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      const key = button instanceof HTMLButtonElement ? button.dataset.key : "";
      if (key) this.onKey(key, false);
    });
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
    const hint = state.dead ? t("game over. esc leaves") : t("arrows move. esc leaves");
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
    const hint = state.over ? t("game over. esc leaves") : t("arrows, space drops, esc leaves");
    const hold = this.paused ? `  ${t("paused")}` : "";
    this.status.textContent = `${t("Score")} ${state.score}  ${t("Lines")} ${state.lines}  ${hint}${hold}`;
  }
}
