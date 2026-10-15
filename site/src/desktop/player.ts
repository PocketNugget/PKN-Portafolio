import type { DeskApp } from "./host";

interface Note {
  f: number;
  d: number;
}

interface Track {
  title: string;
  notes: Note[];
}

const BEAT = 0.24;
const C4 = 261.63;

function tune(steps: number[]): Note[] {
  const phrase = steps.map((semi) => ({
    f: Math.round(C4 * 2 ** (semi / 12)),
    d: BEAT,
  }));
  return [...phrase, ...phrase];
}

/** Original square-wave patterns. No commercial recordings. */
export const TRACKS: Track[] = [
  { title: "Boot chime", notes: tune([0, 4, 7, 12, 7, 4, 0, 12]) },
  { title: "Night shift", notes: tune([0, 0, 3, 5, 7, 5, 3, 0, 10, 7, 5, 3]) },
  { title: "Nugget walk", notes: tune([0, 7, 4, 7, 12, 7, 4, 0, 2, 4, 7, 4]) },
  { title: "Lab server", notes: tune([12, 7, 4, 0, 4, 7, 12, 7, 9, 7, 4, 0]) },
];

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const min = Math.floor(safe / 60);
  const sec = String(safe % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export function mountPlayer(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "player";
  const lcd = document.createElement("div");
  lcd.className = "lcd";
  const title = document.createElement("div");
  title.className = "lcd-title";
  const barWrap = document.createElement("div");
  barWrap.className = "progress-indicator";
  barWrap.setAttribute("role", "progressbar");
  barWrap.setAttribute("aria-label", "Position");
  const bar = document.createElement("span");
  bar.className = "progress-indicator-bar";
  barWrap.append(bar);
  const time = document.createElement("div");
  time.className = "lcd-time";
  lcd.append(title, barWrap, time);

  const controls = document.createElement("div");
  controls.className = "field-row player-controls";
  const prev = button("Prev");
  const play = button("Play");
  const stopBtn = button("Stop");
  const next = button("Next");
  const volLabel = document.createElement("label");
  volLabel.className = "vol";
  volLabel.textContent = "Vol ";
  const vol = document.createElement("input");
  vol.type = "range";
  vol.min = "0";
  vol.max = "100";
  vol.value = "55";
  vol.setAttribute("aria-label", "Volume");
  volLabel.append(vol);
  controls.append(prev, play, stopBtn, next, volLabel);

  const list = document.createElement("ul");
  list.className = "playlist";
  root.append(lcd, controls, list);
  host.append(root);

  let index = 0;
  let userPlaying = false;
  let playing = false;
  let dead = false;
  let volume = 0.11;
  let length = trackSeconds(0);
  let clockAt = 0;
  let stamp = 0;
  let raf = 0;
  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;
  const nodes: OscillatorNode[] = [];

  const rows: HTMLButtonElement[] = TRACKS.map((track, trackIndex) => {
    const item = document.createElement("li");
    const row = document.createElement("button");
    row.type = "button";
    row.className = "track";
    row.textContent = `${trackIndex + 1}. ${track.title}`;
    row.addEventListener("click", () => {
      const keep = userPlaying;
      index = trackIndex;
      quiet();
      paint();
      if (keep) void startAt(0);
    });
    item.append(row);
    list.append(item);
    return row;
  });

  function paint(): void {
    const track = TRACKS[index];
    title.textContent = track ? track.title : "Player";
    play.textContent = userPlaying ? "Pause" : "Play";
    rows.forEach((row, rowIndex) => row.classList.toggle("on", rowIndex === index));
    const now = Math.max(0, shown());
    const pct = length > 0 ? Math.min(100, (now / length) * 100) : 0;
    bar.style.width = `${pct}%`;
    time.textContent = `${formatTime(now)} / ${formatTime(length)}`;
  }

  function shown(): number {
    if (!playing) return clockAt;
    return clockAt + (performance.now() - stamp) / 1000;
  }

  function trackSeconds(i: number): number {
    const track = TRACKS[i];
    if (!track) return 1;
    return Math.max(0.1, track.notes.reduce((sum, note) => sum + note.d, 0));
  }

  function stopNodes(): void {
    for (const node of nodes) {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
      node.disconnect();
    }
    nodes.length = 0;
  }

  function ensure(): boolean {
    if (ctx && gain) return true;
    const Ctx = window.AudioContext;
    if (!Ctx) return false;
    try {
      ctx = new Ctx();
      gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);
      return true;
    } catch {
      ctx = null;
      gain = null;
      return false;
    }
  }

  function schedule(): void {
    if (!ctx || !gain || ctx.state !== "running") return;
    stopNodes();
    const track = TRACKS[index];
    if (!track) return;
    let cursor = ctx.currentTime + 0.02;
    for (const note of track.notes) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = note.f;
      osc.connect(gain);
      osc.start(cursor);
      osc.stop(cursor + Math.max(0.03, note.d * 0.85));
      nodes.push(osc);
      cursor += note.d;
    }
  }

  function tick(): void {
    if (dead || !playing) return;
    if (shown() >= length) {
      if (index >= TRACKS.length - 1) {
        userPlaying = false;
        quiet();
        paint();
        return;
      }
      index += 1;
      length = trackSeconds(index);
      clockAt = 0;
      stamp = performance.now();
      schedule();
    }
    paint();
    raf = window.requestAnimationFrame(tick);
  }

  async function startAt(offset: number): Promise<void> {
    if (dead) return;
    userPlaying = true;
    playing = true;
    length = trackSeconds(index);
    clockAt = offset;
    stamp = performance.now();
    if (ensure() && ctx) {
      if (ctx.state === "suspended") await ctx.resume();
      if (dead) return;
      if (offset === 0) schedule();
    }
    if (raf) window.cancelAnimationFrame(raf);
    tick();
    paint();
  }

  function quiet(): void {
    playing = false;
    clockAt = 0;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    stopNodes();
    bar.style.width = "0%";
  }

  function hold(): void {
    clockAt = shown();
    playing = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    if (ctx && ctx.state === "running") void ctx.suspend();
  }

  prev.addEventListener("click", () => {
    const keep = userPlaying;
    index = (index - 1 + TRACKS.length) % TRACKS.length;
    userPlaying = false;
    quiet();
    paint();
    if (keep) void startAt(0);
  });
  next.addEventListener("click", () => {
    const keep = userPlaying;
    index = (index + 1) % TRACKS.length;
    userPlaying = false;
    quiet();
    paint();
    if (keep) void startAt(0);
  });
  play.addEventListener("click", () => {
    if (userPlaying) {
      userPlaying = false;
      hold();
      paint();
      return;
    }
    void startAt(clockAt);
  });
  stopBtn.addEventListener("click", () => {
    userPlaying = false;
    quiet();
    paint();
  });
  vol.addEventListener("input", () => {
    volume = (Number(vol.value) / 100) * 0.2;
    if (gain) gain.gain.value = volume;
  });

  paint();

  return {
    pause() {
      hold();
    },
    resume() {
      if (!userPlaying || dead) return;
      void startAt(clockAt);
    },
    destroy() {
      dead = true;
      userPlaying = false;
      quiet();
      void ctx?.close();
      ctx = null;
      gain = null;
    },
  };
}

function button(label: string): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  return el;
}
