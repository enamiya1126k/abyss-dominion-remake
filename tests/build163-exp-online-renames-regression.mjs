import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMonster, displayName } from "../src/models/Monster.js?v=2.10.0-build163";
import { consumeExperiencePacks } from "../src/core/ExperiencePackSystem.js?v=2.10.0-build163";
import { SPECIES } from "../src/data/species.js?v=2.10.0-build163";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("renamed characters keep stable IDs and old saves resolve to the new display names", () => {
  const names = {
    ai: ["アイクシア", "アイ"], kiara: ["セラフィナ", "きあら"], roxy: ["ネレイア", "ロキシー"],
    eris: ["イリディア", "エリス"], milim: ["ミルヴァ", "ミリム"], golden_darkness: ["宵金のノクティア", "金色の闇"],
  };
  for (const [speciesId, [next, legacy]] of Object.entries(names)) {
    assert.equal(SPECIES[speciesId].name, next);
    assert.equal(SPECIES[speciesId].legacyName, legacy);
    assert.equal(displayName({ speciesId, nickname: legacy }), next);
    assert.equal(displayName({ speciesId, nickname: "自分で付けた名前" }), "自分で付けた名前");
  }
});

test("experience packs can level a defeated ally without reviving it", () => {
  const monster = createMonster("roxy", { level: 12, nickname: "ロキシー", currentHp: 0, currentMp: 0 });
  const inventory = { experienceItems: 25 };
  const beforeLevel = monster.level;
  const result = consumeExperiencePacks(monster, 10, inventory);
  assert.equal(result.ok, true);
  assert.equal(result.count, 10);
  assert.equal(inventory.experienceItems, 15);
  assert.ok(monster.level >= beforeLevel);
  assert.equal(monster.currentHp, 0);
});

test("premium target UI keeps defeated allies enabled and previews bulk use", async () => {
  const [main, styles] = await Promise.all([read("src/main.js"), read("src/Styles/build163.css")]);
  assert.match(main, /class="experience-pack-target \$\{dead\?"is-defeated":""\}"/);
  assert.match(main, /dead\?"戦闘不能・使用可能":"育成対象"/);
  assert.match(main, /type!=="experienceItems"&&target\.currentHp<=0/);
  assert.match(main, /wasDefeated\?0:/);
  assert.match(main, /previewExperiencePacks\(target,input\.value,owned\)/);
  assert.match(styles, /\.experience-pack-target-modal/);
  assert.match(styles, /\.experience-pack-target\.is-defeated:not\(:disabled\)/);
});

test("online entry and room stages have independent mobile scroll contracts", async () => {
  const [styles, client, screen] = await Promise.all([
    read("src/Styles/build163.css"), read("src/online/OnlinePartyClient.js"), read("src/ui/screens/OnlinePartyScreen.js"),
  ]);
  assert.match(styles, /\.online-v3-screen\{[^}]*height:100%[^}]*overflow-y:auto[^}]*touch-action:pan-y/);
  assert.match(styles, /\.online-v3-stage\{[^}]*touch-action:pan-y/);
  assert.match(client, /this\.connectionStep !== step/);
  assert.match(client, /stage\.scrollTop = 0/);
  assert.equal((screen.match(/data-online-route=/g) ?? []).length, 5);
});
