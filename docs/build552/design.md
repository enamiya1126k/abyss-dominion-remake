# Build552 — 人間ピンボール大運動会

8 / 16 shots run continuously on a single cabinet. Positions, velocity, equipment,
wall multiplier, charge, collected gems, chest timers and rotor phase persist at
every shot boundary. Only the final shot displays results.

Three gem identities use color, shape and Roman numerals together. Strike one of
each, then strike the crown to collect the growing shared jackpot. A jackpot
has a six-second recharge after a win and consumes only its winner's gems; the other players retain theirs. Ordinary gem
strikes grow the pot. Thirty-six gem strikes across all players start five seconds
of double scoring, with an explicit shared progress indicator.

Consecutive physical impacts within 2.3 seconds build a chain. Every third impact
adds an impulse and raises the chain scoring multiplier by 0.25 (up to ×2). Walls
still accumulate the separate equipment multiplier; charging, investment, dice
and collision-link abilities retain their roles. The rotating capsule transfers
its surface velocity to every body, including players still choosing or pulling.

The cabinet stays the same size during equipment selection. A fixed-height lower
control tray swaps between three illustrated choices and pull controls. The
renderer shows traveled trails and a short pull grip; it never predicts a path
or landing position. The selected RPG character remains the rider.

Artwork uses the built-in image generation skill: three new original PNGs
(cabinet texture, nine-object transparent atlas, lobby/finale illustration), plus
the existing twelve illustrated abilities and brass card frame from Build551.
Original source images are copied unchanged. Runtime source rectangles and CSS
compose the game; no raster postprocessing is applied.

Very high speed adds aerodynamic drag above 38 world units/s. MAX still launches
at the original strong speed, while collision chains no longer pin everyone at
the 95-unit safety cap. Bank equipment receives 15% interest per level on each
shot's earned points, in addition to its existing 12 × shot² × level dividend.
