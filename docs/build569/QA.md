# Build569 QA

Production rules, production view and actual pointer input are used by the preview. Only the outside party roster view is isolated. Four WebSocket clients exercise the production party gates, queues and snapshots in the Node suite.

- 39 Node tests pass, zero fail; see tests.tap.
- 100 seeded AI/disconnect-takeover simulations complete three rounds without invalid scores or dead holders.
- 12 mobile viewport / seat cases select and pass the second of three owned bombs correctly, with one command per tap.
- No horizontal or vertical overflow; playable stage >=120px and footer fits viewport.
- Public snapshots contain no explodeAt, random seed, or bot timer; the UI shows no numeric hidden countdown.
- Simultaneous blasts handle multiple victims; unexpired bombs held by a victim move to a survivor.
- Disconnect disables input. Reduced-motion removes pulsing. Lobby and result render.
- Chromium errors: 0; failed HTTP responses: 0.

The front-half display explicitly counts time until concealment. The concealed interval is separately randomized to 4–8 seconds, because hiding a deterministic countdown alone would still allow players to count it mentally. Initial allocation favors lower cumulative holding time, including time on forfeited rounds; this is catch-up balancing, not a claim of perfectly equal opportunity. Survival awards 30 points. No human-play balance claim is made.

Native iPhone/Safari not tested. No production deployment or server restart performed.
