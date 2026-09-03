import test from "node:test";
import assert from "node:assert/strict";

import { SAVE_KEY } from "../src/core/config.js";
import { SaveService } from "../src/services/SaveService.js";

class MemoryStorage {
  constructor() {
    this.values = new Map();
    this.writeCount = 0;
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.writeCount += 1;
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
    this.writeCount = 0;
  }
}

const previousStorage = globalThis.localStorage;
const storage = new MemoryStorage();
globalThis.localStorage = storage;

test.after(() => {
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
});

function freshService() {
  storage.clear();
  return new SaveService();
}

test("Build311 protects malformed save JSON from constructor and later save writes", () => {
  storage.clear();
  const malformed = '{"player":{"gold":987654},"campaign100":';
  storage.values.set(SAVE_KEY, malformed);
  const writesBeforeLoad = storage.writeCount;
  const previousError = console.error;
  let service;

  try {
    console.error = () => {};
    service = new SaveService();
  } finally {
    console.error = previousError;
  }

  assert.equal(service.loadFailed, true);
  assert.equal(service.lastLoadError?.name, "SyntaxError");
  assert.equal(storage.writeCount, writesBeforeLoad, "startup fallback must not auto-save over unreadable bytes");
  assert.equal(storage.getItem(SAVE_KEY), malformed);

  service.state.player.gold = 1;
  assert.equal(service.save(), false, "ordinary autosave remains blocked for the fallback state");
  assert.equal(service.lastSaveError?.name, "RecoveryProtectedError");
  assert.equal(storage.writeCount, writesBeforeLoad);
  assert.equal(storage.getItem(SAVE_KEY), malformed, "the exact recoverable payload remains available to the player");
});

test("Build311 also protects syntactically valid primitive save payloads", () => {
  for (const primitive of ["null", "false", "42", '"old-save"']) {
    storage.clear();
    storage.values.set(SAVE_KEY, primitive);
    const previousError = console.error;
    let service;
    try {
      console.error = () => {};
      service = new SaveService();
    } finally {
      console.error = previousError;
    }

    assert.equal(service.loadFailed, true, `${primitive} is not a valid save object`);
    assert.equal(service.save(), false);
    assert.equal(service.lastSaveError?.name, "RecoveryProtectedError");
    assert.equal(storage.getItem(SAVE_KEY), primitive, "the original primitive remains recoverable");
  }
});

test("Build311 drops a malformed active battle while preserving the loaded player", () => {
  const seed = freshService();
  const state = structuredClone(seed.state);
  const originalMonsterId = state.monsters[0].id;
  state.player.gold = 543_210;
  state.player.crystals = 876;
  state.player.maxFloor = 42;
  state.player.currentFloor = 42;
  state.player.inRun = true;
  state.activeBattle = {
    floor: 42,
    turn: 7,
    enemies: "not-an-enemy-array",
  };
  storage.values.set(SAVE_KEY, JSON.stringify(state));

  const recovered = new SaveService();

  assert.equal(recovered.loadFailed, false);
  assert.equal(recovered.state.player.gold, 543_210);
  assert.equal(recovered.state.player.crystals, 876);
  assert.equal(recovered.state.player.maxFloor, 42);
  assert.equal(recovered.state.player.currentFloor, 42);
  assert.equal(recovered.state.monsters.some(monster => monster.id === originalMonsterId), true);
  assert.equal(Object.hasOwn(recovered.state, "activeBattle"), false);
  assert.equal(recovered.state.player.inRun, false, "a run without a usable field snapshot is ended safely");
  assert.equal(recovered.state.expeditionSnapshot, null);
  assert.deepEqual(
    {
      version: recovered.state.lastBattleRecovery?.version,
      reason: recovered.state.lastBattleRecovery?.reason,
      snapshotRetained: recovered.state.lastBattleRecovery?.snapshotRetained,
    },
    { version: 1, reason: "malformed-active-battle", snapshotRetained: false },
  );

  const persisted = JSON.parse(storage.getItem(SAVE_KEY));
  assert.equal(persisted.player.gold, 543_210);
  assert.equal(Object.hasOwn(persisted, "activeBattle"), false, "the repaired checkpoint is what subsequent reloads see");
});
