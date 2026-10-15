// Byte-mode QR, error correction M, versions 1 to 6. Format bits are the masked table from ISO 18004.

const FORMAT_M = [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0];

const SPECS = [
  { ecc: 10, blocks: [[1, 16]] as const, data: 16 },
  { ecc: 16, blocks: [[1, 28]] as const, data: 28 },
  { ecc: 26, blocks: [[1, 44]] as const, data: 44 },
  { ecc: 18, blocks: [[2, 32]] as const, data: 64 },
  { ecc: 24, blocks: [[2, 43]] as const, data: 86 },
  { ecc: 16, blocks: [[4, 27]] as const, data: 108 },
];

const ALIGN: number[][] = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255] ?? 0;
}

function mul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] ?? 0) + (LOG[b] ?? 0)] ?? 0;
}

function rs(data: Uint8Array, eccLen: number): Uint8Array {
  let gen = [1];
  for (let i = 0; i < eccLen; i++) {
    const next = new Array<number>(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j] ?? 0;
      next[j + 1] ^= mul(gen[j] ?? 0, EXP[i] ?? 0);
    }
    gen = next;
  }
  const msg = new Uint8Array(data.length + eccLen);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i] ?? 0;
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) msg[i + j] ^= mul(gen[j] ?? 0, coef);
  }
  return msg.slice(data.length);
}

function dataCodewords(text: string, capacity: number): Uint8Array | null {
  const raw = new TextEncoder().encode(text);
  if (raw.length > 255) return null;
  const bits = 4 + 8 + raw.length * 8;
  if (Math.ceil(bits / 8) > capacity) return null;
  const out = new Uint8Array(capacity);
  let n = 0;
  const push = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      if (n >> 3 >= capacity) return;
      if ((value >>> i) & 1) out[n >> 3] |= 1 << (7 - (n & 7));
      n += 1;
    }
  };
  push(0b0100, 4);
  push(raw.length, 8);
  for (const byte of raw) push(byte, 8);
  push(0, Math.min(4, capacity * 8 - n));
  if (n % 8) push(0, 8 - (n % 8));
  let pad = 0xec;
  for (let i = n >> 3; i < capacity; i++) {
    out[i] = pad;
    pad = pad === 0xec ? 0x11 : 0xec;
  }
  return out;
}

function interleave(version: number, data: Uint8Array): Uint8Array {
  const spec = SPECS[version - 1];
  if (!spec) throw new Error("qr version");
  const groups: { data: Uint8Array; ecc: Uint8Array }[] = [];
  let offset = 0;
  for (const [count, len] of spec.blocks) {
    for (let i = 0; i < count; i++) {
      const block = data.slice(offset, offset + len);
      offset += len;
      groups.push({ data: block, ecc: rs(block, spec.ecc) });
    }
  }
  const out: number[] = [];
  const max = Math.max(...groups.map((group) => group.data.length));
  for (let i = 0; i < max; i++) {
    for (const group of groups) {
      const byte = group.data[i];
      if (byte !== undefined) out.push(byte);
    }
  }
  for (let i = 0; i < spec.ecc; i++) {
    for (const group of groups) out.push(group.ecc[i] ?? 0);
  }
  return Uint8Array.from(out);
}

function empty(size: number): { modules: boolean[][]; reserved: boolean[][] } {
  const modules = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  const reserved = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  return { modules, reserved };
}

function paint(modules: boolean[][], reserved: boolean[][], row: number, col: number, dark: boolean): void {
  const line = modules[row];
  const hold = reserved[row];
  if (!line || !hold) return;
  line[col] = dark;
  hold[col] = true;
}

function finder(modules: boolean[][], reserved: boolean[][], row: number, col: number, size: number): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
      const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
      const edge = r === 0 || r === 6 || c === 0 || c === 6;
      const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      paint(modules, reserved, rr, cc, inside && (edge || core));
    }
  }
}

function functions(version: number): { modules: boolean[][]; reserved: boolean[][] } {
  const size = 21 + (version - 1) * 4;
  const { modules, reserved } = empty(size);
  finder(modules, reserved, 0, 0, size);
  finder(modules, reserved, 0, size - 7, size);
  finder(modules, reserved, size - 7, 0, size);
  const centers = ALIGN[version - 1] ?? [];
  for (const row of centers) {
    for (const col of centers) {
      if (reserved[row]?.[col]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const edge = Math.max(Math.abs(r), Math.abs(c)) === 2 || (r === 0 && c === 0);
          paint(modules, reserved, row + r, col + c, edge);
        }
      }
    }
  }
  for (let i = 0; i < size; i++) {
    if (!reserved[6]?.[i]) paint(modules, reserved, 6, i, i % 2 === 0);
    if (!reserved[i]?.[6]) paint(modules, reserved, i, 6, i % 2 === 0);
  }
  paint(modules, reserved, version * 4 + 9, 8, true);
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      if (reserved[8]) reserved[8][i] = true;
      if (reserved[i]) reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    if (reserved[8]) reserved[8][size - 1 - i] = true;
    const row = reserved[size - 1 - i];
    if (row) row[8] = true;
  }
  return { modules, reserved };
}

function placeBits(modules: boolean[][], reserved: boolean[][], codewords: Uint8Array): void {
  const size = modules.length;
  const bits: number[] = [];
  for (const byte of codewords) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }
  let index = 0;
  let right = size - 1;
  let up = true;
  while (right > 0) {
    if (right === 6) right = 5;
    for (let i = 0; i < size; i++) {
      const row = up ? size - 1 - i : i;
      for (const col of [right, right - 1]) {
        if (reserved[row]?.[col]) continue;
        const line = modules[row];
        if (line) line[col] = bits[index] === 1;
        index += 1;
      }
    }
    up = !up;
    right -= 2;
  }
}

function maskOf(kind: number, row: number, col: number): boolean {
  switch (kind) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
  }
}

function writeFormat(modules: boolean[][], format: number): void {
  const size = modules.length;
  const bit = (i: number) => ((format >> i) & 1) === 1;
  const first: [number, number][] = [
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],
    [7, 8],
    [8, 8],
    [8, 7],
    [8, 5],
    [8, 4],
    [8, 3],
    [8, 2],
    [8, 1],
    [8, 0],
  ];
  first.forEach(([row, col], i) => {
    const line = modules[row];
    if (line) line[col] = bit(i);
  });
  for (let i = 0; i < 8; i++) {
    const line = modules[8];
    if (line) line[size - 1 - i] = bit(i);
  }
  for (let i = 0; i < 7; i++) {
    const line = modules[size - 7 + i];
    if (line) line[8] = bit(8 + i);
  }
}

function penalty(modules: boolean[][]): number {
  const size = modules.length;
  let score = 0;
  const run = (dark: boolean, length: number) => {
    if (length >= 5) score += 3 + (length - 5);
    return dark;
  };
  for (let row = 0; row < size; row++) {
    let dark = modules[row]?.[0] === true;
    let length = 1;
    for (let col = 1; col < size; col++) {
      const bit = modules[row]?.[col] === true;
      if (bit === dark) length += 1;
      else {
        run(dark, length);
        dark = bit;
        length = 1;
      }
    }
    run(dark, length);
  }
  for (let col = 0; col < size; col++) {
    let dark = modules[0]?.[col] === true;
    let length = 1;
    for (let row = 1; row < size; row++) {
      const bit = modules[row]?.[col] === true;
      if (bit === dark) length += 1;
      else {
        run(dark, length);
        dark = bit;
        length = 1;
      }
    }
    run(dark, length);
  }
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const bit = modules[row]?.[col];
      if (bit === modules[row]?.[col + 1] && bit === modules[row + 1]?.[col] && bit === modules[row + 1]?.[col + 1]) score += 3;
    }
  }
  const look = (line: boolean[]) => {
    const text = line.map((bit) => (bit ? "1" : "0")).join("");
    for (const pattern of ["10111010000", "00001011101"]) {
      let from = 0;
      while (from >= 0) {
        from = text.indexOf(pattern, from);
        if (from >= 0) {
          score += 40;
          from += 1;
        }
      }
    }
  };
  for (let row = 0; row < size; row++) look(modules[row] ?? []);
  for (let col = 0; col < size; col++) look(modules.map((row) => row[col] === true));
  let darks = 0;
  for (const row of modules) for (const bit of row) if (bit) darks += 1;
  const percent = (darks * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
}

export function qrMatrix(text: string, forcedMask?: number): boolean[][] {
  let chosen: boolean[][] | null = null;
  let best = Infinity;
  for (let version = 1; version <= SPECS.length; version++) {
    const spec = SPECS[version - 1];
    if (!spec) continue;
    const packed = dataCodewords(text, spec.data);
    if (!packed) continue;
    const codewords = interleave(version, packed);
    const base = functions(version);
    placeBits(base.modules, base.reserved, codewords);
    for (let mask = forcedMask ?? 0; mask < (forcedMask === undefined ? 8 : forcedMask + 1); mask++) {
      const modules = base.modules.map((row) => row.slice());
      for (let row = 0; row < modules.length; row++) {
        for (let col = 0; col < modules.length; col++) {
          if (base.reserved[row]?.[col]) continue;
          if (maskOf(mask, row, col)) {
            const line = modules[row];
            if (line) line[col] = !line[col];
          }
        }
      }
      writeFormat(modules, FORMAT_M[mask] ?? 0);
      const score = penalty(modules);
      if (score < best) {
        best = score;
        chosen = modules;
      }
    }
    break;
  }
  if (!chosen) throw new Error("qr too long");
  return chosen;
}

export function drawQr(host: HTMLElement, text: string): void {
  const modules = qrMatrix(text);
  const n = modules.length;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${n} ${n}`);
  svg.setAttribute("width", "180");
  svg.setAttribute("height", "180");
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Authenticator QR");
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", String(n));
  bg.setAttribute("height", String(n));
  bg.setAttribute("fill", "#fff");
  svg.append(bg);
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!modules[row]?.[col]) continue;
      const cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      cell.setAttribute("x", String(col));
      cell.setAttribute("y", String(row));
      cell.setAttribute("width", "1");
      cell.setAttribute("height", "1");
      cell.setAttribute("fill", "#000");
      svg.append(cell);
    }
  }
  host.replaceChildren(svg);
}
