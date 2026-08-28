const INTEGRATED_MESSAGE = "この機能は共同探索へ統合されました";

function integratedResponse() {
  return {
    ok: false,
    code: "RESONANCE_INTEGRATED",
    message: INTEGRATED_MESSAGE,
  };
}

function normalizeLegacyRoom(room) {
  if (!room) return;
  if (room.phase !== "resonance" && room.resonance == null) return;
  room.resonance = null;
  if (room.phase === "resonance") room.phase = room.expedition ? "expedition" : "lobby";
}

// Retained as a named export for old imports. Dedicated maze state is never
// exposed again; current room snapshots always describe ordinary exploration.
export function resonanceSnapshot() {
  return null;
}

// Compatibility adapter only. The former dedicated maze, global timer, battle
// and reward implementation was removed in build186. Old cached commands get a
// stable response and cannot replace or mutate the current expedition map.
export class ResonanceMazeCoordinator {
  constructor() {}

  start(room) {
    normalizeLegacyRoom(room);
    return integratedResponse();
  }

  move(room) {
    normalizeLegacyRoom(room);
    return integratedResponse();
  }

  action(room) {
    normalizeLegacyRoom(room);
    return integratedResponse();
  }

  playerLeft() {}

  advance() {}

  tick() {}
}
