# Content vs Engine

IdleForge works best when engine logic and demo content stay separate.

## Engine Files Should Not Contain Demo Lore

Engine files should stay reusable and generic.

Do not put:

- world names
- faction names
- character names
- story text
- theme-specific progression rules

in engine code.

## Content Files Define Theme And Game Data

Content files are where you change the game theme.

- title and currency labels
- enemy lists
- loot tables
- item names
- zone names
- floor mapping

## Good Generic Engine Terms

These belong in engine code:

- player
- enemy
- item
- zone
- floor
- inventory
- equipment
- reward
- save data

## Content-Only Terms

These belong in content files, not engine logic:

- unique region names
- monster family names
- special currency names
- story-specific item names
- themed zone titles

## Rules For Future Contributors

- Keep engine files generic.
- Put demo-specific values in `js/content/`.
- Update docs when a data shape changes.
- Test the demo after every change.
- Do not hide content rules inside engine logic.

