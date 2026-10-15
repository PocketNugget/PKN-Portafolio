#!/usr/bin/env bash
# Typecheck, test, build, then reject the defaults this site is not allowed to ship.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/site"

npm test
npm run typecheck
npm run build

python3 - << 'PY'
import pathlib, re, sys
root = pathlib.Path(".")
files = []
for folder in (pathlib.Path("src"), pathlib.Path("content"), pathlib.Path("dist")):
    if not folder.exists():
        continue
    for path in folder.rglob("*"):
        if path.suffix.lower() not in {".html", ".css", ".js", ".ts", ".md"}:
            continue
        if path.name.endswith(".test.ts"):
            continue
        if "node_modules" in path.parts:
            continue
        files.append(path)

words = ("passionate", "leverage", "seamless", "cutting-edge", "spearheaded", "backdrop-filter", "linear-gradient", "40%")
hexes = ("#8b5cf6", "#6366f1", "#00d4ff", "#00ff88")
font = re.compile(r"font-family:[^;}{]*\bInter\b", re.I)
failed = False
for path in files:
    text = path.read_text(encoding="utf-8", errors="replace")
    lowered = text.lower()
    for word in words:
        if word in lowered:
            print(f"{path}: banned word {word}")
            failed = True
    for hx in hexes:
        if hx in lowered:
            print(f"{path}: banned color {hx}")
            failed = True
    if "\u2014" in text:
        print(f"{path}: em dash")
        failed = True
    if font.search(text):
        print(f"{path}: Inter font")
        failed = True
if failed:
    sys.exit(1)
print(f"checked {len(files)} files")
PY
