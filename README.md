# کنول کے پھول — Shayari Diary

A personal Progressive Web App (PWA) for saving and organising shayari — built for a Shayara named کنول.

## Features

- **Three entry types:** My Sher, Ghazals in progress, and Saved poems by other poets
- **Ghazal workshop:** Interactive checklist tracking matla, maqta, radif, qafia, metre, and quality
- **Search & filter** across Urdu text, English translations, tags, and author names
- **Offline-first:** Works fully after the first load via a service worker
- **Export / Import:** Full JSON backup and restore — import merges, never overwrites
- **No accounts, no tracking** — data lives in your browser's localStorage
- **Urdu Nastaliq typography** via Noto Nastaliq Urdu (Google Fonts)
- **Polished design** — plum & gold palette, Playfair Display display font, elevated cards

## Tech

Pure HTML + CSS + vanilla JavaScript. No build step, no framework, no backend.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source**, select the `main` branch, root folder, and save.
3. GitHub Pages will serve the app at `https://<username>.github.io/<repo-name>/`.
4. The `.nojekyll` file ensures files are served without Jekyll processing.

> **Tip:** The service worker caches all assets on first load so the app works offline afterwards.

## Install as PWA

**iPhone (Safari):**
1. Open the GitHub Pages URL in Safari.
2. Tap the Share icon → **Add to Home Screen**.
3. The app installs and runs in standalone mode.

**Android (Chrome):**
1. Open the URL in Chrome.
2. Chrome will prompt "Add to Home Screen" automatically, or use the ⋮ menu.

## Import your own Shayari

Kunwal's personal shayari is **not** pre-loaded (the repo is public). To add it:

1. Prepare or receive a JSON export file in this format:
   ```json
   {
     "version": 1,
     "entries": [
       {
         "id": "unique-id",
         "type": "sher",
         "urdu": "شعر کا متن یہاں",
         "author": "Kunwal",
         "tags": ["longing"],
         "dateAdded": "2024-06-01T00:00:00.000Z"
       }
     ]
   }
   ```
2. Open the app → **Settings (⚙)** → **Import Data (JSON)**.
3. Existing entries are preserved; only new IDs are added.

## Development Workflow

- All changes are made on feature branches.
- After testing, the feature branch is merged to `main`.
- Feature branches are kept after merging.
- `README.md` and `CHANGELOG.md` are updated with every release.

## Local Development

No build step required. Open `index.html` in a browser, or run any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Note: The service worker requires a server context (not `file://`).

## Data Model

```js
{
  id: "uuid",
  type: "sher" | "ghazal" | "saved",
  title: "string (optional)",
  urdu: "string",
  english: "string (optional)",
  author: "Kunwal" | "other poet name",
  tags: ["string"],
  dateAdded: "ISO date string",
  notes: "string (optional)",
  isGhazal: boolean,
  ghazalProgress: {
    hasMatla: boolean,
    hasMaqta: boolean,
    sherCount: number,
    radif: "string",
    qafiaUsed: ["string"],
    behrPolished: boolean,
    radifAll: boolean,
    uniqueQafia: boolean,
    noRepeat: boolean,
    strongImage: boolean,
    standsAlone: boolean,
    notes: "string"
  }
}
```
