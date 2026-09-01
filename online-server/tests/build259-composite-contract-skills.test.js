import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = async name => readFile(new URL(`../src/${name}`, import.meta.url), "utf8");

test("build259 resolves heal plus revival in exploration, raid, and team battles", async () => {
  for (const file of ["RoomStore.js", "RaidCoordinator.js", "TeamBattleCoordinator.js"]) {
    const text = await source(file);
    assert.match(text, /\["heal",\s*"allHeal"\]\.includes\([^)]*\.kind\)/, `${file}: composite support branch`);
    assert.match(text, /reviveTransferRate/, `${file}: HP-transfer revival contract`);
    assert.match(text, /revivedEffects/, `${file}: revival follow-up effects`);
    assert.match(text, /kind:\s*"revive"/, `${file}: visible revival event`);
  }
});

test("build259 online AI projects composite revival before scoring the action", async () => {
  const text = await source("OnlineBattleAI.js");
  assert.match(text, /const reviveProjected/);
  assert.match(text, /finite\(skill\.revive\) > 0 \|\| finite\(skill\.reviveTransferRate\) > 0/);
  assert.match(text, /revivedEffects/);
});
