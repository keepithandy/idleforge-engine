# IdleForge RPG Engine

IdleForge RPG Engine is a lightweight open-source browser RPG and incremental RPG engine built with plain HTML, CSS, and JavaScript.

It is designed as a starter foundation for small browser RPGs: simple to run, easy to read, and structured so reusable engine logic stays separate from demo content.

## What IdleForge Is

- A browser-first RPG engine foundation.
- A plain HTML/CSS/JS project with no build step.
- A content-driven starter that can power different RPG themes.
- A working demo that proves the engine loop, save flow, and UI structure.

## Current Prototype Status

- The current loaded demo is Rat Cellar.
- The combat loop, XP gain, currency, loot, equipment, selling, save, export/import, and reset flows are working.
- This repo is still a prototype foundation, not a full content pack.
- The current focus is engine identity, documentation, and repo structure.

## How To Run Locally

1. Open `index.html` directly in a browser.
2. No server is required.
3. No package install is required.
4. The game should load and play from a local file path.

## Current Features

- Turn-based fight resolution.
- XP and level progression.
- Currency rewards and spending through selling.
- Loot drops and item inventory.
- Equipment slots and stat aggregation.
- Save/load using browser storage.
- Export/import for moving saves between browsers.
- Reset for starting fresh.

## Folder Structure

- `index.html` is the entry point and visible shell.
- `styles/` contains the shared presentation layer.
- `js/engine/` contains generic engine logic.
- `js/content/` contains demo content and game-specific data.
- `docs/` contains engine rules and contributor guidance.
- `README.md` explains the repo at a high level.
- `LICENSE` defines the open-source terms.

## How Content Files Work

Content files define the playable demo data the engine consumes.

- `js/content/game.config.js` sets the title, currency label, floor cap, save key, and base player stats.
- `js/content/items.js` defines equipment and sellable items.
- `js/content/enemies.js` defines encounters, rewards, and loot tables.
- `js/content/zones.js` maps floors to zone names and enemy ids.

These files are the main place to build a new RPG theme without rewriting the engine.

## Engine Logic vs Demo Content

Engine files should stay generic and reusable.

- Engine files handle state, combat, loot, inventory, saves, and rendering.
- Content files define the theme, names, rewards, and progression data.
- Engine code should not contain demo lore or theme-specific naming.
- Content files may change completely from one game theme to another.

For more detail, see:

- [`docs/engine-principles.md`](docs/engine-principles.md)
- [`docs/content-vs-engine.md`](docs/content-vs-engine.md)

## How To Edit The Demo

If you want to make a new RPG theme, start here:

1. Edit `js/content/game.config.js` to change the title, currency name, and floor cap.
2. Edit `js/content/items.js` to replace the item list.
3. Edit `js/content/enemies.js` to replace the encounter list.
4. Edit `js/content/zones.js` to rename the floor map.
5. Refresh the browser and test a few fights.
6. Use Reset Save if you want a clean run.

Keep ids stable when you can, and update any references if you rename content ids.

## Contribution Note

This is an open-source starter project. Contributions should keep the engine generic, preserve the working demo, and keep content separated from core logic.

Before opening a change, run the test checklist in `CONTRIBUTING.md`.

## Current Limitations

- Only one demo theme is loaded right now.
- There is no build system.
- There is no plugin system yet.
- There is no save migration layer yet.
- There is no formal content loader for multiple themes yet.
- The project is intentionally small and focused on the starter engine loop.

## Next Roadmap Steps

See [`ROADMAP.md`](ROADMAP.md) for the planned phases:

- v0.3 content separation
- v0.4 multi-example loading
- v0.5 save migration docs
- v0.6 hooks/plugin foundation
- v1.0 stable starter release

