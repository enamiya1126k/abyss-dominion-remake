import { chopMaterial487 } from './Presentation487.js';
import { CABBAGE484 as RULES, tap484 } from './Rules484.js';

// Run the exact server rules on a copy. Scores sent by the server remain authoritative.
export function predict486(game, player, pending = []) {
  if (!player) return null;
  const local = { ...player };
  for (const input of pending) if (input.seq > (player.lastSeq ?? 0)) tap484(game, local, input, input.at);
  return local;
}

export function acknowledge486(ui, player, now) {
  ui.pending = ui.pending.filter(input => input.seq > (player.lastSeq ?? 0) && input.at >= now - RULES.maxAge - (input.sentAt486 == null ? 0 : 1500));
  ui.sequence = Math.max(ui.sequence, player.lastSeq ?? 0);
}

// Send fresh taps first. Repeatedly sending only the oldest unacknowledged eight
// starved later inputs when both thumbs were moving faster than the network.
export function flush486(client, ui, game, now) {
  if (!game || !client.connected() || now - ui.lastFlush < 80) return;
  const fresh = ui.pending.filter(input => input.sentAt486 == null);
  const batch = (fresh.length ? fresh : ui.pending.filter(input => now - input.sentAt486 >= 350)).slice(0, RULES.maxBatch);
  if (!batch.length) return;
  const sent = client.raw('cabbageTap484', { gameId: game.id, taps: batch.map(({ seq, side, at }) => ({ seq, side, at })) });
  if (sent === false) return;
  ui.lastFlush = now;
  for (const input of batch) input.sentAt486 = now;
}

export function material486(player, signal) {
  const damage = Math.max(0, player?.boardDamage ?? 0);
  return { ...chopMaterial487(player?.cuts ?? 0), board: Math.min(7, damage), damage };
}

// Shared by cabbage and canal. Safari touch completion is guarded at document capture.
export { lockPlayZoom498 as lockPlayZoom486 } from './Zoom498.js';

// Track every pointer, including the second thumb. A follow-up click must not cut twice.
export function bindPads486(root, onTap, supportsPointer = !!globalThis.PointerEvent) {
  const pointers = new Set();
  const pad = event => event.target.closest?.('[data-cb-side]');
  const down = event => {
    const button = pad(event);
    if (!button || button.disabled || event.button > 0 || pointers.has(event.pointerId)) return;
    event.preventDefault();
    pointers.add(event.pointerId);
    try { button.setPointerCapture?.(event.pointerId); } catch { /* The view may have just changed. */ }
    onTap(button.dataset.cbSide);
  };
  const up = event => pointers.delete(event.pointerId);
  const touch = event => {
    for (const point of event.changedTouches ?? []) {
      const button = point.target.closest?.('[data-cb-side]');
      if (button && !button.disabled) { event.preventDefault(); onTap(button.dataset.cbSide); }
    }
  };
  const menu = event => { if (pad(event)) event.preventDefault(); };
  if (supportsPointer) {
    root.addEventListener('pointerdown', down, { passive: false });
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
    root.addEventListener('lostpointercapture', up);
  } else root.addEventListener('touchstart', touch, { passive: false });
  root.addEventListener('contextmenu', menu);
  const blur = () => pointers.clear();
  globalThis.addEventListener?.('blur', blur);
  return () => {
    root.removeEventListener('pointerdown', down);
    root.removeEventListener('pointerup', up);
    root.removeEventListener('pointercancel', up);
    root.removeEventListener('lostpointercapture', up);
    root.removeEventListener('touchstart', touch);
    root.removeEventListener('contextmenu', menu);
    globalThis.removeEventListener?.('blur', blur);
    pointers.clear();
  };
}
