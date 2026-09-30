# Build571 verification

## Rules, wire and regression

```sh
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test --test-reporter=tap tests/build571-*.test.mjs tests/build563-wire.test.mjs tests/build570-tetra.test.mjs
```

148 tests passed, zero failures. `tests.tap` is the captured output.

- Exact integer multiplication across independent buff categories, preserving half metres until the final floor. The 20×27 case resolves to ×540.
- 52-item catalogue. 64 generated 8/16-round plans have unique four-card hands, an uncharged option every round, a big move in the final, and early-item expiry.
- Effective hits, zero-effect hits, reflection credit, shield priority, deferred revenge, salvage, partial theft of compressed equipment stacks.
- Charge spending, bank×8, tank retention and phoenix recovery without duplication. Newly earned charge is carried to the next big move.
- Uncapped dice arithmetic and physical cube poses; uncapped percentage theft without overdrawing the leader's available distance.
- 20 deterministic AI games through 8/16 rounds with persistence and private hands. Direct distance-to-multiplier feedback originally created 87,203-digit distances by R13 of seed 2; replaced with tenfold distance milestones and reran all seeds.
- Actual party ready/start gates and four real WebSockets for luck. Common party gates and four-game socket regressions also passed.
- Tetra's previous checkpoint/goal regression remains covered. No live server or persistent game data used.

`build571-regression.test.mjs` retains the Build562 mechanics cases, updating expected values only for the intentional new catalogue, dice, banking, comet, magnet and weighted theft rules. Older version-specific test snapshots are not the current release gate.

## Browser

```sh
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tools/build571/browser.mjs
```

Chromium touch emulation at 390×740 and 320×568, zero page errors and failed resources. Production luck view, logic, styles and monster/item/background artwork; the unrelated party lounge is stubbed. No native iPhone or Safari test.

Checked: 52 catalogue entries / 12 new sprites, server-version start gate, hand selection, equipment scrolling, carried-vs-replenished charges, crystal barrier, dice beyond six, progressive in-flight multiplier labels. No final-distance forecast or complete multiplication result is shown while selecting or rolling. The 7×8×9×100m dice expression shows the rolled base, without computing the buffed launch distance.

Both viewport widths fit without horizontal overflow. Small-height hand descriptions scroll within the control panel rather than being clipped below the game surface. Full descriptions remain available. `hand.webp`, `equipment.webp`, `dice.webp`, and `run.webp` show the actual rendered game fixture.

## Generated artwork

Created with the built-in `image_gen.imagegen` tool, transparency enabled. The following describes the generation instructions, not an exact transcript:

- Item atlas: twelve isolated fantasy inventory objects, coherent dark gold/teal palette, four columns × three rows, transparent background, no lettering. Row order: hunter battery / red sword medal / compass / flag; fiery boot / twin mirrors / blue heat tank / phoenix; shield gear / anchor / feathers / gold distance-record machine.
- Barrier: hollow translucent blue protective dome, ornate gold rim, glowing accents, clear open centre so the character remains visible, transparent exterior, no lettering.

Generated PNGs were resized/encoded for the game as `assets/luck571/items.webp` (1200×900) and `assets/luck571/barrier.webp` (384×384), preserving alpha. The images are consumed by `build571-luck.css` and included in the offline cache. Screenshots are QA captures, not generated mockups.

## Release boundary

Cumulative ZIP excludes `online-server/data/`. GitHub update is applied over the latest PR tree while preserving all existing main runtime data blobs. No merge, deployment or server restart was performed.
