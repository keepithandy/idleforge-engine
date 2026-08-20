# Release Readiness Checklist

Use this checklist before recommending, tagging, or sharing a named Depth Engine starter snapshot. It does not create a release or change the no-build, direct-file startup model.

## 1. Direct Startup

- Start from a clean clone or source archive.
- Open index.html directly through a file:// path in an unrestricted browser.
- Confirm no install step, server, or package manager is required.
- Confirm Rat Cellar loads with no console errors.

## 2. Bundled Examples

- Load Rat Cellar, Arena Waves, Sewer Patrol, Depth Kit Lab, and Crystal Mines from the selector.
- Confirm the active example name, progression label, route, and save identity are correct.
- Reload each example and confirm its own save slot persists.
- Confirm invalid stored example ids safely fall back to Rat Cellar.

## 3. Save Safety

- Confirm a compatible same-example save imports successfully.
- Confirm malformed JSON leaves the current save unchanged and displays recovery guidance.
- Confirm a future-version save is not loaded or overwritten and can be exported as a blocked backup.
- Confirm a save from a different example is rejected without changing the active save.
- Confirm reset is the explicit action that can replace a blocked save.
- Confirm unavailable browser storage displays a clear session-only warning instead of crashing.

## 4. Core Play Loop

- Fight, earn XP and currency, receive loot, equip an item, and sell an item.
- Export the active example save and confirm the example-specific filename.
- Reset and confirm a clean current-version state.

## 5. Automated Gate

Run the complete current suite from the repository root:

    node run_smokes.mjs

The runner must report 14/14 smoke scripts passed. Do not mark a snapshot ready if any smoke fails.

## 6. Documentation Accuracy

- README, ROADMAP, docs/examples.md, and docs/starter-customization.md name the active bundled examples accurately.
- The release note describes the exact validation status without claiming unrun browser checks.
- Save compatibility guidance states that incompatible saves are protected rather than silently normalized.

## Release Gate

A named snapshot remains a draft until refreshed GitHub Actions completes successfully and the native file:// checklist passes in an unrestricted browser.