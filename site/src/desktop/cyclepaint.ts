import type { Dir, Point } from "./games";
import type { CycleState } from "./cycle";

/** Canvas pixels per grid cell. The canvas is scaled by CSS to the window. */
export const CYCLE_CELL = 16;

const BIKES = [
  { line: "#2df3ff", body: "#062a3a" },
  { line: "#ff3df0", body: "#3a0638" },
  { line: "#ffb020", body: "#3a2400" },
];

const TURN: Record<Dir, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };

function center(point: Point, size: number): [number, number] {
  return [point.x * size + size / 2, point.y * size + size / 2];
}

function trailLine(ctx: CanvasRenderingContext2D, corners: Point[], head: Point, size: number, color: string): void {
  if (corners.length === 0) return;
  ctx.beginPath();
  corners.forEach((point, index) => {
    const [x, y] = center(point, size);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  const [hx, hy] = center(head, size);
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.shadowBlur = 0;
}

/** A light cycle seen from above: a long body, a wheel at each end, and a bright canopy. */
function bike(ctx: CanvasRenderingContext2D, at: Point, dir: Dir, size: number, color: string, body: string): void {
  const [x, y] = center(at, size);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(TURN[dir]);
  const length = size * 2.6;
  const width = size * 1.1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = body;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(length * 0.5, 0);
  ctx.lineTo(length * 0.18, -width * 0.5);
  ctx.lineTo(-length * 0.5, -width * 0.38);
  ctx.lineTo(-length * 0.5, width * 0.38);
  ctx.lineTo(length * 0.18, width * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillRect(length * 0.28, -width * 0.18, length * 0.12, width * 0.36);
  ctx.fillRect(-length * 0.3, -width * 0.12, length * 0.4, width * 0.24);
  ctx.restore();
}

function backdrop(ctx: CanvasRenderingContext2D, state: CycleState, size: number): void {
  const w = state.width * size;
  const h = state.height * size;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#12002e");
  sky.addColorStop(0.55, "#2a0a5a");
  sky.addColorStop(1, "#4a0f6e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w / 2, h, 10, w / 2, h, h * 0.9);
  glow.addColorStop(0, "rgba(255,61,240,0.30)");
  glow.addColorStop(1, "rgba(255,61,240,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(45,243,255,0.22)";
  ctx.beginPath();
  for (let x = 0; x <= state.width; x += 4) {
    ctx.moveTo(x * size + 0.5, 0);
    ctx.lineTo(x * size + 0.5, h);
  }
  for (let y = 0; y <= state.height; y += 4) {
    ctx.moveTo(0, y * size + 0.5);
    ctx.lineTo(w, y * size + 0.5);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,61,240,0.9)";
  ctx.shadowColor = "#ff3df0";
  ctx.shadowBlur = 14;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.shadowBlur = 0;
}

function scanlines(ctx: CanvasRenderingContext2D, state: CycleState, size: number): void {
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let y = 0; y < state.height * size; y += 4) ctx.fillRect(0, y, state.width * size, 1);
}

export function paintCycle(ctx: CanvasRenderingContext2D, state: CycleState, size: number): void {
  ctx.clearRect(0, 0, state.width * size, state.height * size);
  backdrop(ctx, state, size);

  const heads: { at: Point; dir: Dir; alive: boolean; style: (typeof BIKES)[number] }[] = [];
  const you = BIKES[0];
  if (you) heads.push({ at: state.you, dir: state.youDir, alive: !state.dead, style: you });
  state.foes.forEach((foe, index) => {
    const style = BIKES[index + 1];
    if (style) heads.push({ at: foe.pos, dir: foe.dir, alive: foe.alive, style });
  });
  heads.forEach((entry, index) => {
    const corners = state.corners[index];
    if (corners && corners.length > 0) trailLine(ctx, corners, entry.at, size, entry.style.line);
  });
  heads.forEach((entry, index) => {
    if (entry.alive) {
      bike(ctx, entry.at, entry.dir, size, entry.style.line, entry.style.body);
      return;
    }
    if (index > 0 && state.fresh <= 0) return;
    const [x, y] = center(entry.at, size);
    const spread = index > 0 ? (12 - state.fresh) / 12 : 0.4;
    ctx.strokeStyle = entry.style.line;
    ctx.shadowColor = entry.style.line;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size * (0.8 + spread * 2.4), 0, Math.PI * 2);
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
  scanlines(ctx, state, size);
}
