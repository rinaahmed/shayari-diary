# کنول کے پھول — Shayari Diary

A personal Progressive Web App (PWA) for saving and organising shayari — built for a Shayara named کنول.

## Features

- **Three entry types:** My Sher, Ghazals in progress, and Saved poems by other poets
- **Ghazal workshop:** Interactive checklist tracking matla, maqta, radif, qafia, metre, and quality
- **Search & filter** across Urdu text, English translations, tags, and author names
- **Offline-first:** Works fully after the first load via a service worker
- **Export / Import:** Full JSON backup and restore
- **No accounts, no tracking** — data lives in your browser's localStorage
- **Urdu Nastaliq typography** via Noto Nastaliq Urdu (Google Fonts)

## Tech

Pure HTML + CSS + vanilla JavaScript. No build step, no framework, no backend.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source** and select the `main` branch (or your preferred branch), root folder.
3. GitHub Pages will serve the app at `https://<username>.github.io/<repo-name>/`.
4. The `.nojekyll` file ensures GitHub Pages serves the files without Jekyll processing.

> **Tip:** The service worker caches all assets on the first load so the app works offline afterwards.

## Install as PWA (iPhone / Android)

**iPhone (Safari):**
1. Open the GitHub Pages URL in Safari.
2. Tap the Share icon → **Add to Home Screen**.
3. The app installs and runs in standalone mode.

**Android (Chrome):**
1. Open the URL in Chrome.
2. Chrome will prompt "Add to Home Screen" automatically, or use the ⋮ menu.

## Import your own Shayari

The app ships with a handful of classic poems by other poets as examples. To add your own work:

1. Prepare a JSON file in this format:
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

## Local Development

No build step required. Just open `index.html` in a browser, or run any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Note: The service worker requires a server (not `file://`).
