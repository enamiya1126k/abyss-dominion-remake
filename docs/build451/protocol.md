# Race protocol 451

The existing authenticated party WebSocket advertises `monsterRaceV1`. A client uses `raceRequest451` with an `op`: status, create, join, select, start, bet, pass, leave, again, or ack. No separate connection or public unverified player ID is accepted.

`raceState451` contains public room state, the caller's identity, server clock, durable wager decisions and the caller's pending deliveries. Other players' tickets stay hidden through the parade. The server withholds finish times until race start and explicit order/results until finish. A caller can always see their own accepted ticket.

For purchase, the client atomically deducts the stake and saves the exact packet locally before sending. A race/player pair has one request ID. The server durably records acceptance or rejection before replying. A repeated request is idempotent; a mismatched amount never becomes another purchase. Rejections produce a durable refund receipt. The client never invents a refund after a transport timeout.

Result receipts combine ticket payout and owner prize and name the chosen owned monster. Receipt application and a consumed-ID marker share one native save; only then does the client ACK. Failed saves roll back, leave the escrow/receipt unconsumed and retry. The race/player receipt ID applies EXP and affection at most once. ACK loss, page reload and server restart preserve this behavior for the same local save and account.

The server persists the private result before betting starts. Draws use weighted sampling without replacement based on the published racing profiles and condition. Odds use the matching single or joint probability with a 90% return factor, floored to tenths. Payout arithmetic uses integer tenths to avoid floating point losing a GOLD at decimal boundaries. Player bets do not affect outcomes or odds. Local wager bounds are 1–1,000,000G; fixed ownership prize is 5,000G.

Server snapshots are atomic file replacements. Write failures roll back memory and expose unavailable state. Invalid persisted state is not overwritten. Successful retry clears temporary write errors. Auth keys are hashed in this race file. Empty rooms and abandoned lobby/result rooms can expire without deleting unacknowledged receipts.

This extends the existing local-save economy; it does not independently attest the full inventory or GOLD balance. It requires the original purchasing save for escrow reconciliation. Old record IDs remain in the receipt ledger to prevent replay. Server storage is bounded to 32MiB and fails closed at its bound. A future economy/server migration needs an explicit receipt-history retention strategy, not arbitrary deletion of unpaid or consumed IDs.
