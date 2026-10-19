/** A post counts as new for four months. The desktop shows a bubble on Blog while one does. */
export const NEW_MONTHS = 4;

export function newSince(now: number): number {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() - NEW_MONTHS);
  return date.getTime();
}

export function isNew(created: string, now: number): boolean {
  const at = Date.parse(created);
  return Number.isFinite(at) && at >= newSince(now) && at <= now + 86_400_000;
}

export function newPostCount(posts: { created: string }[], now: number): number {
  return posts.filter((post) => isNew(post.created, now)).length;
}

/** A plain first line of a post for the list: no markup characters, cut at a word. */
export function excerptOf(content: string, max = 150): string {
  const first = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line !== "" && !/^(```|#{1,3} |---+$|!\[)/.test(line));
  if (!first) return "";
  const plain = first
    .replace(/^(> |[-*] |\d+\. )/, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`_]/g, "")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return `${cut.slice(0, Math.max(1, cut.lastIndexOf(" ")))}...`;
}
