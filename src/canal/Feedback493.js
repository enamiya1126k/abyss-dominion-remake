import { CANAL492 } from './Rules492.js';

// Per-creature positions survive snapshots and captures. DOM hit areas and canvas
// always receive the same sample, including during short crowd rearrangements.
export function smoothLayout493(layout, ui, now) {
  const previous = ui.motion493 ?? new Map();
  const next = new Map();
  const result = layout.map(e => {
    const old = previous.get(e.id);
    const alpha = !old || ui.reduced ? 1 : 1 - Math.exp(-Math.max(0, now - old.at) / 65);
    const point = { x: old ? old.x + (e.x - old.x) * alpha : e.x,
      y: old ? old.y + (e.y - old.y) * alpha : e.y, at: now };
    next.set(e.id, point);
    return { ...e, x: point.x, y: point.y };
  });
  ui.motion493 = next;
  return result;
}

export function cooldown493(player, ui, serverAt, localAt) {
  const local = (ui.localFire ?? 0) > 0 ? CANAL492.fireMs - (localAt - ui.localFire) : 0;
  return Math.max(0, Math.min(CANAL492.fireMs, Math.max(local, (player?.nextFireAt ?? 0) - serverAt)));
}

export function sound493(client, value) {
  const enabled = value ?? client.cnSound493 ?? client.cnUI492?.sound ?? client.cnUI489?.sound ?? true;
  client.cnSound493 = enabled;
  if (client.cnUI492) client.cnUI492.sound = enabled;
  if (client.cnUI489) client.cnUI489.sound = enabled;
  return enabled;
}

export function lesson493(captured, seat, names) {
  return captured === 0 ? `${names[seat]}の「タップ！」を捕まえよう` :
    captured < 3 ? 'ザリガニは1回！ 捕獲で大網ゲージ＋1' :
    captured < 6 ? 'カメは3回・バスは2回。網は0.3秒ごと！' :
    '隣も援護！ 同じ生き物を協力して捕ると＋2';
}
