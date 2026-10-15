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

Wallpaper files are `site/public/wallpapers/`. The default is `sky.jpg`. Display Properties (Start, then Display) switches Sky, Teal, Clouds, and Navy for the current tab. Icon positions after a drag are remembered the same way. Neither is a cookie.

To change a page, edit `site/src/catalog.ts`. The desktop apps are the list at the top of `site/src/desktop/desktop.ts`. Snake and Tetris live in `site/src/desktop/games.ts` and run inside the Terminal window (`snake`, `tetris`, arrows, space, esc).

### Extra apps

Each of these is a normal window. Open it from the icon or from Start. The terminal names are in parentheses.

- Player (`player`). Play, pause, stop, previous, next, volume, and a progress bar. The tunes are short square waves made in the browser. Nothing is streamed, and none of them are commercial tracks.
- My Pictures (`pictures`) and Certificates (`awards`). Thumbnails, then a larger view with previous and next. The files live in `site/public/media/`. The titles and captions are `site/src/desktop/media.ts`. The public site cannot read a folder on your computer, so copy new photos into `public/media` and add a line to that file. The first set was copied from the local Desktop folder of photos and certificate scans.
- Converter (`encode`). Base64, hex, and URL encode and decode, text to binary, MD5, SHA-1, and SHA-256. It runs in the page. Nothing is uploaded.
- Facts (`facts`). Short lines from the same record as the catalog, plus buttons that open the other tools.
- Hack (`hack`). A joke. Fake error windows, a short glitch, then a punchline. Reset or Close puts the desktop back. It does not change files or accounts.
- Nugget (`buddy`). A floating assistant, not a window. Tips come from the same fact list. Close the balloon and the picture stays. Start has Show Nugget and Hide Nugget for this tab. The picture is `site/public/buddy/nugget.png`. Replace that file to change the character.
- Run and Find are in the Start menu. Find searches the profile text and opens the matching window.
- The taskbar EN button cycles English, Spanish, German, and French for this tab. Blog posts stay in the language they were written in.
- A yellow note shows the current role, city, and email. Closing it lasts for the tab.
- After a quiet minute and a half the picture bounces on the sky. A click or a key brings the desktop back. No sound.
- Right-click the desktop for Arrange icons, Display, and Run.
- Print hides the taskbar and prints About, Jobs, and Projects.

Social icons sit on the wallpaper, in a row at the bottom right (a bar under the icons on a phone). They are PNGs in `site/public/social/`: `github.png`, `linkedin.png`, `x.png`, `instagram.png`, `youtube.png`. The addresses are the same ones as My Links. A click opens a new tab. To point one somewhere else, change the profile in `site/src/catalog.ts`. To redraw an icon, replace the PNG and keep the name.

## Deploy

Not run from this repo automatically. Run it from `site/` with the pinned Wrangler, after a Cloudflare account is already logged in. Do not run Wrangler from the repository root.

```bash
cd site
./node_modules/.bin/wrangler deploy
```

The config is `site/wrangler.jsonc`. Compatibility date is 2026-05-03, the newest date Wrangler 4.86's local runtime accepts on Node 20. Static assets are the Vite `dist/` directory. The Worker runs first so it can set headers. Document routes return `index.html`. Unknown paths 404.

D1 database `pkn` is `d8bf9b4e-7a24-4f1f-997e-a47c99dd6f79` in `site/wrangler.jsonc`. Apply the schema to the remote database before the editor is used:

```bash
cd site
./node_modules/.bin/wrangler d1 migrations apply pkn --remote
```

The public host is `https://pocketnugget.xyz`. `robots.txt` points at that sitemap. The Worker builds `/sitemap.xml` from the request origin, so the apex and any `workers.dev` hostname stay consistent with the URL that was requested. `www` and `hackztecs` are tunnels and are not routes on this Worker.

Terraform for the DNS zone is a follow-up against the real zone. It is not in this repo. Docker and Cloudflare Tunnels stay on the homelab. This site does not need a cluster.

## Login and the blog

`links` is the public list (email, GitHub, LinkedIn, X, Instagram, YouTube). `blog` reads posts. `login` opens the editor.

There is one admin, username `goben`. No public signup. The password is not in the repo. Login also asks for a 6 digit code from an authenticator app (TOTP, the same code Google Authenticator and Microsoft Authenticator show). It is not a Google or Microsoft login. The first successful password shows a QR once. After that code is accepted, later logins are password plus code. Eight recovery codes work in the code field, once each.

`node scripts/seed-auth.mjs` from `site/` writes a new password, the recovery codes, and the otpauth URI to `~/Downloads/pkn-admin-login.txt` and then deletes nothing by itself. Scan the file, then delete it. `--apply` also sets the Worker secrets and the D1 row. Do not commit that file.

The editor can change the password. The new hash is stored in D1 and wins over the Worker secret. Local Vite has no D1, so the login says it is not configured.

The session is an HttpOnly, SameSite=Strict cookie. The database stores a hash of that cookie, the posts, the encrypted authenticator secret, recovery-code hashes, and login-failure times. It does not store visitor addresses. A wrong password and a wrong username get the same answer. Eight failures in fifteen minutes lock the login, including bad codes. Mutations require the browser Origin.

## What the Worker stores

Blog posts, session hashes, the authenticator secret (encrypted), recovery-code hashes, and login-failure times, in D1. No contact form, no third-party script, no analytics table. The window font ships with 98.css in `site/public/vendor/`. `security.txt` points at `goben.ca.pkn@hotmail.com`.

## Legacy

`legacy/` is the old React, Deno, and SQLite app. Leave it there. See `legacy/README.md`.
