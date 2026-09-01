import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = async name => readFile(new URL(`../src/${name}`, import.meta.url), "utf8");

test("build259 preserves self-only targeting across the client/server DTO boundary", async () => {
  const room = await source("RoomStore.js");
  const client = await readFile(new URL("../../src/ui/screens/OnlinePartyScreen.js", import.meta.url), "utf8");
  assert.match(client, /selfOnly:\s*Boolean\(skill\.selfOnly\s*\|\|\s*skill\.target\s*===\s*\"自分\"\)/);
  assert.match(room, /selfOnly:bool\(item\?\.selfOnly\|\|item\?\.target===\"自分\"\)/);
});

test("build259 rejects manual ally targets and makes AUTO target the caster", async () => {
  for (const file of ["RoomStore.js", "RaidCoordinator.js", "TeamBattleCoordinator.js"]) {
    const text = await source(file);
    assert.match(text, /SELF_ONLY/, `${file}: manual validation`);
  }
  const ai = await source("OnlineBattleAI.js");
  assert.match(ai, /support\.skill\.selfOnly \? player\.playerId/);
  assert.match(ai, /cleanse\.selfOnly \? player\.playerId/);
});
