# IdleForge v0.2

IdleForge is a small browser-based incremental RPG engine. It is meant to be a toolkit for making different games with the same core engine, not a one-off Rat Cellar prototype.

## Run

Open `index.html` directly in a browser. No server, build step, or package install is required.

## Project Layout

- `index.html` wires the page together and loads the plain HTML/CSS/JS files.
- `styles/main.css` controls layout and presentation.
- `js/engine/` contains generic engine code for state, combat, inventory, loot, save handling, and rendering.
- `js/content/` contains the game-specific demo data you edit to make a different game.
- `README.md` explains how to work with the project.
- `DESIGN_NOTES.md` describes the scope and naming rules for this version.

## How The Engine Is Split

Engine files should stay generic. They should work with any theme that uses the same data shape.

Content files should hold the demo theme, names, enemies, items, and zone mapping.

## Edit Items

Edit `js/content/items.js` to add, remove, or rebalance equipment.

Each item uses:

- `id`: stable internal identifier
- `name`: what the player sees
- `type`: optional broad category for your own organization
- `slot`: which equipment slot it uses
- `attack`: attack bonus
- `defense`: defense bonus
- `price`: sell value reference
- `description`: short flavor text

Rules:

- Keep item `id` values unique.
- If you change an item `id`, also update any enemy loot tables that reference it.
- If you add a new slot, update the engine state and UI together.

## Edit Enemies

Edit `js/content/enemies.js` to change the combat encounters.

Each enemy uses:

- `id`: stable internal identifier
- `name`: visible name
- `floor`: the floor where this enemy is used
- `hp`: hit points
- `attack`: base attack
- `defense`: base defense
- `xp`: experience reward
- `currency`: currency reward
- `loot`: array of item ids that can drop

Rules:

- Keep enemy `id` values unique.
- Keep `loot` item ids valid.
- Keep floor values aligned with the zone list in `js/content/zones.js`.

## Edit Zones

Edit `js/content/zones.js` to map floors to the enemy for that floor and to name the zone.

Each zone uses:

- `floor`: the floor number
- `enemy`: the enemy id used on that floor
- `title`: the zone name shown in the UI

Rules:

- Every floor from `1` through `maxFloor` should have a zone entry.
- The floor progression is controlled by `js/content/game.config.js`.
- The engine picks the current zone from the player’s floor automatically.

## Change Game Title, Currency, And Max Floor

Edit `js/content/game.config.js`.

Common values:

- `title`: browser title and in-game heading
- `currencyName`: the currency label shown in the UI
- `maxFloor`: the highest floor the demo can reach
- `saveKey`: localStorage key used for saves

If you change `maxFloor`, make sure `js/content/zones.js` includes matching floors.

## Reset Save Data During Testing

The game autosaves to `localStorage`.

Use one of these:

- Click **Reset Save** in the UI.
- Use **Export Save** and **Import Save** to move data between browsers.
- Clear the site data in your browser devtools if you want a full manual reset.

The reset button should always return the game to a fresh state.

## What Engine Files Should Contain

Keep engine files generic and reusable:

- `js/engine/state.js`: base state, lookup helpers, and new-game state creation
- `js/engine/save.js`: load, save, export, import, and reset behavior
- `js/engine/combat.js`: fight resolution and level-up logic
- `js/engine/inventory.js`: equip, sell, and stat aggregation
- `js/engine/loot.js`: drop handling
- `js/engine/render.js`: screen updates and event wiring

Engine files should not contain theme-specific names, lore, or unique content lists.

## What Engine Files Should Not Contain

Avoid putting these in engine code:

- demo enemy names
- demo item names
- zone titles
- special story text
- theme-specific progression rules

Those belong in `js/content/`.

## Make Your Own Game

1. Open `js/content/game.config.js` and change the title, currency name, and floor cap.
2. Replace the item list in `js/content/items.js` with your own gear.
3. Replace the enemy list in `js/content/enemies.js` with your own encounters.
4. Replace the zone map in `js/content/zones.js` with your own floor layout.
5. Refresh `index.html` in the browser and test a few fights.
6. Use **Reset Save** if you want a clean test run.

If you keep the same data shape, the engine can power a different incremental RPG without changing the core code.
