# Build418 verification

## Scope and causes

ChapterTwoField previously handled springs as blocking contacts: it cleared the path and disarmed further contacts. The main spring callback then called render(), disposing the field and losing its contact latch. Moving away could immediately trigger another recovery and remount. Recovery now uses a separate entry/release latch and preserves the movement path; only HUD vitals and the existing recovery effect update on success. Failed saves retain the existing transactional rollback/remount path.

FormationLayout declared five fixed grid tracks even when a relic details element created a sixth child. The fixed final track and clipped card could not contain the long summary and action footer. Cards now use natural vertical flow; actions precede optional details; details and summaries grow with wrapped content. The page alone scrolls vertically with navigation/safe-area clearance. Four columns and existing artwork/frame styles remain.

## Evidence

- regression.txt: 246/246 Node tests. Existing Build417 progression tests remain enabled.
- staged-regression.txt: same tests after applying the delivered ZIP to Build417.
- formation-dom-checks.json: actual FormationScreen HTML for home, chapterTwoField, first-chapter read-only and empty parties. Three of four populated cards have relic descriptions; all 12 edit buttons precede optional details, and read-only mode has no edit actions.
- runtime.diff / runtime-manifest.json: exactly six runtime files changed. No changes to combat stats, rewards, save schema, or online server files.

Field tests execute the game's Entity, pathfinding, ChapterTwoField tick, recovery transaction, party recovery and HUD updates. DOM boundaries are simulated; these tests are not real browser or device tests. All five region maps are exercised. Failed-save rollback and non-spring treasure contact are covered. Native first-chapter spring behavior is unchanged and keeps its route.

The browser session available for this work could not load the local validation URL (ERR_BLOCKED_BY_CLIENT in the preceding verification session). No browser/device render is claimed. HTML structure and authored CSS flow/priority were inspected; Safari's final pixel layout and touch behavior still need device confirmation.
