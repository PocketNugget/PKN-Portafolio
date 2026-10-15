# Goben Diego

Portfolio for Goben Diego Constantino Aguirre (PocketNugget). English, static, and meant to run on Cloudflare Workers.

The page is a Windows 98 style desktop. Icons and the Start menu open the same pages. The Terminal window still runs the real commands, plus ASCII Snake and Tetris. Content lives in `site/src/catalog.ts` and `site/content/notes/`.

## Run

```bash
cd site
npm install
npm test
npm run dev
```

`npm run dev` is Vite. The Worker path, including security headers, `/.well-known/security.txt`, and `/build.json`, is:

```bash
cd site
npm run preview
```

That builds the client and starts `wrangler dev`. Refresh a project URL. It should still be that project.

`scripts/check.sh` from the repo root typechecks, runs the tests, builds, and greps the output for the defaults this site does not ship.

## Desktop

`npm run dev` copies 98.css and its pixel font into `site/public/vendor/` before Vite starts. Those files are committed too, with the CC BY-SA note for the font (Pixelated MS Sans Serif by lou, via Fontstruct).

Double-click a desktop icon, or use Start. Windows drag from the title bar, resize from the edges, and minimize, maximize, and close. Open windows sit on the taskbar. On a phone, a tap opens an icon and the window fills the screen.

Wallpaper files are `site/public/wallpapers/`. Display Properties (Start, then Display) switches among them for the current tab. Icon positions after a drag are remembered the same way. Neither is a cookie.

To change a page, edit `site/src/catalog.ts`. The desktop apps are the list at the top of `site/src/desktop/desktop.ts`. Snake and Tetris live in `site/src/desktop/games.ts` and run inside the Terminal window (`snake`, `tetris`, arrows, space, esc).

## Deploy

Not run from this repo automatically. From `site/`, with a Cloudflare account already logged in:

```bash
npx wrangler deploy
```

The config is `site/wrangler.jsonc`. Compatibility date is 2026-05-03, the newest date Wrangler 4.86's local runtime accepts on Node 20. Static assets are the Vite `dist/` directory. The Worker runs first so it can set headers. Document routes return `index.html`. Unknown paths 404.

D1 database `pkn` is `d8bf9b4e-7a24-4f1f-997e-a47c99dd6f79` in `site/wrangler.jsonc`. Apply the schema to the remote database before the editor is used:

```bash
cd site
npx wrangler d1 migrations apply pkn --remote
```

The public host is `https://pocketnugget.xyz`. `robots.txt` points at that sitemap. The Worker builds `/sitemap.xml` from the request origin, so the apex and any `workers.dev` hostname stay consistent with the URL that was requested. `www` and `hackztecs` are tunnels and are not routes on this Worker.

Terraform for the DNS zone is a follow-up against the real zone. It is not in this repo. Docker and Cloudflare Tunnels stay on the homelab. This site does not need a cluster.

## Login and the blog

`links` is the public list (email, GitHub, LinkedIn, X, Instagram, YouTube). `blog` reads posts. `login` opens the editor.

There is one admin. The password is not in the repo. Make a long one, hash it, and keep the plaintext in a password manager:

```bash
openssl rand -base64 24 | tee "$HOME/pkn-admin-pass" | node scripts/hash-password.mjs
```

Put the printed line in `site/.dev.vars` for local preview, then delete the plaintext file:

```
ADMIN_USER=goben
ADMIN_PASSWORD_HASH=sha256$then-the-64-hex-characters
```

For the deployed Worker:

```bash
npx wrangler secret put ADMIN_USER
npx wrangler secret put ADMIN_PASSWORD_HASH
```

The session is an HttpOnly, SameSite=Strict cookie. The database stores a hash of that cookie, the posts, and login-failure times. It does not store visitor addresses. A wrong password and a wrong username get the same answer. Eight failures in fifteen minutes lock the login. Mutations require the browser Origin.

## What the Worker stores

Blog posts, session hashes, and login-failure times, in D1. No contact form, no third-party script, no analytics table. The window font ships with 98.css in `site/public/vendor/`. `security.txt` points at `goben.ca.pkn@hotmail.com`.

## Legacy

`legacy/` is the old React, Deno, and SQLite app. Leave it there. See `legacy/README.md`.
