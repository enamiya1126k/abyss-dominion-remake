# Build533 verification

- Fishing tests: 96 passed, 0 failed.
- Existing non-fishing regression tests: 62 passed, process exit 0.
- Browser: 320×568, 390×700, 430×800, no page errors / failed asset loads.
- New art: two WebP atlases decoded at 1254×1254.
- Catalog: 120; new 32; real notes 64; deep filter 5; market filter 24.
- 180,000 ordinary draws across six themes: all 103 non-exclusive catch candidates observed in every theme; real fish >92% of ordinary animal draws.
- Preserve old v6 active catches / bait / rod XP / boss schedule while upgrading protocol to v7.
- Screenshot review: new fish / deep filters and barreleye catch fit on phone.
- QA uses substitute missing base character catalogs only. Safari on device, production deployment and real multiple-device networking were not tested.
- Weight-variation regression now samples common mackerel instead of fantasy catfish: with more real fish, the fantasy sample was too sparse at the fixed seed. No production weight rule was relaxed.
