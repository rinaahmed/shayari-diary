# Changelog

All notable changes to کنول کے پھول will be documented here.

## [2.0.4] — 2026-06-20

### Fixed — Editing a ghazal converted it to a sher
- `renderForm()` set the Sher type button as active by default (for new entries), then also set the entry's actual type active when editing — leaving both Sher and Ghazal buttons with `.active`
- `collectFormData()` uses `querySelector('.type-btn.active')` which returns the first DOM match (always Sher), so every saved edit overwrote the type with `'sher'` and wiped `ghazalProgress`
- Fix: the Sher default is now only set when creating a new entry (`if (!id)`)
- Bumped service worker to `v7`

## [2.0.3] — 2026-06-20

### Fixed — Service worker update detection
- Added `{ updateViaCache: 'none' }` to SW registration — bypasses browser HTTP cache when checking for a new `sw.js`, so updates are detected on every app open instead of after GitHub Pages' 10-minute cache window
- Bumped service worker to `v6`

## [2.0.2] — 2026-06-20

### Changed — Detail page refinement
- Poetry block redesigned as a white card (matching list card surface, shadow, border-radius, gold border) for visual consistency
- `.detail-urdu` font-size reduced from 1.75rem to 1.25rem — fits more poem on screen without scrolling
- Removed `line-height: 2.85` constraint — Nastaliq uses its natural ~3.1× metrics
- `urduHtml()` now wraps each sher in `<p class="sher-block">` instead of `<br><br>` separators — sher gap is a compact `1.5rem` instead of a full Nastaliq line-height
- Bumped service worker to `v5`

## [2.0.1] — 2026-06-20

### Fixed — Card rendering on iOS Safari
- Removed `overflow: hidden` from `.entry-card` — iOS Safari freezes flex-item height when this is set, collapsing cards to zero height
- Removed explicit `line-height: 2.2` from `.card-urdu` — Noto Nastaliq Urdu has a natural line height of ~3.1× font-size; constraining it lower causes glyph ink to overflow the line box and get clipped
- Bumped service worker cache to `v4` to force all devices to fetch fresh files

## [2.0.0] — 2026-06-20

### Changed — Design overhaul (v2)
- Replaced all styles with a new design system (`styles.css` rewritten from scratch)
- New plum & gold colour palette with CSS custom properties
- Deep plum gradient header (`#1E0A38 → #3F1870`) with subtle diamond SVG texture
- Playfair Display added as the display/italic font alongside Noto Nastaliq Urdu
- Warm parchment background (`#EDE8DC`) replacing plain white
- Elevated card design: multi-layer `box-shadow`, inset border via `::after`, gold accent bar on hover via `::before`
- New badge system on cards: colour-coded `Sher`, `Ghazal`, `Saved` labels
- Sliding gold underline tab indicator (`.tab-ink`) animated with `offsetLeft`/`offsetWidth`
- Back buttons redesigned: frosted glass pill with SVG chevron + "Back" label
- Action buttons in detail header: rounded-square frosted glass icons
- Detail view poetry block framed with gold top/bottom rules instead of a left border
- Confirm dialog updated: bottom-sheet style with blur backdrop and drag handle
- Custom checkbox styling (appearance: none, manual checkmark via `::after`)
- Gold section dividers with flanking rules in the ghazal form
- Urdu text preview in cards uses `white-space: pre-line` (no `<br>` tags)
- Full ghazal progress grid in detail view (9 checks instead of 4)
- Empty state updated with ornament + heading + body copy

### Added
- `updateTabInk()` function to position the sliding tab underline
- `CHANGELOG.md` (this file)
- Development workflow documented in `README.md`

## [1.0.0] — 2026-06-20

### Added — Initial release
- Single-page PWA: Home, Form, Detail, Settings views
- Three entry types: Sher, Ghazal in progress, Saved (others)
- Ghazal workshop: radif, qafia chips, structural + quality checklists
- Search across Urdu text, English translation, tags, author
- Tag filter pills per tab
- Export all data as JSON; Import JSON (merge, no overwrite)
- Clear all data with confirmation dialog
- Copy / native Share from detail view
- Offline-first via service worker (`sw.js`)
- PWA manifest with lotus flower icons (192 × 512 px PNG)
- `.nojekyll` for GitHub Pages
- Default seed data: 5 saved classical poems (Parveen Shakir, Mir Taqi Mir, Ghalib, Faiz Ahmed Faiz)
- Personal shayari intentionally excluded from repo — added via Import
