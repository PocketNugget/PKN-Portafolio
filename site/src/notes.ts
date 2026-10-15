import jingle from "../content/notes/jingle-trouble.md?raw";
import models from "../content/notes/model-files.md?raw";
import { notes, type NoteMeta } from "./catalog";
import { renderNote } from "./markup";

export { assertSafeHtml, escapeHtml, renderNote } from "./markup";

const files: Record<string, string> = {
  "jingle-trouble.md": jingle,
  "model-files.md": models,
};

export function noteSource(meta: NoteMeta): string {
  const src = files[meta.file];
  if (!src) throw new Error(`missing note file ${meta.file}`);
  return src;
}

export function noteBySlug(slug: string): NoteMeta | undefined {
  return notes.find((note) => note.slug === slug);
}

export function renderedNotes(): { slug: string; html: string }[] {
  return notes.map((note) => ({
    slug: note.slug,
    html: renderNote(noteSource(note)),
  }));
}
