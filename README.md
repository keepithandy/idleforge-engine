# IdleForge v0.1

Rat Cellar prototype for a browser incremental RPG.

## Run

Open `index.html` directly in a browser. No build step and no server are required.

## Structure

- `index.html` wires the UI and loads the plain HTML/CSS/JS modules.
- `styles/main.css` controls layout and responsive styling.
- `js/engine/*` contains generic engine logic for state, saving, combat, loot, inventory, and rendering.
- `js/content/*` contains demo-specific data only.

## Editing content

### Items

Edit `js/content/items.js` to add or change equipment. Each item supports:

- `id`
- `name`
- `type`
- `slot`
- `attack`
- `defense`
- `price`
- `description`

### Enemies

Edit `js/content/enemies.js` to change enemy stats, rewards, and loot tables.

Each enemy supports:

- `id`
- `name`
- `floor`
- `hp`
- `attack`
- `defense`
- `xp`
- `currency`
- `loot`

### Zones

Edit `js/content/zones.js` to map floors to enemies and zone titles.

The game uses floors `1` through `10`. Floor `10` is the goal.

## Save features

- The game autosaves to `localStorage`.
- Use **Export Save** to download a JSON save file.
- Use **Import Save** to load a JSON save file.
- Use **Reset Save** to clear progress.

