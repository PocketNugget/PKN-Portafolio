import { openTable } from "../catalog";
import { bash, BASH_COMMANDS, helpLines, listing } from "./bash";
import {
  applyCompletion,
  completions,
  histDown,
  histUp,
  parseCommand,
  pushHist,
} from "../shell";
import { t } from "../i18n";
import { mountBoard, type BoardHandle } from "./board";
import { createCycle, cycleAim, cyclePace, stepCycle, type CycleState } from "./cycle";
import { CYCLE_CELL, paintCycle } from "./cyclepaint";
import {
  createSnake,
  createTetris,
  snakeAim,
  snakeLevel,
  snakePace,
  snakeRender,
  stepSnake,
  tetrisActive,
  tetrisDown,
  tetrisGhost,
  tetrisHard,
  tetrisHold,
  tetrisLeft,
  tetrisLevel,
  tetrisPace,
  tetrisPreview,
  tetrisRender,
  tetrisRight,
  tetrisRotate,
  tetrisTick,
  type Dir,
  type Kind,
  type SnakeState,
  type TetrisState,
} from "./games";
import type { GameId } from "../scores";

const opens = openTable();
const openNames = Object.keys(opens);

const ARROWS: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

// WASD steers like the arrows, the way most browser games accept both.
const WASD: Record<string, string> = { w: "ArrowUp", a: "ArrowLeft", s: "ArrowDown", d: "ArrowRight" };

export interface TermHost {
  openPath: (href: string) => void;
  close: () => void;
}

type PlayMode = "snake" | "tetris" | "tron";
type Mode = "shell" | PlayMode;

const TITLES: Record<PlayMode, string> = { snake: "Snake", tetris: "Tetris", tron: "Tron" };

export class Terminal {
  private readonly pre: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly root: HTMLElement;
  private readonly stage: HTMLElement;
  private side: HTMLElement | null = null;
  private readonly board: HTMLElement;
  private readonly status: HTMLElement;
  private lines: string[] = [
    "PocketNugget terminal [Version 98.1]",
    "Type help for what each command does, or ls for the names. snake, tetris and tron run in this window.",
    "",
  ];
  private commandLog: string[] = [];
  private histIndex = -1;
  private draft = "";
  private mode: Mode = "shell";
  private snake: SnakeState | null = null;
  private tetris: TetrisState | null = null;
  private tron: CycleState | null = null;
  private scores: BoardHandle | null = null;
  private scoreGame: GameId | null = null;
  private pace = 0;
  private paused = false;
  private ready = false;
  private said = "";
  private held = false;
  private readonly over: HTMLElement;
  private readonly live: HTMLElement;
  private readonly onHide = () => {
    if (document.hidden && this.running()) {
      this.paused = true;
      this.paint();
    }
  };
  private timer = 0;
  private dasKey = "";
  private dasTimer = 0;
  private dasPulse = 0;
  private gone = false;

  constructor(
    host: HTMLElement,
    private readonly hooks: TermHost,
    start?: PlayMode,
  ) {
    host.classList.add("term-mount");
    host.innerHTML = `<pre class="dos" tabindex="0"></pre>
      <div class="play-stage" hidden>
        <div class="play-fit"><div class="play-board" role="img"></div>
          <div class="play-over window" hidden>
            <p class="play-over-title"></p>
            <p class="play-over-text"></p>
            <div class="play-over-act">
              <button type="button" class="play-over-go"></button>
              <button type="button" class="play-over-exit" data-key="Escape"></button>
            </div>
          </div>
          <aside class="tetris-side" hidden aria-hidden="true">
            <p class="side-title">Hold</p>
            <div class="mini" data-slot="hold"></div>
            <p class="side-title">Next</p>
            <div class="mini" data-slot="next0"></div>
            <div class="mini" data-slot="next1"></div>
            <div class="mini" data-slot="next2"></div>
          </aside>
        </div>
        <p class="play-status"></p>
        <p class="play-live" aria-live="polite"></p>
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
          <button type="button" data-key="c" data-role="hold">Hold</button>
          <button type="button" data-key="p">Pause</button>
          <button type="button" class="pad-again" data-key="Again" data-role="again">Again</button>
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
    this.side = host.querySelector(".tetris-side");
    this.board = board;
    this.status = status;
    const over = host.querySelector(".play-over");
    const live = host.querySelector(".play-live");
    if (!(over instanceof HTMLElement) || !(live instanceof HTMLElement)) throw new Error("terminal markup missing");
    this.over = over;
    this.live = live;
    over.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      const key = button instanceof HTMLButtonElement ? button.dataset.key : "";
      if (!key) return;
      this.onKey(key, false);
      if (this.inGame()) this.pre.focus();
    });
    document.addEventListener("visibilitychange", this.onHide);
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

  private finished(): boolean {
    return Boolean(this.snake?.dead || this.tetris?.over || this.tron?.dead || this.tron?.won);
  }

  private running(): boolean {
    return this.inGame() && !this.ready && !this.paused && !this.finished();
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
    this.syncPace();
  }

  destroy(): void {
    document.removeEventListener("visibilitychange", this.onHide);
    this.gone = true;
    this.stopLoop();
    this.stopDas();
    this.clearScores();
  }

  private touchPlay(): boolean {
    return window.matchMedia("(pointer: coarse), (max-width: 700px)").matches;
  }

  private labelPad(): void {
    const turn = this.mode === "tetris";
    this.root.classList.toggle("is-snake", this.mode === "snake");
    this.root.classList.toggle("is-tetris", turn);
    this.root.classList.toggle("is-cycle", this.mode === "tron");
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
    const titles = this.side?.querySelectorAll(".side-title");
    if (titles?.[0]) titles[0].textContent = t("Hold");
    if (titles?.[1]) titles[1].textContent = t("Next");
    const actions: Record<string, string> = { " ": "Drop", c: "Hold", p: "Pause", Again: "Again", Escape: "Exit" };
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(".pad-act button")) {
      const name = actions[button.dataset.key ?? ""];
      if (!name) continue;
      button.textContent = t(name);
      button.setAttribute("aria-label", t(name));
    }
  }

  private stopDas(): void {
    if (this.dasTimer) window.clearTimeout(this.dasTimer);
    if (this.dasPulse) window.clearInterval(this.dasPulse);
    this.dasTimer = 0;
    this.dasPulse = 0;
    this.dasKey = "";
  }

  private startDas(key: string): void {
    if (this.mode !== "tetris") return;
    if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowDown") return;
    this.stopDas();
    this.dasKey = key;
    this.dasTimer = window.setTimeout(() => {
      this.dasTimer = 0;
      if (this.dasKey !== key) return;
      this.nudge(key);
      this.dasPulse = window.setInterval(() => this.nudge(key), 35);
    }, 70);
  }

  private bindPad(pad: HTMLElement): void {
    let held = "";
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
      if (held) this.onKeyUp(held);
      held = key;
      this.onKey(key, false);
    });
    const end = () => {
      if (!held) return;
      const key = held;
      held = "";
      this.onKeyUp(key);
    };
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
  }

  private bindSwipe(stage: HTMLElement): void {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    stage.addEventListener("pointerdown", (event) => {
      if (!this.inGame() || !this.touchPlay()) return;
      if (event.target instanceof Element && event.target.closest("input, button, a, form")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
    });
    const flick = (dx: number, dy: number) => {
      if (Math.abs(dx) > Math.abs(dy)) this.onKey(dx > 0 ? "ArrowRight" : "ArrowLeft", false);
      else this.onKey(dy > 0 ? "ArrowDown" : "ArrowUp", false);
    };
    stage.addEventListener("pointermove", (event) => {
      if (!tracking) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;
      tracking = false;
      flick(dx, dy);
    });
    stage.addEventListener("pointerup", (event) => {
      if (!tracking) return;
      tracking = false;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) {
        if (this.mode === "tetris") this.onKey("ArrowUp", false);
        return;
      }
      flick(dx, dy);
    });
    stage.addEventListener("pointercancel", () => {
      tracking = false;
    });
  }

  onKey(raw: string, repeat: boolean): boolean {
    if (this.gone || this.mode === "shell") return false;
    const key = WASD[raw.toLowerCase()] ?? raw;
    if (key === "Escape") {
      this.endGame();
      return true;
    }
    if (key === "Again" || key === "r" || key === "R") {
      if (!repeat) {
        this.stopDas();
        this.begin(this.mode, false);
      }
      return true;
    }
    if (this.ready) {
      if (repeat) return true;
      const go = key === "Start" || key === "Enter" || key === " " || key in ARROWS;
      if (!go) return key === "p" || key === "P";
      this.ready = false;
      this.paint();
      this.syncPace();
      if (key === "Start" || key === "Enter" || key === " " || this.mode === "tetris") return true;
    }
    if (this.finished() && (key === "Enter" || key === "Start")) {
      if (!repeat) this.begin(this.mode, false);
      return true;
    }
    if (key === "p" || key === "P" || (this.paused && (key === "Enter" || key === "Start"))) {
      if (this.finished()) return true;
      this.paused = !this.paused;
      this.paint();
      return true;
    }
    if (this.paused || this.held) return true;
    if (this.snake && !this.snake.dead) {
      if (repeat) return true;
      const dir = ARROWS[key];
      if (!dir) return false;
      this.snake = snakeAim(this.snake, dir);
      return true;
    }
    if (this.tron && !this.tron.dead && !this.tron.won) {
      if (repeat) return true;
      const dir = ARROWS[key];
      if (!dir) return false;
      this.tron = cycleAim(this.tron, dir);
      return true;
    }
    if (this.tetris && !this.tetris.over) {
      if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowDown") {
        if (repeat) return true;
        this.nudge(key);
        this.startDas(key);
        return true;
      }
      if (repeat) return true;
      if (key === "ArrowUp") this.tetris = tetrisRotate(this.tetris);
      else if (key === " ") this.tetris = tetrisHard(this.tetris);
      else if (key === "c" || key === "C" || key === "Shift") this.tetris = tetrisHold(this.tetris);
      else return false;
      this.paint();
      if (this.tetris.over) this.stopLoop();
      return true;
    }
    return key.startsWith("Arrow") || key === " ";
  }

  onKeyUp(key: string): void {
    if (key === this.dasKey) this.stopDas();
  }

  private nudge(key: string): void {
    if (!this.tetris || this.tetris.over || this.paused || this.held || this.gone) return;
    if (key === "ArrowLeft") this.tetris = tetrisLeft(this.tetris);
    else if (key === "ArrowRight") this.tetris = tetrisRight(this.tetris);
    else if (key === "ArrowDown") this.tetris = tetrisDown(this.tetris);
    else return;
    this.paint();
    if (this.tetris.over) {
      this.stopLoop();
      this.stopDas();
    }
  }

  private onInputKey(event: KeyboardEvent): void {
    if (this.mode !== "shell") return;
    if (event.key === "Tab") {
      event.preventDefault();
      const matches = completions(this.input.value, openNames, BASH_COMMANDS);
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
    if (cmd === "tron") {
      this.begin("tron");
      return;
    }
    if (cmd === "help") {
      this.lines.push(...helpLines(this.cols()));
      this.paint();
      return;
    }
    if (cmd === "ls" && !/\s-/.test(line) && line.split(" ").length === 1) {
      this.lines.push(...listing(this.cols()));
      this.paint();
      return;
    }
    const said = bash(line, { now: new Date(), history: this.commandLog, cols: this.cols() });
    if (said) {
      this.lines.push(...said);
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

  private begin(mode: PlayMode, ready = true): void {
    this.mode = mode;
    this.paused = false;
    this.ready = ready;
    this.pace = 0;
    this.snake = mode === "snake" ? createSnake() : null;
    this.tetris = mode === "tetris" ? createTetris() : null;
    this.tron = mode === "tron" ? createCycle() : null;
    this.root.classList.add("playing");
    this.ensureScores(mode);
    this.labelPad();
    this.paint();
    this.pre.focus();
    this.syncPace();
  }

  private endGame(): void {
    this.stopLoop();
    this.stopDas();
    this.mode = "shell";
    this.snake = null;
    this.tetris = null;
    this.tron = null;
    this.pace = 0;
    this.paused = false;
    this.clearScores();
    this.root.classList.remove("playing");
    this.labelPad();
    this.lines.push("back at the prompt.");
    this.paint();
    if (matchMedia("(pointer: fine)").matches) this.input.focus();
  }

  private paceFor(): number {
    if (this.mode === "snake" && this.snake) return snakePace(snakeLevel(this.snake.score));
    if (this.mode === "tetris" && this.tetris) return tetrisPace(tetrisLevel(this.tetris.lines));
    if (this.mode === "tron" && this.tron) return cyclePace(this.tron.level);
    return 0;
  }

  private syncPace(): void {
    if (this.paused || this.held || this.gone || this.mode === "shell") return;
    const next = this.paceFor();
    if (next > 0 && (next !== this.pace || !this.timer)) this.startLoop(next);
  }

  private ensureScores(game: GameId): void {
    if (this.scoreGame === game && this.scores) return;
    this.clearScores();
    this.scoreGame = game;
    this.scores = mountBoard(this.over, game, this.over.querySelector(".play-over-act"));
  }

  private clearScores(): void {
    this.scores?.destroy();
    this.scores = null;
    this.scoreGame = null;
  }

  private tick(): void {
    if (this.paused || this.ready || this.held || this.gone) return;
    if (this.snake && !this.snake.dead) {
      this.snake = stepSnake(this.snake);
      this.paint();
      if (this.snake.dead) this.stopLoop();
      else this.syncPace();
    }
    if (this.tetris && !this.tetris.over) {
      this.tetris = tetrisTick(this.tetris);
      this.paint();
      if (this.tetris.over) this.stopLoop();
      else this.syncPace();
    }
    if (this.tron && !this.tron.dead && !this.tron.won) {
      this.tron = stepCycle(this.tron);
      this.paint();
      if (this.tron.dead || this.tron.won) this.stopLoop();
      else this.syncPace();
    }
  }

  private startLoop(ms: number): void {
    this.stopLoop();
    this.pace = ms;
    this.timer = window.setInterval(() => this.tick(), ms);
  }

  private stopLoop(): void {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
  }

  private paint(): void {
    const playing = this.mode !== "shell";
    this.stage.hidden = !playing;
    if (this.side) this.side.hidden = this.mode !== "tetris";
    this.pre.setAttribute("aria-hidden", playing ? "true" : "false");
    if (this.mode === "snake" && this.snake) {
      const extra = this.paused ? "\npaused" : "";
      this.pre.textContent = snakeRender(this.snake) + extra;
      this.drawSnake(this.snake);
    } else if (this.mode === "tetris" && this.tetris) {
      const extra = this.paused ? "\npaused" : "";
      this.pre.textContent = tetrisRender(this.tetris) + extra;
      this.drawTetris(this.tetris);
    } else if (this.mode === "tron" && this.tron) {
      this.pre.textContent = this.tron.won ? "clear" : this.tron.dead ? "game over" : "tron";
      this.drawCycle(this.tron);
    } else {
      this.paintShell();
    }
    this.pre.scrollTop = this.pre.scrollHeight;
    this.paintOverlay();
  }

  /** How many characters fit across the screen, so lists wrap to the window instead of scrolling sideways. */
  private cols(): number {
    const width = this.pre.clientWidth;
    if (width < 1) return 80;
    const probe = document.createElement("span");
    probe.className = "term-probe";
    probe.textContent = "0".repeat(20);
    this.pre.append(probe);
    const char = probe.getBoundingClientRect().width / 20;
    probe.remove();
    if (!(char > 0)) return 80;
    const style = getComputedStyle(this.pre);
    const pad = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    return Math.max(24, Math.floor((width - pad) / char) - 1);
  }

  private paintShell(): void {
    const frag = document.createDocumentFragment();
    for (const text of this.lines) {
      const row = document.createElement("div");
      row.className = "t-line";
      const prompt = /^goben@pkn:~\$ /.exec(text);
      if (prompt) {
        const who = document.createElement("span");
        who.className = "t-prompt";
        who.textContent = prompt[0];
        const typed = document.createElement("span");
        typed.className = "t-cmd";
        typed.textContent = text.slice(prompt[0].length);
        row.append(who, typed);
      } else {
        row.textContent = text || "\u00a0";
        if (/command not found|^open: |No such file|read-only|not in the sudoers|nice try/.test(text)) row.classList.add("t-err");
        else if (/^(site commands|bash-style commands)$/.test(text)) row.classList.add("t-head");
      }
      frag.append(row);
    }
    this.pre.replaceChildren(frag);
  }

  private score(): number {
    return this.snake?.score ?? this.tetris?.score ?? this.tron?.score ?? 0;
  }

  private paintOverlay(): void {
    const pause = this.root.querySelector<HTMLButtonElement>(".pad-act button[data-key='p']");
    if (pause) {
      pause.textContent = t(this.paused ? "Resume" : "Pause");
      pause.setAttribute("aria-label", pause.textContent);
      pause.setAttribute("aria-pressed", String(this.paused));
    }
    if (this.mode === "shell") {
      this.over.hidden = true;
      this.say("");
      return;
    }
    this.board.setAttribute("aria-label", `${TITLES[this.mode]}. ${t("Score")} ${this.score()}`);
    const title = this.over.querySelector(".play-over-title");
    const text = this.over.querySelector(".play-over-text");
    const go = this.over.querySelector<HTMLButtonElement>(".play-over-go");
    const exit = this.over.querySelector<HTMLButtonElement>(".play-over-exit");
    if (!title || !text || !go || !exit) return;
    exit.textContent = t("Exit");
    const touch = this.touchPlay();
    let state = "";
    if (this.ready) {
      state = "ready";
      title.textContent = TITLES[this.mode];
      text.textContent = touch
        ? t(this.mode === "tetris" ? "Swipe or use the buttons. Tap the board to turn." : "Swipe or use the buttons to steer.")
        : t(this.mode === "tetris" ? "Arrows or WASD move. Up turns, space drops. P pauses, R restarts." : "Arrows or WASD steer. P pauses, R restarts.");
      if (this.mode === "tetris") text.textContent += ` ${t("C holds a piece. The next three are on the right.")}`;
      go.textContent = t("Play");
      go.dataset.key = "Start";
    } else if (this.finished()) {
      state = "over";
      title.textContent = this.tron?.won ? t("You cleared the grid.") : t("Game over");
      text.textContent = `${t("Score")} ${this.score()}`;
      go.textContent = t("Play again");
      go.dataset.key = "Again";
    } else if (this.paused) {
      state = "paused";
      title.textContent = t("Paused");
      text.textContent = `${t("Score")} ${this.score()}`;
      go.textContent = t("Resume");
      go.dataset.key = "p";
    }
    this.over.hidden = !state;
    this.over.dataset.state = state;
    if (state === "over") this.say(`${title.textContent} ${text.textContent}`);
    else if (state === "paused") this.say(t("Paused"));
    else if (state === "ready") this.say(`${TITLES[this.mode]}. ${text.textContent}`);
    else this.say("");
  }

  private say(message: string): void {
    if (message === this.said) return;
    this.said = message;
    if (message) this.live.textContent = message;
  }

  private cells(count: number): HTMLElement[] {
    this.board.querySelector("canvas")?.remove();
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
      ? t("game over. r restarts. esc leaves")
      : this.touchPlay()
        ? t("buttons move. r restarts. exit leaves")
        : t("arrows move. r restarts. esc leaves");
    const hold = this.paused ? `  ${t("paused")}` : "";
    const level = snakeLevel(state.score);
    this.status.textContent = `${t("Score")} ${state.score}  ${t("Level")} ${level}  ${hint}${hold}`;
    this.scores?.setOffer(state.score, level, state.dead);
  }

  /** A 4 by 4 box that shows one piece. Used for Hold and for the next three. */
  private paintMini(slot: string, kind: Kind | null, dim: boolean): void {
    const box = this.side?.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
    if (!box) return;
    while (box.childElementCount < 16) {
      const cell = document.createElement("span");
      cell.className = "play-cell";
      box.append(cell);
    }
    const on = new Set((kind ? tetrisPreview(kind) : []).map((cell) => cell.y * 4 + cell.x));
    box.classList.toggle("is-dim", dim);
    [...box.children].forEach((node, index) => {
      const want = on.has(index) ? `play-cell k${kind}` : "play-cell";
      if (node.className !== want) node.className = want;
    });
  }

  private drawTetris(state: TetrisState): void {
    this.board.className = "play-board tetris";
    this.board.style.aspectRatio = `${state.width} / ${state.height}`;
    const active = new Set(tetrisActive(state).map((cell) => `${cell.x},${cell.y}`));
    const ghost = new Set(tetrisGhost(state).map((cell) => `${cell.x},${cell.y}`));
    const tiles = this.cells(state.width * state.height);
    for (let index = 0; index < tiles.length; index += 1) {
      const x = index % state.width;
      const y = Math.floor(index / state.width);
      const tile = tiles[index];
      if (!tile) continue;
      const falling = active.has(`${x},${y}`);
      if (falling) tile.className = `play-cell k${state.kind}`;
      else if (state.grid[index]) tile.className = "play-cell locked";
      else if (ghost.has(`${x},${y}`)) tile.className = "play-cell ghost";
      else tile.className = "play-cell";
    }
    const hint = state.over
      ? t("game over. r restarts. esc leaves")
      : this.touchPlay()
        ? t("buttons move. turn and drop. r restarts. exit leaves")
        : t("arrows, space drops. r restarts. esc leaves");
    const hold = this.paused ? `  ${t("paused")}` : "";
    const level = tetrisLevel(state.lines);
    const next = state.queue[0] ? `  ${t("Next")} ${state.queue.slice(0, 3).join(" ")}` : "";
    const held = state.hold ? `  ${t("Hold")} ${state.hold}` : "";
    this.paintMini("hold", state.hold, !state.canHold);
    for (let slot = 0; slot < 3; slot += 1) this.paintMini(`next${slot}`, state.queue[slot] ?? null, false);
    this.status.textContent = `${t("Score")} ${state.score}  ${t("Lines")} ${state.lines}  ${t("Level")} ${level}${next}${held}  ${hint}${hold}`;
    this.scores?.setOffer(state.score, level, state.over);
  }

  private drawCycle(state: CycleState): void {
    this.board.className = "play-board cycle";
    let canvas = this.board.querySelector("canvas");
    if (!canvas) {
      this.board.replaceChildren();
      canvas = document.createElement("canvas");
      canvas.className = "play-canvas";
      this.board.append(canvas);
    }
    const size = CYCLE_CELL;
    if (canvas.width !== state.width * size) {
      canvas.width = state.width * size;
      canvas.height = state.height * size;
    }
    const ctx = canvas.getContext("2d");
    if (ctx) paintCycle(ctx, state, size);
    const hint = state.won
      ? t("You cleared the grid.")
      : state.dead
        ? t("game over. r restarts. esc leaves")
        : state.fresh > 0
          ? t(state.rounds > 0 && state.foes.every((foe) => foe.alive) ? "Round cleared. The next grid is faster." : "A bike crashed.")
          : this.touchPlay()
            ? t("buttons move. r restarts. exit leaves")
            : t("arrows move. r restarts. esc leaves");
    const hold = this.paused ? `  ${t("paused")}` : "";
    this.status.textContent = `${t("Score")} ${state.score}  ${t("Level")} ${state.level}  ${hint}${hold}`;
    this.scores?.setOffer(state.score, state.level, state.dead || state.won);
  }
}
