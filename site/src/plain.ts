const FORMAT = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;

export const NOTE_NAME_MAX = 40;
export const NOTE_BODY_MAX = 600;
export const NOTE_LINES = 8;

export function scrubInvisible(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\u2028|\u2029/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\0/g, "")
    .replace(FORMAT, "");
}

export function cleanLine(value: string, max: number): string | null {
  const text = scrubInvisible(value).trim();
  if (!text || text.length > max) return null;
  if (/[\u0000-\u001F\u007F<>]/.test(text)) return null;
  return text;
}

export function cleanBlock(value: string, max: number, maxLines: number): string | null {
  const text = scrubInvisible(value).replace(/\t/g, " ").trim();
  if (!text || text.length > max) return null;
  if (/[\u0000-\u0009\u000B-\u001F\u007F<>]/.test(text)) return null;
  if (text.split("\n").length > maxLines) return null;
  return text;
}

export function cleanTags(value: string): string | null {
  const text = scrubInvisible(value).replace(/[\t\n]+/g, " ").trim();
  if (text.length > 200 || /[<>]/.test(text)) return null;
  if (/[\u0000-\u001F\u007F]/.test(text)) return null;
  return text;
}
