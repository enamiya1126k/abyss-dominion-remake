# Build457 technical notes

## UI

The prediction desk renders three exclusive panels: observation, field comparison and ticket. Hidden panels retain every prior information item. RaceClient451 retains draft kind/picks/amount while switching tabs. A comparison row selects and pins the observed monster. Opening newspaper/evaluation details pins the current parade participant. The native parade artwork and sprite references remain unchanged.

The new broadcast adds current ordered lane badges, own position, distance and full/follow presentation. Follow maps a350m window around the leader into the same track; ranks and remaining distance use authoritative unscaled progress. No camera operation sends a race-control command. Committed photo finish replay has priority over the follow projection. Added visual loops honor reduced motion. Styles use the existing art palette without generated/replaced monster sprites.

Observed full prediction content heights at393px were852px (observation, viewport floor),888px (comparison) and980px (ticket) in the recorded test case. This is not a promise for all names, font settings or expanded details. Information no longer occupies a single long page. Width checks covered320/393/709/1280px. Expanded details and text remain scrollable.

## Rule version5

Existing versions1–4 retain their ticket/forecast/simulation rules. A newly created room advertises5; older clients cannot join version5. The simulation snapshot records version5 only when the entrants use it. Existing snapshots without a version fall back to version4 behavior. Version4 keeps its2200ms cooldown and single1.18 multiplier.

For version5 each accepted tap costs10 stamina and creates an independent1400ms expiry. Speed multiplier is1 +0.18 × active windows, capped by the total five accepted taps. There is no minimum gap between taps. Old auto timing is retained for old rooms; version5 AI selects a deterministic species-based opening/split/finishing schedule. Forecast trials use these same rules and standard AI timing; actual human timing remains an uncertainty.

The client stores a cumulative desired sequence, sends it immediately and may accept another tap before receiving an acknowledgement. Remaining uses are max(server accepted, local desired), and displayed stamina reserves the cost of unacknowledged inputs. It does not predict finishing position. The server derives the owner from the authenticated session and applies only the unaccepted suffix of an intent. Duplicate or older totals are no-ops. A total above5, invalid race, finished runner, or insufficient stamina is rejected. The existing transaction restores the complete snapshot on failure, so a rejected multi-tap intent cannot be partially charged. Retries use the same cumulative total. Once acknowledgements arrive, accepted state replaces reserved state without double subtraction.

The previous generation of pending commands still works in version4. Error replies include race and sequence so an older rejected command does not cancel a newer pending total. Reconnect preserves accepted windows in the server snapshot, and pending intents retry through the existing connection flow. Result receipts/wallet debit/training code remains unchanged.

## Verification

-47 automated tests including the prior40 regression checks.
- Same-seed burst/split/finish timing produces different real finishing times.
- Individual expiry, +90% ceiling, exactly50 stamina for five simultaneous taps.
- Duplicate/reordered cumulative totals and restart preserve exact accepted cost.
- Failed save/insufficient stamina roll back a whole cumulative intent.
- Four native authenticated browser clients buy new ticket kinds, restart the actual server during the race, complete the race and receive each reward once.
- Four immediate programmatic taps execute before any reply can be handled (recorded3.7ms), while a separate real touchscreen test presses all five uses without a forced wait. These are local test observations, not public-network latency guarantees.
- Camera changes display coordinates only, with all8 rank badges retained; reduced motion disables extra loops.

The browser uses localhost-only routing and temporary server state. No live site, GitHub branch or production save is modified. Physical Safari and missing unchanged base sprites are not claimed as tested. The font used for Japanese layout checks is Noto Sans CJK JP.
