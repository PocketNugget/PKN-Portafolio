// Copy 98.css and its pixel font into public/vendor so the site stays same-origin.
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "node_modules/98.css");
const dest = join(root, "public/vendor");
mkdirSync(dest, { recursive: true });

const files = [
  ["dist/98.css", "98.css"],
  ["dist/ms_sans_serif.woff", "ms_sans_serif.woff"],
  ["dist/ms_sans_serif.woff2", "ms_sans_serif.woff2"],
  ["dist/ms_sans_serif_bold.woff", "ms_sans_serif_bold.woff"],
  ["dist/ms_sans_serif_bold.woff2", "ms_sans_serif_bold.woff2"],
  ["LICENSE", "98.css.LICENSE"],
  ["fonts/src/ms-sans-serif/license.txt", "ms_sans_serif.license.txt"],
  ["fonts/src/ms-sans-serif/readme.txt", "ms_sans_serif.readme.txt"],
];

for (const [from, to] of files) {
  cpSync(join(pkg, from), join(dest, to));
}
