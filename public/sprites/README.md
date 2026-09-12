# Drop your own art here — no code changes needed

The app looks for images at these exact paths. If a file is missing, it
automatically falls back to the emoji version, so you can replace archetypes
one at a time.

## Buildings (per domain archetype, 4 growth stages each: 0 → 3)

    /sprites/library/stage-0.png   stage-1.png   stage-2.png   stage-3.png
    /sprites/academy/stage-0.png   stage-1.png   stage-2.png   stage-3.png
    /sprites/workshop/stage-0.png  stage-1.png   stage-2.png   stage-3.png
    /sprites/dojo/stage-0.png      stage-1.png   stage-2.png   stage-3.png
    /sprites/shrine/stage-0.png    stage-1.png   stage-2.png   stage-3.png
    /sprites/atelier/stage-0.png   stage-1.png   stage-2.png   stage-3.png
    /sprites/kitchen/stage-0.png   stage-1.png   stage-2.png   stage-3.png
    /sprites/farm/stage-0.png      stage-1.png   stage-2.png   stage-3.png

(The archetype keys come from src/lib/archetypes.js — if you add a new
archetype there, give it its own folder here too.)

## House

    /sprites/house.png

## Recommended format

- Square PNG, transparent background
- 256x256px is plenty (they're displayed small)
- Keep each stage visually "bigger/fancier" than the last — that's what
  sells the level-up feeling

## Shop item icons (optional)

Not wired up yet by default, but if you want them: add
`/sprites/shop/<item-id>.png` (item ids are in src/lib/shopItems.js) and use
the same onError-fallback pattern from VillagePlot.jsx inside ShopPanel.jsx.
